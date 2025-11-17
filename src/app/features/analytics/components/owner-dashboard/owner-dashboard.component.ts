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
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';
import { ParkingStatistics } from '../../../../core/models/analytics.model';

interface OwnerStats {
  totalEarnings: number;
  totalBookings: number;
  occupancyRate: number;
  averageRating: number;
  activeParkings: number;
  conversionRate: number;
}

@Component({
  selector: 'app-owner-dashboard',
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
    MatDividerModule,
    MatTableModule
  ],
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.scss']
})
export class OwnerDashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private router = inject(Router);

  // Signals for state management
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Mock owner statistics (in real app, would fetch from backend)
  ownerStats = signal<OwnerStats>({
    totalEarnings: 12450.75,
    totalBookings: 156,
    occupancyRate: 78.5,
    averageRating: 4.6,
    activeParkings: 5,
    conversionRate: 12.3
  });

  // Computed values
  totalEarnings = computed(() => this.ownerStats().totalEarnings);
  totalBookings = computed(() => this.ownerStats().totalBookings);
  occupancyRate = computed(() => this.ownerStats().occupancyRate);
  averageRating = computed(() => this.ownerStats().averageRating);
  activeParkings = computed(() => this.ownerStats().activeParkings);
  conversionRate = computed(() => this.ownerStats().conversionRate);

  // Popular parkings
  popularParkings = signal([
    {
      id: '1',
      title: 'Downtown Parking Garage',
      address: '123 Main St, Downtown',
      bookings: 45,
      revenue: 3250.50,
      occupancyRate: 85.2,
      rating: 4.7
    },
    {
      id: '2',
      title: 'Airport Long-term Parking',
      address: '456 Airport Rd, Terminal 2',
      bookings: 38,
      revenue: 4125.00,
      occupancyRate: 92.1,
      rating: 4.8
    },
    {
      id: '3',
      title: 'City Center Parking',
      address: '789 Center Ave, Midtown',
      bookings: 32,
      revenue: 2580.25,
      occupancyRate: 72.5,
      rating: 4.5
    },
    {
      id: '4',
      title: 'Shopping Mall Parking',
      address: '321 Mall Blvd, Westside',
      bookings: 28,
      revenue: 1995.00,
      occupancyRate: 68.3,
      rating: 4.4
    }
  ]);

  // Recent bookings on owner's parkings
  recentBookings = signal([
    {
      id: '1',
      userName: 'John Doe',
      parkingTitle: 'Downtown Parking Garage',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 45.00,
      status: 'CONFIRMED'
    },
    {
      id: '2',
      userName: 'Jane Smith',
      parkingTitle: 'Airport Long-term Parking',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 120.00,
      status: 'COMPLETED'
    },
    {
      id: '3',
      userName: 'Mike Johnson',
      parkingTitle: 'City Center Parking',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 35.50,
      status: 'CONFIRMED'
    },
    {
      id: '4',
      userName: 'Sarah Williams',
      parkingTitle: 'Shopping Mall Parking',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 28.00,
      status: 'COMPLETED'
    }
  ]);

  // Revenue trends (mock data)
  revenueTrends = signal([
    { month: 'Jan', revenue: 8200 },
    { month: 'Feb', revenue: 9150 },
    { month: 'Mar', revenue: 10500 },
    { month: 'Apr', revenue: 11200 },
    { month: 'May', revenue: 10800 },
    { month: 'Jun', revenue: 12450 }
  ]);

  ngOnInit(): void {
    this.loadOwnerStatistics();
  }

  private loadOwnerStatistics(): void {
    this.loading.set(true);
    this.error.set(null);

    // In real app, fetch owner statistics from backend
    setTimeout(() => {
      this.loading.set(false);
    }, 1000);
  }

  refresh(): void {
    this.loadOwnerStatistics();
  }

  navigateToParkings(): void {
    this.router.navigate(['/parking/my-parkings']);
  }

  navigateToBookings(): void {
    this.router.navigate(['/bookings/owner']);
  }

  viewParkingDetails(parkingId: string): void {
    this.router.navigate(['/parking', parkingId]);
  }

  viewBookingDetails(bookingId: string): void {
    this.router.navigate(['/bookings', bookingId]);
  }

  addNewParking(): void {
    this.router.navigate(['/parking/create']);
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

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
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

  getOccupancyClass(rate: number): string {
    if (rate >= 80) return 'high';
    if (rate >= 60) return 'medium';
    return 'low';
  }
}
