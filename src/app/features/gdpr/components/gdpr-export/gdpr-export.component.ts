import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

import { GdprService } from '../../services/gdpr.service';
import { DataExportRequest, DataExportStatus } from '../../../../core/models/gdpr.model';

interface DataCategory {
  id: string;
  label: string;
  description: string;
  icon: string;
  selected: boolean;
}

interface ExportFormat {
  id: string;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-gdpr-export',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatRadioModule
  ],
  templateUrl: './gdpr-export.component.html',
  styleUrls: ['./gdpr-export.component.scss']
})
export class GdprExportComponent implements OnInit {
  private gdprService = inject(GdprService);
  private snackBar = inject(MatSnackBar);

  // Signals for state management
  exportRequests = signal<DataExportRequest[]>([]);
  dataCategories = signal<DataCategory[]>([
    {
      id: 'profile',
      label: 'Profile Information',
      description: 'Personal details, contact information, preferences',
      icon: 'person',
      selected: true
    },
    {
      id: 'bookings',
      label: 'Booking History',
      description: 'All parking reservations and bookings',
      icon: 'event',
      selected: true
    },
    {
      id: 'payments',
      label: 'Payment Records',
      description: 'Transaction history and payment methods',
      icon: 'payment',
      selected: true
    },
    {
      id: 'parkings',
      label: 'Parking Spots',
      description: 'Listed parking spots and availability',
      icon: 'local_parking',
      selected: true
    },
    {
      id: 'reviews',
      label: 'Reviews',
      description: 'Reviews given and received',
      icon: 'rate_review',
      selected: false
    },
    {
      id: 'swaps',
      label: 'Swap History',
      description: 'Parking swap offers and exchanges',
      icon: 'swap_horiz',
      selected: false
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      description: 'Active and past subscription plans',
      icon: 'card_membership',
      selected: false
    },
    {
      id: 'consents',
      label: 'Consent Records',
      description: 'GDPR consent history',
      icon: 'privacy_tip',
      selected: false
    }
  ]);

  exportFormats: ExportFormat[] = [
    {
      id: 'json',
      label: 'JSON',
      description: 'Machine-readable format',
      icon: 'code'
    },
    {
      id: 'csv',
      label: 'CSV',
      description: 'Spreadsheet format',
      icon: 'table_chart'
    }
  ];

  selectedFormat = signal<string>('json');
  loading = signal<boolean>(false);
  requesting = signal<boolean>(false);
  error = signal<string | null>(null);

  // Table columns
  displayedColumns: string[] = ['status', 'requestDate', 'downloadUrl', 'expiresAt', 'actions'];

  // Expose enum for template
  DataExportStatus = DataExportStatus;

  ngOnInit(): void {
    this.loadExportRequests();
  }

  loadExportRequests(): void {
    this.loading.set(true);
    this.error.set(null);

    this.gdprService.getDataExportRequests().subscribe({
      next: (requests) => {
        this.exportRequests.set(requests);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load export requests');
        this.loading.set(false);
        this.showSnackBar('Failed to load export requests', 'error');
      }
    });
  }

  toggleCategory(category: DataCategory): void {
    const categories = this.dataCategories();
    const updatedCategories = categories.map(cat =>
      cat.id === category.id ? { ...cat, selected: !cat.selected } : cat
    );
    this.dataCategories.set(updatedCategories);
  }

  toggleAllCategories(selected: boolean): void {
    const categories = this.dataCategories();
    const updatedCategories = categories.map(cat => ({ ...cat, selected }));
    this.dataCategories.set(updatedCategories);
  }

  areAllCategoriesSelected(): boolean {
    return this.dataCategories().every(cat => cat.selected);
  }

  areSomeCategoriesSelected(): boolean {
    const categories = this.dataCategories();
    return categories.some(cat => cat.selected) && !this.areAllCategoriesSelected();
  }

  getSelectedCategoriesCount(): number {
    return this.dataCategories().filter(cat => cat.selected).length;
  }

  requestExport(): void {
    const selectedCategories = this.dataCategories().filter(cat => cat.selected);

    if (selectedCategories.length === 0) {
      this.showSnackBar('Please select at least one data category', 'info');
      return;
    }

    this.requesting.set(true);

    // Note: The API currently doesn't support categories or format parameters
    // This is a simplified implementation
    this.gdprService.requestDataExport().subscribe({
      next: (request) => {
        this.requesting.set(false);
        this.showSnackBar('Data export request submitted successfully', 'success');
        this.loadExportRequests();
      },
      error: (error) => {
        this.requesting.set(false);
        this.showSnackBar('Failed to request data export', 'error');
      }
    });
  }

  downloadExport(request: DataExportRequest): void {
    if (request.status !== DataExportStatus.COMPLETED || !request.downloadUrl) {
      this.showSnackBar('Export is not ready for download', 'info');
      return;
    }

    this.gdprService.downloadDataExport(request.id).subscribe({
      next: () => {
        this.showSnackBar('Download started successfully', 'success');
      },
      error: (error) => {
        this.showSnackBar('Failed to download export', 'error');
      }
    });
  }

  getStatusIcon(status: DataExportStatus): string {
    switch (status) {
      case DataExportStatus.PENDING:
        return 'schedule';
      case DataExportStatus.PROCESSING:
        return 'sync';
      case DataExportStatus.COMPLETED:
        return 'check_circle';
      case DataExportStatus.FAILED:
        return 'error';
      case DataExportStatus.EXPIRED:
        return 'event_busy';
      default:
        return 'help';
    }
  }

  getStatusColor(status: DataExportStatus): string {
    switch (status) {
      case DataExportStatus.PENDING:
        return 'pending';
      case DataExportStatus.PROCESSING:
        return 'processing';
      case DataExportStatus.COMPLETED:
        return 'completed';
      case DataExportStatus.FAILED:
        return 'failed';
      case DataExportStatus.EXPIRED:
        return 'expired';
      default:
        return 'default';
    }
  }

  getStatusLabel(status: DataExportStatus): string {
    switch (status) {
      case DataExportStatus.PENDING:
        return 'Pending';
      case DataExportStatus.PROCESSING:
        return 'Processing';
      case DataExportStatus.COMPLETED:
        return 'Completed';
      case DataExportStatus.FAILED:
        return 'Failed';
      case DataExportStatus.EXPIRED:
        return 'Expired';
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

  isExpiringSoon(request: DataExportRequest): boolean {
    if (!request.expiresAt) return false;

    const expiresAt = new Date(request.expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;
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
