import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { NotificationService } from '../../services/notification.service';
import { Notification, NotificationType } from '../../../../core/models/notification.model';

type NotificationTab = 'all' | 'unread';

interface GroupedNotifications {
  today: Notification[];
  yesterday: Notification[];
  thisWeek: Notification[];
  older: Notification[];
}

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Signals for state management
  notifications = signal<Notification[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  selectedTab = signal<NotificationTab>('all');

  // Computed values
  unreadNotifications = computed(() => {
    return this.notifications().filter(n => !n.isRead);
  });

  filteredNotifications = computed(() => {
    const tab = this.selectedTab();
    const allNotifications = this.notifications();

    if (tab === 'unread') {
      return allNotifications.filter(n => !n.isRead);
    }
    return allNotifications;
  });

  groupedNotifications = computed(() => {
    const notifications = this.filteredNotifications();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const grouped: GroupedNotifications = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    notifications.forEach(notification => {
      const createdAt = new Date(notification.createdAt);

      if (createdAt >= today) {
        grouped.today.push(notification);
      } else if (createdAt >= yesterday) {
        grouped.yesterday.push(notification);
      } else if (createdAt >= thisWeek) {
        grouped.thisWeek.push(notification);
      } else {
        grouped.older.push(notification);
      }
    });

    return grouped;
  });

  unreadCount = computed(() => this.unreadNotifications().length);

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.error.set(null);

    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications.set(notifications);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load notifications');
        this.loading.set(false);
        this.showSnackBar('Failed to load notifications', 'error');
      }
    });
  }

  onTabChange(index: number): void {
    const tabs: NotificationTab[] = ['all', 'unread'];
    this.selectedTab.set(tabs[index]);
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: (updatedNotification) => {
        const updatedList = this.notifications().map(n =>
          n.id === notification.id ? updatedNotification : n
        );
        this.notifications.set(updatedList);
        this.showSnackBar('Notification marked as read', 'success');
      },
      error: () => {
        this.showSnackBar('Failed to mark notification as read', 'error');
      }
    });
  }

  markAllAsRead(): void {
    const unread = this.unreadNotifications();
    if (unread.length === 0) {
      this.showSnackBar('No unread notifications', 'info');
      return;
    }

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        const updatedList = this.notifications().map(n => ({ ...n, isRead: true }));
        this.notifications.set(updatedList);
        this.showSnackBar('All notifications marked as read', 'success');
      },
      error: () => {
        this.showSnackBar('Failed to mark all as read', 'error');
      }
    });
  }

  deleteNotification(notification: Notification): void {
    if (confirm('Are you sure you want to delete this notification?')) {
      this.notificationService.deleteNotification(notification.id).subscribe({
        next: () => {
          const updatedList = this.notifications().filter(n => n.id !== notification.id);
          this.notifications.set(updatedList);
          this.showSnackBar('Notification deleted', 'success');
        },
        error: () => {
          this.showSnackBar('Failed to delete notification', 'error');
        }
      });
    }
  }

  handleNotificationClick(notification: Notification): void {
    // Mark as read if unread
    if (!notification.isRead) {
      this.markAsRead(notification);
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      this.router.navigateByUrl(notification.actionUrl);
    }
  }

  getNotificationIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      [NotificationType.BOOKING_CREATED]: 'event_available',
      [NotificationType.BOOKING_CONFIRMED]: 'check_circle',
      [NotificationType.BOOKING_CANCELED]: 'event_busy',
      [NotificationType.BOOKING_REMINDER]: 'notifications_active',
      [NotificationType.BOOKING_COMPLETED]: 'task_alt',
      [NotificationType.PAYMENT_RECEIVED]: 'payments',
      [NotificationType.PAYMENT_FAILED]: 'error',
      [NotificationType.REVIEW_RECEIVED]: 'rate_review',
      [NotificationType.SWAP_OFFER_RECEIVED]: 'swap_horiz',
      [NotificationType.SWAP_OFFER_ACCEPTED]: 'done_all',
      [NotificationType.SWAP_OFFER_REJECTED]: 'close',
      [NotificationType.SUBSCRIPTION_EXPIRING]: 'warning',
      [NotificationType.SUBSCRIPTION_RENEWED]: 'autorenew',
      [NotificationType.VERIFICATION_APPROVED]: 'verified',
      [NotificationType.VERIFICATION_REJECTED]: 'cancel',
      [NotificationType.SYSTEM_NOTIFICATION]: 'info',
      [NotificationType.MESSAGE_RECEIVED]: 'message'
    };
    return icons[type] || 'notifications';
  }

  getNotificationColor(type: NotificationType): string {
    const colors: Record<NotificationType, string> = {
      [NotificationType.BOOKING_CREATED]: 'primary',
      [NotificationType.BOOKING_CONFIRMED]: 'accent',
      [NotificationType.BOOKING_CANCELED]: 'warn',
      [NotificationType.BOOKING_REMINDER]: 'primary',
      [NotificationType.BOOKING_COMPLETED]: 'accent',
      [NotificationType.PAYMENT_RECEIVED]: 'accent',
      [NotificationType.PAYMENT_FAILED]: 'warn',
      [NotificationType.REVIEW_RECEIVED]: 'primary',
      [NotificationType.SWAP_OFFER_RECEIVED]: 'primary',
      [NotificationType.SWAP_OFFER_ACCEPTED]: 'accent',
      [NotificationType.SWAP_OFFER_REJECTED]: 'warn',
      [NotificationType.SUBSCRIPTION_EXPIRING]: 'warn',
      [NotificationType.SUBSCRIPTION_RENEWED]: 'accent',
      [NotificationType.VERIFICATION_APPROVED]: 'accent',
      [NotificationType.VERIFICATION_REJECTED]: 'warn',
      [NotificationType.SYSTEM_NOTIFICATION]: 'primary',
      [NotificationType.MESSAGE_RECEIVED]: 'primary'
    };
    return colors[type] || 'primary';
  }

  formatDate(date: string): string {
    const notificationDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return notificationDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: notificationDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
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
