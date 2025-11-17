import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { BookingService } from '../../services/booking.service';
import { Booking, BookingStatus } from '../../../../core/models/booking.model';

type BookingTab = 'all' | 'upcoming' | 'active' | 'past' | 'cancelled';

interface DateRangeFilter {
  startDate: Date | null;
  endDate: Date | null;
}

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.scss']
})
export class BookingListComponent implements OnInit {
  private bookingService = inject(BookingService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Signals for state management
  bookings = signal<Booking[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  selectedTab = signal<BookingTab>('all');
  dateRangeFilter = signal<DateRangeFilter>({ startDate: null, endDate: null });
  statusFilter = signal<BookingStatus | 'all'>('all');

  // Available statuses for filter
  statusOptions: Array<{ value: BookingStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All Statuses' },
    { value: BookingStatus.PENDING, label: 'Pending' },
    { value: BookingStatus.CONFIRMED, label: 'Confirmed' },
    { value: BookingStatus.CANCELED, label: 'Cancelled' },
    { value: BookingStatus.COMPLETED, label: 'Completed' },
    { value: BookingStatus.REJECTED, label: 'Rejected' }
  ];

  // Table columns
  displayedColumns: string[] = [
    'parking',
    'dates',
    'status',
    'price',
    'accessCode',
    'actions'
  ];

  // Computed filtered bookings based on selected tab and filters
  filteredBookings = computed(() => {
    const allBookings = this.bookings();
    const tab = this.selectedTab();
    const statusFilterValue = this.statusFilter();
    const dateRange = this.dateRangeFilter();

    let filtered = allBookings;

    // Filter by tab
    filtered = filtered.filter(booking => {
      const now = new Date();
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);

      switch (tab) {
        case 'upcoming':
          return (
            booking.status === BookingStatus.CONFIRMED &&
            startTime > now &&
            !booking.checkedIn
          );
        case 'active':
          return (
            booking.status === BookingStatus.CONFIRMED &&
            startTime <= now &&
            endTime >= now &&
            booking.checkedIn &&
            !booking.checkedOut
          );
        case 'past':
          return (
            booking.status === BookingStatus.COMPLETED ||
            (endTime < now && booking.checkedOut)
          );
        case 'cancelled':
          return booking.status === BookingStatus.CANCELED;
        default:
          return true;
      }
    });

    // Filter by status
    if (statusFilterValue !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilterValue);
    }

    // Filter by date range
    if (dateRange.startDate) {
      filtered = filtered.filter(
        booking => new Date(booking.startTime) >= dateRange.startDate!
      );
    }
    if (dateRange.endDate) {
      filtered = filtered.filter(
        booking => new Date(booking.endTime) <= dateRange.endDate!
      );
    }

    // Sort by start time (most recent first)
    return filtered.sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  });

  // Computed counts for tab badges
  tabCounts = computed(() => {
    const allBookings = this.bookings();
    const now = new Date();

    return {
      all: allBookings.length,
      upcoming: allBookings.filter(b => {
        const startTime = new Date(b.startTime);
        return (
          b.status === BookingStatus.CONFIRMED &&
          startTime > now &&
          !b.checkedIn
        );
      }).length,
      active: allBookings.filter(b => {
        const startTime = new Date(b.startTime);
        const endTime = new Date(b.endTime);
        return (
          b.status === BookingStatus.CONFIRMED &&
          startTime <= now &&
          endTime >= now &&
          b.checkedIn &&
          !b.checkedOut
        );
      }).length,
      past: allBookings.filter(b => {
        const endTime = new Date(b.endTime);
        return b.status === BookingStatus.COMPLETED || (endTime < now && b.checkedOut);
      }).length,
      cancelled: allBookings.filter(b => b.status === BookingStatus.CANCELED).length
    };
  });

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading.set(true);
    this.error.set(null);

