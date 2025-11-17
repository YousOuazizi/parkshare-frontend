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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';
import { AdminDashboard } from '../../../../core/models/analytics.model';

interface SystemHealth {
  cpu: number;
  memory: number;
  storage: number;
  apiResponseTime: number;
  uptime: string;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'booking' | 'parking' | 'payment';
  description: string;
  timestamp: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

@Component({
  selector: 'app-admin-dashboard',
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
    MatTableModule,
    MatProgressBarModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private router = inject(Router);

  // Signals for state management
  dashboard = signal<AdminDashboard | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed values
  overview = computed(() => this.dashboard()?.overview ?? {
    totalUsers: 0,
    totalParkings: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    activeParkings: 0
  });

  topParkings = computed(() => this.dashboard()?.topParkings ?? []);
  topUsers = computed(() => this.dashboard()?.topUsers ?? []);
  verificationStats = computed(() => this.dashboard()?.verificationStats ?? {
    level0: 0,
    level1: 0,
    level2: 0,
    level3: 0,
    level4: 0
  });

  // System health metrics
  systemHealth = signal<SystemHealth>({
    cpu: 45.2,
    memory: 62.8,
    storage: 38.5,
    apiResponseTime: 125,
    uptime: '15 days, 6 hours'
  });

  // Recent activities
  recentActivities = signal<RecentActivity[]>([
    {
      id: '1',
      type: 'user',
      description: 'New user registration: john.doe@example.com',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      severity: 'success'
    },
    {
      id: '2',
      type: 'booking',
      description: 'Booking confirmed: Downtown Parking Garage',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      severity: 'info'
    },
    {
      id: '3',
      type: 'parking',
      description: 'New parking space added: Airport Parking Zone B',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      severity: 'success'
    },
    {
      id: '4',
      type: 'payment',
      description: 'Payment failed: Transaction ID #12345',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      severity: 'error'
    },
    {
      id: '5',
      type: 'user',
      description: 'User verification level upgraded: user#456',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      severity: 'info'
    }
  ]);

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    this.analyticsService.getAdminDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading admin dashboard:', err);
        this.error.set('Failed to load dashboard. Please try again.');
        this.loading.set(false);
      }
    });
  }

  refresh(): void {
    this.loadDashboard();
  }

  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  navigateToParkings(): void {
    this.router.navigate(['/admin/parkings']);
  }

  navigateToBookings(): void {
    this.router.navigate(['/admin/bookings']);
  }

  navigateToPayments(): void {
    this.router.navigate(['/admin/payments']);
  }

  navigateToReports(): void {
    this.router.navigate(['/admin/reports']);
  }

  viewUserDetails(userId: string): void {
    this.router.navigate(['/admin/users', userId]);
  }

  viewParkingDetails(parkingId: string): void {
    this.router.navigate(['/admin/parkings', parkingId]);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getRelativeTime(timestamp: string): string {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diff = now - then;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  getActivityIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'user': 'person',
      'booking': 'event',
      'parking': 'local_parking',
      'payment': 'payment'
    };
    return iconMap[type] || 'info';
  }

  getActivityClass(severity: string): string {
    return `activity-${severity}`;
  }

  getSeverityIcon(severity: string): string {
    const iconMap: Record<string, string> = {
      'success': 'check_circle',
      'info': 'info',
      'warning': 'warning',
      'error': 'error'
    };
    return iconMap[severity] || 'info';
  }

  getHealthClass(value: number): string {
    if (value < 50) return 'health-good';
    if (value < 80) return 'health-warning';
    return 'health-critical';
  }

  getTotalVerifications(): number {
    const stats = this.verificationStats();
    return stats.level0 + stats.level1 + stats.level2 + stats.level3 + stats.level4;
  }

  getVerificationPercentage(level: number): number {
    const total = this.getTotalVerifications();
    if (total === 0) return 0;

    const stats = this.verificationStats();
    const levelKey = `level${level}` as keyof typeof stats;
    return (stats[levelKey] / total) * 100;
  }
}
