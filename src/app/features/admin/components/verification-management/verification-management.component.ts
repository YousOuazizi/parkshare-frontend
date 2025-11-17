import { Component, OnInit, signal, computed, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { AdminService } from '../../services/admin.service';
import { VerificationDocument, DocumentType, DocumentStatus } from '../../../../core/models/verification.model';
import { VerificationLevel } from '../../../../core/models/user.model';

interface FilterForm {
  search: FormControl<string | null>;
  status: FormControl<DocumentStatus | null>;
  type: FormControl<DocumentType | null>;
  level: FormControl<VerificationLevel | null>;
}

interface RejectForm {
  rejectionReason: FormControl<string>;
}

@Component({
  selector: 'app-verification-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCheckboxModule,
    MatDialogModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatExpansionModule
  ],
  templateUrl: './verification-management.component.html',
  styleUrls: ['./verification-management.component.scss']
})
export class VerificationManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Signals
  documents = signal<VerificationDocument[]>([]);
  selectedDocument = signal<VerificationDocument | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  totalDocuments = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);

  // Table configuration
  displayedColumns: string[] = [
    'select',
    'userId',
    'type',
    'status',
    'uploadedAt',
    'reviewedAt',
    'actions'
  ];

  dataSource = new MatTableDataSource<VerificationDocument>();
  selection = new SelectionModel<VerificationDocument>(true, []);

  // Filter form
  filterForm = new FormGroup<FilterForm>({
    search: new FormControl<string>(''),
    status: new FormControl<DocumentStatus | null>(DocumentStatus.PENDING),
    type: new FormControl<DocumentType | null>(null),
    level: new FormControl<VerificationLevel | null>(null)
  });

  // Reject form
  rejectForm = new FormGroup<RejectForm>({
    rejectionReason: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] })
  });

  // Enum references for template
  DocumentType = DocumentType;
  DocumentStatus = DocumentStatus;
  VerificationLevel = VerificationLevel;

  // Status options
  statusOptions = [
    { value: DocumentStatus.PENDING, label: 'Pending' },
    { value: DocumentStatus.APPROVED, label: 'Approved' },
    { value: DocumentStatus.REJECTED, label: 'Rejected' }
  ];

  // Type options
  typeOptions = [
    { value: DocumentType.PASSPORT, label: 'Passport' },
    { value: DocumentType.NATIONAL_ID, label: 'National ID' },
    { value: DocumentType.DRIVER_LICENSE, label: 'Driver License' },
    { value: DocumentType.ADDRESS_PROOF, label: 'Address Proof' },
    { value: DocumentType.SELFIE, label: 'Selfie' }
  ];

  // Level options
  levelOptions = [
    { value: VerificationLevel.LEVEL_1, label: 'Level 1' },
    { value: VerificationLevel.LEVEL_2, label: 'Level 2' },
    { value: VerificationLevel.LEVEL_3, label: 'Level 3' },
    { value: VerificationLevel.LEVEL_4, label: 'Level 4' }
  ];

  // Computed values
  hasSelection = computed(() => this.selection.selected.length > 0);
  selectionCount = computed(() => this.selection.selected.length);
  pendingCount = computed(() =>
    this.documents().filter(d => d.status === DocumentStatus.PENDING).length
  );

  ngOnInit(): void {
    this.loadDocuments();
    this.setupFilterListeners();
  }

  /**
   * Load verification documents from API
   */
  loadDocuments(): void {
    this.loading.set(true);
    this.error.set(null);

    const params = {
      page: this.currentPage() + 1,
      limit: this.pageSize(),
      status: this.filterForm.value.status || undefined,
      level: this.filterForm.value.level || undefined
    };

    this.adminService.getVerificationQueue(params).subscribe({
      next: (response) => {
        this.documents.set(response.documents);
        this.totalDocuments.set(response.total);
        this.dataSource.data = response.documents;
        this.loading.set(false);
        this.selection.clear();
      },
      error: (err) => {
        this.error.set('Failed to load verification documents. Please try again.');
        this.loading.set(false);
        console.error('Error loading documents:', err);
      }
    });
  }

  /**
   * Setup filter form listeners with debounce
   */
  private setupFilterListeners(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage.set(0);
        this.loadDocuments();
      });
  }

  /**
   * Handle page change
   */
  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadDocuments();
  }

  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      status: DocumentStatus.PENDING,
      type: null,
      level: null
    });
  }

  /**
   * Check if all rows are selected
   */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /**
   * Toggle all rows selection
   */
  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  /**
   * View document details
   */
  viewDocument(document: VerificationDocument): void {
    this.selectedDocument.set(document);
  }

  /**
   * Close document viewer
   */
  closeViewer(): void {
    this.selectedDocument.set(null);
  }

  /**
   * Approve document
   */
  approveDocument(document: VerificationDocument): void {
    this.adminService.reviewDocument(document.id, {
      status: DocumentStatus.APPROVED
    }).subscribe({
      next: () => {
        this.loadDocuments();
        if (this.selectedDocument()?.id === document.id) {
          this.closeViewer();
        }
      },
      error: (err) => {
        console.error('Error approving document:', err);
        alert('Failed to approve document. Please try again.');
      }
    });
  }

  /**
   * Reject document
   */
  rejectDocument(document: VerificationDocument): void {
    if (this.rejectForm.invalid) {
      alert('Please provide a rejection reason.');
      return;
    }

    const rejectionReason = this.rejectForm.value.rejectionReason;
    if (!rejectionReason) return;

    this.adminService.reviewDocument(document.id, {
      status: DocumentStatus.REJECTED,
      rejectionReason
    }).subscribe({
      next: () => {
        this.loadDocuments();
        if (this.selectedDocument()?.id === document.id) {
          this.closeViewer();
        }
        this.rejectForm.reset();
      },
      error: (err) => {
        console.error('Error rejecting document:', err);
        alert('Failed to reject document. Please try again.');
      }
    });
  }

  /**
   * Bulk approve selected documents
   */
  bulkApprove(): void {
    const selectedIds = this.selection.selected.map(d => d.id);
    if (!confirm(`Are you sure you want to approve ${selectedIds.length} documents?`)) {
      return;
    }

    this.adminService.bulkApproveDocuments(selectedIds).subscribe({
      next: (response) => {
        alert(`Successfully approved ${response.count} documents.`);
        this.loadDocuments();
      },
      error: (err) => {
        console.error('Error bulk approving documents:', err);
        alert('Failed to approve documents. Please try again.');
      }
    });
  }

  /**
   * Bulk reject selected documents
   */
  bulkReject(): void {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    const selectedIds = this.selection.selected.map(d => d.id);
    if (!confirm(`Are you sure you want to reject ${selectedIds.length} documents?`)) {
      return;
    }

    this.adminService.bulkRejectDocuments(selectedIds, reason).subscribe({
      next: (response) => {
        alert(`Successfully rejected ${response.count} documents.`);
        this.loadDocuments();
      },
      error: (err) => {
        console.error('Error bulk rejecting documents:', err);
        alert('Failed to reject documents. Please try again.');
      }
    });
  }

  /**
   * Get status chip color
   */
  getStatusColor(status: DocumentStatus): string {
    switch (status) {
      case DocumentStatus.PENDING:
        return 'accent';
      case DocumentStatus.APPROVED:
        return 'success';
      case DocumentStatus.REJECTED:
        return 'warn';
      default:
        return 'default';
    }
  }

  /**
   * Get document type icon
   */
  getDocumentTypeIcon(type: DocumentType): string {
    switch (type) {
      case DocumentType.PASSPORT:
        return 'flight_takeoff';
      case DocumentType.NATIONAL_ID:
        return 'badge';
      case DocumentType.DRIVER_LICENSE:
        return 'directions_car';
      case DocumentType.ADDRESS_PROOF:
        return 'home';
      case DocumentType.SELFIE:
        return 'face';
      default:
        return 'description';
    }
  }

  /**
   * Format date
   */
  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Track by function for table optimization
   */
  trackByDocumentId(index: number, document: VerificationDocument): string {
    return document.id;
  }
}
