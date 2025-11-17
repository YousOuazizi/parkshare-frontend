import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';
import { UserStatistics } from '../../../../core/models/analytics.model';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private router = inject(Router);

  // Signals for state management
  statistics = signal<UserStatistics | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed values
  totalSpent = computed(() => this.statistics()?.totalSpent ?? 0);
  totalBookings = computed(() => this.statistics()?.totalBookings ?? 0);
  favoriteLocations = computed(() => this.statistics()?.favoriteLocations ?? []);
  bookingsByMonth = computed(() => this.statistics()?.bookingsByMonth ?? []);
  averageBookingValue = computed(() => this.statistics()?.averageBookingValue ?? 0);

  // Mock data for recent bookings (placeholder until integrated with booking service)
  recentBookings = signal([
    {
      id: '1',
      parkingTitle: 'Downtown Parking Garage',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 25.50,
      status: 'COMPLETED'
    },
    {
      id: '2',
      parkingTitle: 'Airport Long-term Parking',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 45.00,
      status: 'COMPLETED'
    },
    {
      id: '3',
      parkingTitle: 'City Center Parking',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 18.75,
      status: 'COMPLETED'
    }
  ]);

  // Mock data for saved parkings (placeholder)
  savedParkings = signal([
    {
      id: '1',
      title: 'Downtown Parking Garage',
      address: '123 Main St, Downtown',
      basePrice: 15.00,
      rating: 4.5
    },
    {
      id: '2',
      title: 'Shopping Mall Parking',
      address: '456 Mall Ave, Westside',
      basePrice: 12.00,
      rating: 4.8
    },
    {
      id: '3',
      title: 'Stadium Parking',
      address: '789 Sports Blvd, East',
      basePrice: 20.00,
      rating: 4.3
    }
  ]);

  ngOnInit(): void {
    this.loadStatistics();
  }

  private loadStatistics(): void {
    this.loading.set(true);
    this.error.set(null);

    this.analyticsService.getUserStatistics().subscribe({
      next: (stats) => {
        this.statistics.set(stats);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading user statistics:', err);
        this.error.set('Failed to load statistics. Please try again.');
        this.loading.set(false);
      }
    });
  }

  refresh(): void {
    this.loadStatistics();
  }

  navigateToBookings(): void {
    this.router.navigate(['/bookings']);
  }

  navigateToSearch(): void {
    this.router.navigate(['/search']);
  }

  viewBookingDetails(bookingId: string): void {
    this.router.navigate(['/bookings', bookingId]);
  }

  viewParkingDetails(parkingId: string): void {
    this.router.navigate(['/parking', parkingId]);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'COMPLETED': 'status-completed',
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'CANCELED': 'status-canceled'
    };
    return statusMap[status] || '';
  }

  getStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      'COMPLETED': 'check_circle',
      'PENDING': 'schedule',
      'CONFIRMED': 'verified',
      'CANCELED': 'cancel'
    };
    return iconMap[status] || 'help';
  }

  getRatingStars(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push('star');
    }
    if (hasHalfStar) {
      stars.push('star_half');
    }
    while (stars.length < 5) {
      stars.push('star_border');
    }

    return stars;
  }
}
