import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { Payment, PaymentStatus, PaymentMethod } from '../../../../core/models/payment.model';

interface PaymentFilters {
  startDate: Date | null;
  endDate: Date | null;
  status: PaymentStatus | 'ALL';
}

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.scss']
})
export class PaymentListComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private router = inject(Router);

  // Signals for state management
  payments = signal<Payment[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Pagination
  pageSize = signal<number>(10);
  pageIndex = signal<number>(0);
  totalPayments = computed(() => this.filteredPayments().length);

  // Filter form
  filterForm = new FormGroup({
    startDate: new FormControl<Date | null>(null),
    endDate: new FormControl<Date | null>(null),
    status: new FormControl<PaymentStatus | 'ALL'>('ALL')
  });

  // Computed filtered and paginated payments
  filteredPayments = computed(() => {
    const filters = this.filterForm.value;
    let filtered = this.payments();

    // Filter by status
    if (filters.status && filters.status !== 'ALL') {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(p => new Date(p.createdAt) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(p => new Date(p.createdAt) <= endDate);
    }

    return filtered;
  });

  paginatedPayments = computed(() => {
    const filtered = this.filteredPayments();
    const startIndex = this.pageIndex() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return filtered.slice(startIndex, endIndex);
  });

  // Table configuration
  displayedColumns: string[] = ['date', 'booking', 'amount', 'method', 'status', 'actions'];

  // Status and payment method enums for template
  paymentStatuses = Object.values(PaymentStatus);
  paymentMethods = Object.values(PaymentMethod);

  ngOnInit(): void {
    this.loadPayments();
    this.setupFilterListeners();
  }

  private loadPayments(): void {
    this.loading.set(true);
    this.error.set(null);

    this.paymentService.getPayments().subscribe({
      next: (payments) => {
        this.payments.set(payments);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading payments:', err);
        this.error.set('Failed to load payments. Please try again.');
        this.loading.set(false);
      }
    });
  }

  private setupFilterListeners(): void {
    this.filterForm.valueChanges.subscribe(() => {
      // Reset to first page when filters change
      this.pageIndex.set(0);
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  clearFilters(): void {
    this.filterForm.reset({
      startDate: null,
      endDate: null,
      status: 'ALL'
    });
  }

  viewPaymentDetails(payment: Payment): void {
    this.router.navigate(['/payments', payment.id]);
  }

  getStatusClass(status: PaymentStatus): string {
    const statusMap: Record<PaymentStatus, string> = {
      [PaymentStatus.PENDING]: 'status-pending',
      [PaymentStatus.SUCCEEDED]: 'status-succeeded',
      [PaymentStatus.FAILED]: 'status-failed',
      [PaymentStatus.REFUNDED]: 'status-refunded',
      [PaymentStatus.CANCELED]: 'status-canceled'
    };
    return statusMap[status] || '';
  }

  getStatusIcon(status: PaymentStatus): string {
    const iconMap: Record<PaymentStatus, string> = {
      [PaymentStatus.PENDING]: 'schedule',
      [PaymentStatus.SUCCEEDED]: 'check_circle',
      [PaymentStatus.FAILED]: 'error',
      [PaymentStatus.REFUNDED]: 'replay',
      [PaymentStatus.CANCELED]: 'cancel'
    };
    return iconMap[status] || 'help';
  }

  getPaymentMethodIcon(method: PaymentMethod): string {
    const iconMap: Record<PaymentMethod, string> = {
      [PaymentMethod.CARD]: 'credit_card',
      [PaymentMethod.BANK_TRANSFER]: 'account_balance',
      [PaymentMethod.PAYPAL]: 'payment'
    };
    return iconMap[method] || 'payment';
  }

  formatPaymentMethod(method: PaymentMethod): string {
    const methodMap: Record<PaymentMethod, string> = {
      [PaymentMethod.CARD]: 'Credit Card',
      [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer',
      [PaymentMethod.PAYPAL]: 'PayPal'
    };
    return methodMap[method] || method;
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100); // Assuming amount is in cents
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  exportToPDF(): void {
    // Get all filtered payments for export
    const dataToExport = this.filteredPayments();

    // Create a simple text representation for PDF
    let content = 'Payment History Report\n\n';
    content += `Generated on: ${new Date().toLocaleString()}\n`;
    content += `Total Payments: ${dataToExport.length}\n\n`;
    content += '-'.repeat(80) + '\n\n';

    dataToExport.forEach((payment, index) => {
      content += `Payment #${index + 1}\n`;
      content += `Date: ${this.formatDate(payment.createdAt)}\n`;
      content += `Booking: ${payment.booking?.parking?.title || payment.bookingId}\n`;
      content += `Amount: ${this.formatCurrency(payment.amount, payment.currency)}\n`;
      content += `Method: ${this.formatPaymentMethod(payment.paymentMethod)}\n`;
      content += `Status: ${payment.status}\n`;
      content += '-'.repeat(80) + '\n\n';
    });

    // Create and download the file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payment-history-${new Date().getTime()}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);

    // Note: For actual PDF generation, you would use a library like jsPDF
    console.log('PDF export initiated (currently exports as text file)');
  }

  exportToCSV(): void {
    const dataToExport = this.filteredPayments();

    // CSV headers
    const headers = ['Date', 'Booking ID', 'Parking', 'Amount', 'Currency', 'Payment Method', 'Status'];
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    dataToExport.forEach(payment => {
      const row = [
        `"${this.formatDate(payment.createdAt)}"`,
        payment.bookingId,
        `"${payment.booking?.parking?.title || 'N/A'}"`,
        (payment.amount / 100).toFixed(2),
        payment.currency,
        this.formatPaymentMethod(payment.paymentMethod),
        payment.status
      ];
      csvRows.push(row.join(','));
    });

    // Create and download the CSV file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payment-history-${new Date().getTime()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  refresh(): void {
    this.loadPayments();
  }

  hasActiveFilters(): boolean {
    const filters = this.filterForm.value;
    return !!(filters.startDate || filters.endDate || (filters.status && filters.status !== 'ALL'));
  }
}
