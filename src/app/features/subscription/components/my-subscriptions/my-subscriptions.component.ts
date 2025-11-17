import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chip';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

import { SubscriptionService } from '../../services/subscription.service';
import {
  Subscription,
  SubscriptionStatus,
  SubscriptionUsageReport
} from '../../../../core/models';

interface BillingRecord {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
}

@Component({
  selector: 'app-my-subscriptions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  templateUrl: './my-subscriptions.component.html',
  styleUrls: ['./my-subscriptions.component.scss']
})
export class MySubscriptionsComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Signals for reactive state
  subscriptions = signal<Subscription[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  selectedSubscription = signal<Subscription | null>(null);
  usageReport = signal<SubscriptionUsageReport | null>(null);
  loadingUsage = signal<boolean>(false);

  // Computed signal for active subscriptions
  activeSubscriptions = computed(() =>
    this.subscriptions().filter(sub => sub.status === SubscriptionStatus.ACTIVE)
  );

  // Computed signal for paused subscriptions
  pausedSubscriptions = computed(() =>
    this.subscriptions().filter(sub => sub.status === SubscriptionStatus.PAUSED)
  );

  // Computed signal for cancelled/expired subscriptions
  inactiveSubscriptions = computed(() =>
    this.subscriptions().filter(
      sub => sub.status === SubscriptionStatus.CANCELLED || sub.status === SubscriptionStatus.EXPIRED
    )
  );

  // Computed signal for subscription statistics
  subscriptionStats = computed(() => {
    const subs = this.activeSubscriptions();
    const totalSpots = subs.length;
    const totalShares = subs.reduce((sum, sub) => sum + (sub.sharedWith?.length || 0), 0);
    const totalUsage = subs.reduce((sum, sub) => sum + (sub.usageCount || 0), 0);

    return {
      totalSpots,
      totalShares,
      totalUsage,
      averageUsage: totalSpots > 0 ? Math.round(totalUsage / totalSpots) : 0
    };
  });

  // Mock billing history (in real app, would come from API)
  billingHistory = signal<BillingRecord[]>([
    {
      id: '1',
      date: '2025-11-01',
      amount: 24.99,
      currency: 'USD',
      status: 'paid',
      invoiceUrl: '#'
    },
    {
      id: '2',
      date: '2025-10-01',
      amount: 24.99,
      currency: 'USD',
      status: 'paid',
      invoiceUrl: '#'
    },
    {
      id: '3',
      date: '2025-09-01',
      amount: 24.99,
      currency: 'USD',
      status: 'paid',
      invoiceUrl: '#'
    }
  ]);

  billingColumns: string[] = ['date', 'amount', 'status', 'actions'];

  // Share email form control
  shareEmailControl = new FormControl('', [Validators.required, Validators.email]);

  // Enum reference for template
  SubscriptionStatus = SubscriptionStatus;

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  /**
   * Load user's subscriptions
   */
  loadSubscriptions(): void {
    this.loading.set(true);
    this.error.set(null);

    this.subscriptionService.getSubscriptions().subscribe({
      next: (subscriptions) => {
        this.subscriptions.set(subscriptions);
        this.loading.set(false);

        // Auto-select first active subscription
        const active = this.activeSubscriptions();
        if (active.length > 0) {
          this.selectSubscription(active[0]);
        }
      },
      error: (err) => {
        this.error.set('Failed to load subscriptions. Please try again.');
        this.loading.set(false);
        console.error('Error loading subscriptions:', err);
      }
    });
  }

  /**
   * Select a subscription to view details
   */
  selectSubscription(subscription: Subscription): void {
    this.selectedSubscription.set(subscription);
    this.loadUsageReport(subscription.id);
  }

  /**
   * Load usage report for a subscription
   */
  loadUsageReport(subscriptionId: string): void {
    this.loadingUsage.set(true);

    this.subscriptionService.getUsageReport(subscriptionId).subscribe({
      next: (report) => {
        this.usageReport.set(report);
        this.loadingUsage.set(false);
      },
      error: (err) => {
        console.error('Error loading usage report:', err);
        this.loadingUsage.set(false);
        // Don't show error, just log it
      }
    });
  }

  /**
   * Pause subscription
   */
  pauseSubscription(subscription: Subscription): void {
    if (confirm('Are you sure you want to pause this subscription?')) {
      this.subscriptionService.pauseSubscription(subscription.id).subscribe({
        next: () => {
          this.showSuccess('Subscription paused successfully');
          this.loadSubscriptions();
        },
        error: (err) => {
          this.showError('Failed to pause subscription');
          console.error('Error pausing subscription:', err);
        }
      });
    }
  }

  /**
   * Resume subscription
   */
  resumeSubscription(subscription: Subscription): void {
    this.subscriptionService.resumeSubscription(subscription.id).subscribe({
      next: () => {
        this.showSuccess('Subscription resumed successfully');
        this.loadSubscriptions();
      },
      error: (err) => {
        this.showError('Failed to resume subscription');
        console.error('Error resuming subscription:', err);
      }
    });
  }

  /**
   * Cancel subscription
   */
  cancelSubscription(subscription: Subscription): void {
    const message = `Are you sure you want to cancel this subscription? You will lose access at the end of your billing period.`;

    if (confirm(message)) {
      this.subscriptionService.cancelSubscription(subscription.id).subscribe({
        next: () => {
          this.showSuccess('Subscription cancelled successfully');
          this.loadSubscriptions();
        },
        error: (err) => {
          this.showError('Failed to cancel subscription');
          console.error('Error cancelling subscription:', err);
        }
      });
    }
  }

  /**
   * Share subscription with another user
   */
  shareSubscription(subscription: Subscription): void {
    const email = this.shareEmailControl.value?.trim();

    if (!email || this.shareEmailControl.invalid) {
      this.showError('Please enter a valid email address');
      return;
    }

    // Check if already at max shares
    const currentShares = subscription.sharedWith?.length || 0;
    const maxShares = subscription.plan?.maxShares || 0;

    if (currentShares >= maxShares && maxShares > 0) {
      this.showError(`Maximum shares (${maxShares}) reached for this plan`);
      return;
    }

    this.subscriptionService.shareSubscription(subscription.id, email).subscribe({
      next: () => {
        this.showSuccess(`Subscription shared with ${email}`);
        this.shareEmailControl.reset();
        this.loadSubscriptions();
      },
      error: (err) => {
        this.showError('Failed to share subscription');
        console.error('Error sharing subscription:', err);
      }
    });
  }

  /**
   * Revoke subscription share
   */
  revokeShare(subscription: Subscription, userId: string): void {
    if (confirm('Are you sure you want to revoke this share?')) {
      // In real app, would need share ID
      const shareId = `${subscription.id}-${userId}`;

      this.subscriptionService.revokeShare(shareId).subscribe({
        next: () => {
          this.showSuccess('Share revoked successfully');
          this.loadSubscriptions();
        },
        error: (err) => {
          this.showError('Failed to revoke share');
          console.error('Error revoking share:', err);
        }
      });
    }
  }

  /**
   * Navigate to upgrade plan
   */
  upgradePlan(subscription: Subscription): void {
    this.router.navigate(['/subscriptions/plans'], {
      queryParams: { upgrade: subscription.id }
    });
  }

  /**
   * Navigate to browse plans
   */
  browsePlans(): void {
    this.router.navigate(['/subscriptions/plans']);
  }

  /**
   * Get status chip color
   */
  getStatusColor(status: SubscriptionStatus): string {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'primary';
      case SubscriptionStatus.PAUSED:
        return 'accent';
      case SubscriptionStatus.CANCELLED:
      case SubscriptionStatus.EXPIRED:
        return 'warn';
      default:
        return '';
    }
  }

  /**
   * Get status icon
   */
  getStatusIcon(status: SubscriptionStatus): string {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'check_circle';
      case SubscriptionStatus.PAUSED:
        return 'pause_circle';
      case SubscriptionStatus.CANCELLED:
        return 'cancel';
      case SubscriptionStatus.EXPIRED:
        return 'event_busy';
      default:
        return 'info';
    }
  }

  /**
   * Get billing status color
   */
  getBillingStatusColor(status: string): string {
    switch (status) {
      case 'paid':
        return 'primary';
      case 'pending':
        return 'accent';
      case 'failed':
        return 'warn';
      default:
        return '';
    }
  }

  /**
   * Calculate usage percentage
   */
  getUsagePercentage(subscription: Subscription): number {
    const report = this.usageReport();
    if (!report || !subscription.plan) return 0;

    // Calculate based on plan limits
    const planType = subscription.plan.type;
    const totalUsage = report.totalUsage;

    // Example: assume monthly plan allows 30 uses
    const maxUsage = 30;
    return Math.min((totalUsage / maxUsage) * 100, 100);
  }

  /**
   * Format date
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  }

  /**
   * Get days remaining
   */
  getDaysRemaining(subscription: Subscription): number {
    if (!subscription.endDate) return 0;

    const now = new Date();
    const end = new Date(subscription.endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(diffDays, 0);
  }

  /**
   * Check if subscription is expiring soon (within 7 days)
   */
  isExpiringSoon(subscription: Subscription): boolean {
    const daysRemaining = this.getDaysRemaining(subscription);
    return daysRemaining > 0 && daysRemaining <= 7;
  }

  /**
   * Get parking spot image URL
   */
  getParkingImageUrl(subscription: Subscription): string {
    if (subscription.parking?.photos && subscription.parking.photos.length > 0) {
      return subscription.parking.photos[0].url;
    }
    return 'assets/images/default-parking.jpg';
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Track by function for ngFor optimization
   */
  trackBySubscriptionId(index: number, subscription: Subscription): string {
    return subscription.id;
  }

  /**
   * Track by function for billing records
   */
  trackByBillingId(index: number, record: BillingRecord): string {
    return record.id;
  }
}
