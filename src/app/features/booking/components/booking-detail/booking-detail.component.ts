import { Component, computed, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { BookingService } from '../../services/booking.service';
import { Booking, BookingStatus } from '../../../../core/models/booking.model';
import * as QRCode from 'qrcode';
import { formatDistance, format } from 'date-fns';

interface BookingEvent {
  title: string;
  date: string;
  icon: string;
  completed: boolean;
  color: string;
}

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.scss']
})
export class BookingDetailComponent implements OnInit {
  private bookingService = inject(BookingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild('qrcodeCanvas', { static: false }) qrcodeCanvas?: ElementRef<HTMLCanvasElement>;

  // Signals for reactive state
  booking = signal<Booking | null>(null);
  isLoading = signal(true);
  isProcessing = signal(false);
  qrCodeDataUrl = signal<string | null>(null);
  showAccessCode = signal(false);

  // Computed signals
  bookingId = computed(() => this.booking()?.id || '');

  bookingStatus = computed(() => this.booking()?.status || BookingStatus.PENDING);

  statusColor = computed(() => {
    const status = this.bookingStatus();
    switch (status) {
      case BookingStatus.CONFIRMED: return 'primary';
      case BookingStatus.COMPLETED: return 'accent';
      case BookingStatus.CANCELED: return 'warn';
      case BookingStatus.REJECTED: return 'warn';
      default: return 'accent';
    }
  });

  statusIcon = computed(() => {
    const status = this.bookingStatus();
    switch (status) {
      case BookingStatus.CONFIRMED: return 'check_circle';
      case BookingStatus.COMPLETED: return 'task_alt';
      case BookingStatus.CANCELED: return 'cancel';
      case BookingStatus.REJECTED: return 'block';
      default: return 'pending';
    }
  });

  canCancel = computed(() => {
    const booking = this.booking();
    if (!booking) return false;
    return booking.status === BookingStatus.PENDING ||
           booking.status === BookingStatus.CONFIRMED;
  });

  canCheckIn = computed(() => {
    const booking = this.booking();
    if (!booking) return false;
    return booking.status === BookingStatus.CONFIRMED &&
           !booking.checkedIn &&
           new Date(booking.startTime) <= new Date();
  });

  canCheckOut = computed(() => {
    const booking = this.booking();
    if (!booking) return false;
    return booking.checkedIn && !booking.checkedOut;
  });

  bookingDuration = computed(() => {
    const booking = this.booking();
    if (!booking) return '';

    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}, ${diffHours % 24} hour${diffHours % 24 !== 1 ? 's' : ''}`;
    }
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  });

  formattedStartTime = computed(() => {
    const booking = this.booking();
    if (!booking) return '';
    return format(new Date(booking.startTime), 'PPpp');
  });

  formattedEndTime = computed(() => {
    const booking = this.booking();
    if (!booking) return '';
    return format(new Date(booking.endTime), 'PPpp');
  });

  timeUntilStart = computed(() => {
    const booking = this.booking();
    if (!booking) return '';
    return formatDistance(new Date(booking.startTime), new Date(), { addSuffix: true });
  });

  bookingEvents = computed<BookingEvent[]>(() => {
    const booking = this.booking();
    if (!booking) return [];

    const events: BookingEvent[] = [
      {
        title: 'Booking Created',
        date: booking.createdAt,
        icon: 'add_circle',
        completed: true,
        color: 'primary'
      },
      {
        title: 'Booking Confirmed',
        date: booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.COMPLETED
          ? booking.updatedAt
          : '',
        icon: 'check_circle',
        completed: booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.COMPLETED,
        color: 'primary'
      },
      {
        title: 'Checked In',
        date: booking.checkedInTime || '',
        icon: 'login',
        completed: booking.checkedIn,
        color: 'accent'
      },
      {
        title: 'Checked Out',
        date: booking.checkedOutTime || '',
        icon: 'logout',
        completed: booking.checkedOut,
        color: 'accent'
      }
    ];

    if (booking.status === BookingStatus.CANCELED) {
      return [
        events[0],
        {
          title: 'Booking Canceled',
          date: booking.updatedAt,
          icon: 'cancel',
          completed: true,
          color: 'warn'
        }
      ];
    }

    if (booking.status === BookingStatus.REJECTED) {
      return [
        events[0],
        {
          title: 'Booking Rejected',
          date: booking.updatedAt,
          icon: 'block',
          completed: true,
          color: 'warn'
        }
      ];
    }

    return events;
  });

  ownerName = computed(() => {
    const booking = this.booking();
    if (!booking?.parking?.owner) return 'Unknown';
    return `${booking.parking.owner.firstName} ${booking.parking.owner.lastName}`;
  });

  parkingImage = computed(() => {
    const booking = this.booking();
    if (!booking?.parking?.photos || booking.parking.photos.length === 0) {
      return 'assets/images/placeholder-parking.jpg';
    }
    return booking.parking.photos[0].url;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBooking(id);
    } else {
      this.router.navigate(['/bookings']);
    }
  }

  private loadBooking(id: string): void {
    this.isLoading.set(true);
    this.bookingService.getBookingById(id).subscribe({
      next: (booking) => {
        this.booking.set(booking);
        this.isLoading.set(false);

        // Generate QR code if access code is available
        if (booking.accessCode) {
          this.generateQRCode(booking.accessCode);
        }
      },
      error: (error) => {
        console.error('Error loading booking:', error);
        this.isLoading.set(false);
        this.snackBar.open('Failed to load booking details', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/bookings']);
      }
    });
  }

  private async generateQRCode(accessCode: string): Promise<void> {
    try {
      const qrDataUrl = await QRCode.toDataURL(accessCode, {
        width: 300,
        margin: 2,
        color: {
          dark: '#00897b',
          light: '#ffffff'
        }
      });
      this.qrCodeDataUrl.set(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  handleCancel(): void {
    const booking = this.booking();
    if (!booking || !this.canCancel()) return;

    if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      this.isProcessing.set(true);
      this.bookingService.cancelBooking(booking.id).subscribe({
        next: () => {
          this.snackBar.open('Booking canceled successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/bookings']);
        },
        error: (error) => {
          console.error('Error canceling booking:', error);
          this.isProcessing.set(false);
          this.snackBar.open('Failed to cancel booking. Please try again.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  handleCheckIn(): void {
    const booking = this.booking();
    if (!booking || !this.canCheckIn()) return;

    this.isProcessing.set(true);
    this.bookingService.checkIn(booking.id).subscribe({
      next: (updatedBooking) => {
        this.booking.set(updatedBooking);
        this.isProcessing.set(false);
        this.snackBar.open('Checked in successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        // Generate access code if not already available
        if (!updatedBooking.accessCode) {
          this.getAccessCode();
        }
      },
      error: (error) => {
        console.error('Error checking in:', error);
        this.isProcessing.set(false);
        this.snackBar.open('Failed to check in. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  handleCheckOut(): void {
    const booking = this.booking();
    if (!booking || !this.canCheckOut()) return;

    this.isProcessing.set(true);
    this.bookingService.checkOut(booking.id).subscribe({
      next: (updatedBooking) => {
        this.booking.set(updatedBooking);
        this.isProcessing.set(false);
        this.snackBar.open('Checked out successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error checking out:', error);
        this.isProcessing.set(false);
        this.snackBar.open('Failed to check out. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getAccessCode(): void {
    const booking = this.booking();
    if (!booking) return;

    this.isProcessing.set(true);
    this.bookingService.getAccessCode(booking.id).subscribe({
      next: (response) => {
        const updatedBooking = { ...booking, accessCode: response.accessCode };
        this.booking.set(updatedBooking);
        this.generateQRCode(response.accessCode);
        this.showAccessCode.set(true);
        this.isProcessing.set(false);
        this.snackBar.open('Access code retrieved!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error getting access code:', error);
        this.isProcessing.set(false);
        this.snackBar.open('Failed to retrieve access code. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  toggleAccessCode(): void {
    this.showAccessCode.update(show => !show);
  }

  getDirections(): void {
    const booking = this.booking();
    if (!booking?.parking?.address) return;

    const address = encodeURIComponent(booking.parking.address);
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(url, '_blank');
  }

  contactOwner(): void {
    const booking = this.booking();
    if (!booking?.parking?.owner) return;

    this.snackBar.open('Contact feature coming soon!', 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }

  downloadQRCode(): void {
    const qrDataUrl = this.qrCodeDataUrl();
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `parking-access-${this.bookingId()}.png`;
    link.href = qrDataUrl;
    link.click();
  }

  shareBooking(): void {
    const booking = this.booking();
    if (!booking) return;

    const shareData = {
      title: 'ParkShare Booking',
      text: `Booking at ${booking.parking?.title || 'parking location'}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      this.snackBar.open('Link copied to clipboard!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return format(new Date(dateString), 'PPp');
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  goBack(): void {
    this.router.navigate(['/bookings']);
  }
}