    this.bookingService.getBookings().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load bookings. Please try again.');
        this.loading.set(false);
        this.showSnackBar('Failed to load bookings', 'error');
      }
    });
  }

  onTabChange(tab: BookingTab): void {
    this.selectedTab.set(tab);
  }

  onStatusFilterChange(status: BookingStatus | 'all'): void {
    this.statusFilter.set(status);
  }

  onDateRangeChange(type: 'start' | 'end', date: Date | null): void {
    const currentRange = this.dateRangeFilter();
    if (type === 'start') {
      this.dateRangeFilter.set({ ...currentRange, startDate: date });
    } else {
      this.dateRangeFilter.set({ ...currentRange, endDate: date });
    }
  }

  clearFilters(): void {
    this.statusFilter.set('all');
    this.dateRangeFilter.set({ startDate: null, endDate: null });
  }

  viewDetails(booking: Booking): void {
    this.router.navigate(['/bookings', booking.id]);
  }

  canCancel(booking: Booking): boolean {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    return (
      booking.status === BookingStatus.CONFIRMED &&
      startTime > now &&
      !booking.checkedIn
    );
  }

  cancelBooking(booking: Booking): void {
    if (!this.canCancel(booking)) {
      this.showSnackBar('This booking cannot be cancelled', 'error');
      return;
    }

    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.cancelBooking(booking.id).subscribe({
        next: () => {
          this.showSnackBar('Booking cancelled successfully', 'success');
          this.loadBookings();
        },
        error: () => {
          this.showSnackBar('Failed to cancel booking', 'error');
        }
      });
    }
  }

  canCheckIn(booking: Booking): boolean {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    return (
      booking.status === BookingStatus.CONFIRMED &&
      startTime <= now &&
      endTime >= now &&
      !booking.checkedIn
    );
  }

  checkIn(booking: Booking): void {
    if (!this.canCheckIn(booking)) {
      this.showSnackBar('Check-in is not available for this booking', 'error');
      return;
    }

    this.bookingService.checkIn(booking.id).subscribe({
      next: () => {
        this.showSnackBar('Checked in successfully', 'success');
        this.loadBookings();
      },
      error: () => {
        this.showSnackBar('Failed to check in', 'error');
      }
    });
  }

  canCheckOut(booking: Booking): boolean {
    return booking.checkedIn && !booking.checkedOut;
  }

  checkOut(booking: Booking): void {
    if (!this.canCheckOut(booking)) {
      this.showSnackBar('Check-out is not available for this booking', 'error');
      return;
    }

    this.bookingService.checkOut(booking.id).subscribe({
      next: () => {
        this.showSnackBar('Checked out successfully', 'success');
        this.loadBookings();
      },
      error: () => {
        this.showSnackBar('Failed to check out', 'error');
      }
    });
  }

  getAccessCode(booking: Booking): void {
    if (!booking.checkedIn) {
      this.showSnackBar('Access code is only available after check-in', 'info');
      return;
    }

    this.bookingService.getAccessCode(booking.id).subscribe({
      next: (response) => {
        this.showSnackBar(`Access Code: ${response.accessCode}`, 'success', 5000);
        // Update the booking with the access code
        const updatedBookings = this.bookings().map(b =>
          b.id === booking.id ? { ...b, accessCode: response.accessCode } : b
        );
        this.bookings.set(updatedBookings);
      },
      error: () => {
        this.showSnackBar('Failed to get access code', 'error');
      }
    });
  }

  getStatusColor(status: BookingStatus): string {
    const statusColors: Record<BookingStatus, string> = {
      [BookingStatus.PENDING]: 'warn',
      [BookingStatus.CONFIRMED]: 'primary',
      [BookingStatus.CANCELED]: 'default',
      [BookingStatus.COMPLETED]: 'accent',
      [BookingStatus.REJECTED]: 'warn'
    };
    return statusColors[status] || 'default';
  }

  getStatusIcon(status: BookingStatus): string {
    const statusIcons: Record<BookingStatus, string> = {
      [BookingStatus.PENDING]: 'schedule',
      [BookingStatus.CONFIRMED]: 'check_circle',
      [BookingStatus.CANCELED]: 'cancel',
      [BookingStatus.COMPLETED]: 'task_alt',
      [BookingStatus.REJECTED]: 'error'
    };
    return statusIcons[status] || 'help';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
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
