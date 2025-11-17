import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { GdprService } from '../../services/gdpr.service';
import { DataDeletionRequest, DataDeletionStatus } from '../../../../core/models/gdpr.model';
import { GdprDeleteConfirmDialogComponent } from './gdpr-delete-confirm-dialog.component';

interface DeletionReason {
  id: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-gdpr-delete',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './gdpr-delete.component.html',
  styleUrls: ['./gdpr-delete.component.scss']
})
export class GdprDeleteComponent implements OnInit {
  private gdprService = inject(GdprService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  // Signals for state management
  deletionRequests = signal<DataDeletionRequest[]>([]);
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  error = signal<string | null>(null);
  currentStep = signal<number>(0);

  // Forms
  reasonForm!: FormGroup;
  authForm!: FormGroup;

  // Deletion reasons
  deletionReasons: DeletionReason[] = [
    {
      id: 'no_longer_needed',
      label: 'No Longer Need the Service',
      description: 'I no longer require parking services'
    },
    {
      id: 'privacy_concerns',
      label: 'Privacy Concerns',
      description: 'I am concerned about my data privacy'
    },
    {
      id: 'switching_service',
      label: 'Switching to Another Service',
      description: 'I am moving to a different parking service provider'
    },
    {
      id: 'too_expensive',
      label: 'Too Expensive',
      description: 'The service is too costly for my needs'
    },
    {
      id: 'poor_experience',
      label: 'Poor User Experience',
      description: 'I am not satisfied with the service quality'
    },
    {
      id: 'other',
      label: 'Other Reason',
      description: 'A reason not listed above'
    }
  ];

  // Consequences list
  consequences: string[] = [
    'All your personal data will be permanently deleted',
    'You will lose access to all active parking spots and bookings',
    'Any pending payments or refunds will be processed before deletion',
    'Your reviews and ratings will be anonymized',
    'You will not be able to recover your account or data',
    'This action cannot be undone'
  ];

  // Expose enum for template
  DataDeletionStatus = DataDeletionStatus;

  ngOnInit(): void {
    this.initializeForms();
    this.loadDeletionRequests();
  }

  private initializeForms(): void {
    this.reasonForm = this.fb.group({
      reason: ['', Validators.required],
      additionalComments: ['']
    });

    this.authForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  loadDeletionRequests(): void {
    this.loading.set(true);
    this.error.set(null);

    this.gdprService.getDataDeletionRequests().subscribe({
      next: (requests) => {
        this.deletionRequests.set(requests);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load deletion requests');
        this.loading.set(false);
        this.showSnackBar('Failed to load deletion requests', 'error');
      }
    });
  }

  hasPendingRequest(): boolean {
    return this.deletionRequests().some(
      req => req.status === DataDeletionStatus.PENDING ||
             req.status === DataDeletionStatus.APPROVED ||
             req.status === DataDeletionStatus.IN_PROGRESS
    );
  }

  nextStep(): void {
    if (this.currentStep() === 0 && this.reasonForm.invalid) {
      this.showSnackBar('Please select a reason for deletion', 'info');
      return;
    }

    if (this.currentStep() === 1 && this.authForm.invalid) {
      this.showSnackBar('Please enter your password', 'info');
      return;
    }

    if (this.currentStep() < 2) {
      this.currentStep.set(this.currentStep() + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  openConfirmationDialog(): void {
    const dialogRef = this.dialog.open(GdprDeleteConfirmDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        reason: this.reasonForm.get('reason')?.value,
        additionalComments: this.reasonForm.get('additionalComments')?.value
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.submitDeletionRequest();
      }
    });
  }

  private submitDeletionRequest(): void {
    this.submitting.set(true);

    const reasonId = this.reasonForm.get('reason')?.value;
    const additionalComments = this.reasonForm.get('additionalComments')?.value;

    const reason = this.deletionReasons.find(r => r.id === reasonId);
    const fullReason = additionalComments
      ? `${reason?.label}: ${additionalComments}`
      : reason?.label;

    this.gdprService.requestDataDeletion(fullReason).subscribe({
      next: (request) => {
        this.submitting.set(false);
        this.showSnackBar('Account deletion request submitted successfully', 'success');
        this.resetForms();
        this.currentStep.set(0);
        this.loadDeletionRequests();
      },
      error: (error) => {
        this.submitting.set(false);
        this.showSnackBar('Failed to submit deletion request', 'error');
      }
    });
  }

  private resetForms(): void {
    this.reasonForm.reset();
    this.authForm.reset();
  }

  cancelRequest(): void {
    this.resetForms();
    this.currentStep.set(0);
  }

  getStatusIcon(status: DataDeletionStatus): string {
    switch (status) {
      case DataDeletionStatus.PENDING:
        return 'schedule';
      case DataDeletionStatus.APPROVED:
        return 'check_circle';
      case DataDeletionStatus.REJECTED:
        return 'cancel';
      case DataDeletionStatus.IN_PROGRESS:
        return 'sync';
      case DataDeletionStatus.COMPLETED:
        return 'done_all';
      default:
        return 'help';
    }
  }

  getStatusColor(status: DataDeletionStatus): string {
    switch (status) {
      case DataDeletionStatus.PENDING:
        return 'pending';
      case DataDeletionStatus.APPROVED:
        return 'approved';
      case DataDeletionStatus.REJECTED:
        return 'rejected';
      case DataDeletionStatus.IN_PROGRESS:
        return 'in-progress';
      case DataDeletionStatus.COMPLETED:
        return 'completed';
      default:
        return 'default';
    }
  }

  getStatusLabel(status: DataDeletionStatus): string {
    switch (status) {
      case DataDeletionStatus.PENDING:
        return 'Pending Review';
      case DataDeletionStatus.APPROVED:
        return 'Approved';
      case DataDeletionStatus.REJECTED:
        return 'Rejected';
      case DataDeletionStatus.IN_PROGRESS:
        return 'In Progress';
      case DataDeletionStatus.COMPLETED:
        return 'Completed';
      default:
        return 'Unknown';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private showSnackBar(
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    duration: number = 3000
  ): void {
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`]
    });
  }
}
