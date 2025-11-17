import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

import { NotificationService } from '../../services/notification.service';
import { NotificationPreferences } from '../../../../core/models/notification.model';

interface NotificationCategory {
  id: keyof NotificationPreferences['email'];
  label: string;
  description: string;
  icon: string;
}

interface ChannelPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private snackBar = inject(MatSnackBar);

  // Signals for state management
  preferences = signal<NotificationPreferences>({
    email: {
      bookings: true,
      payments: true,
      reviews: true,
      swaps: true,
      subscriptions: true,
      marketing: false
    },
    push: {
      bookings: true,
      payments: true,
      reviews: true,
      swaps: true,
      messages: true
    },
    sms: {
      bookingReminders: true,
      importantUpdates: true
    }
  });

  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  error = signal<string | null>(null);

  // Category definitions
  emailCategories: NotificationCategory[] = [
    {
      id: 'bookings',
      label: 'Bookings',
      description: 'Updates about your parking reservations',
      icon: 'event_available'
    },
    {
      id: 'payments',
      label: 'Payments',
      description: 'Payment confirmations and receipts',
      icon: 'payments'
    },
    {
      id: 'reviews',
      label: 'Reviews',
      description: 'New reviews and ratings',
      icon: 'rate_review'
    },
    {
      id: 'swaps',
      label: 'Swaps',
      description: 'Parking swap offers and updates',
      icon: 'swap_horiz'
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      description: 'Subscription renewals and updates',
      icon: 'autorenew'
    },
    {
      id: 'marketing',
      label: 'Promotions',
      description: 'Special offers and promotions',
      icon: 'local_offer'
    }
  ];

  pushCategories = [
    {
      id: 'bookings' as keyof NotificationPreferences['push'],
      label: 'Bookings',
      description: 'Instant booking notifications',
      icon: 'event_available'
    },
    {
      id: 'payments' as keyof NotificationPreferences['push'],
      label: 'Payments',
      description: 'Payment alerts',
      icon: 'payments'
    },
    {
      id: 'reviews' as keyof NotificationPreferences['push'],
      label: 'Reviews',
      description: 'New review notifications',
      icon: 'rate_review'
    },
    {
      id: 'swaps' as keyof NotificationPreferences['push'],
      label: 'Swaps',
      description: 'Swap offer alerts',
      icon: 'swap_horiz'
    },
    {
      id: 'messages' as keyof NotificationPreferences['push'],
      label: 'Messages',
      description: 'New message notifications',
      icon: 'message'
    }
  ];

  smsCategories = [
    {
      id: 'bookingReminders' as keyof NotificationPreferences['sms'],
      label: 'Booking Reminders',
      description: 'SMS reminders for upcoming bookings',
      icon: 'notifications_active'
    },
    {
      id: 'importantUpdates' as keyof NotificationPreferences['sms'],
      label: 'Important Updates',
      description: 'Critical account and booking updates',
      icon: 'priority_high'
    }
  ];

  ngOnInit(): void {
    this.loadPreferences();
  }

  loadPreferences(): void {
    this.loading.set(true);
    this.error.set(null);

    // In a real app, you would fetch from the API
    // For now, we'll use the default preferences
    setTimeout(() => {
      this.loading.set(false);
    }, 500);
  }

  toggleEmailPreference(category: keyof NotificationPreferences['email']): void {
    const current = this.preferences();
    const updated = {
      ...current,
      email: {
        ...current.email,
        [category]: !current.email[category]
      }
    };
    this.preferences.set(updated);
  }

  togglePushPreference(category: keyof NotificationPreferences['push']): void {
    const current = this.preferences();
    const updated = {
      ...current,
      push: {
        ...current.push,
        [category]: !current.push[category]
      }
    };
    this.preferences.set(updated);
  }

  toggleSmsPreference(category: keyof NotificationPreferences['sms']): void {
    const current = this.preferences();
    const updated = {
      ...current,
      sms: {
        ...current.sms,
        [category]: !current.sms[category]
      }
    };
    this.preferences.set(updated);
  }

  toggleAllEmail(enabled: boolean): void {
    const current = this.preferences();
    const updated = {
      ...current,
      email: {
        bookings: enabled,
        payments: enabled,
        reviews: enabled,
        swaps: enabled,
        subscriptions: enabled,
        marketing: enabled
      }
    };
    this.preferences.set(updated);
  }

  toggleAllPush(enabled: boolean): void {
    const current = this.preferences();
    const updated = {
      ...current,
      push: {
        bookings: enabled,
        payments: enabled,
        reviews: enabled,
        swaps: enabled,
        messages: enabled
      }
    };
    this.preferences.set(updated);
  }

  toggleAllSms(enabled: boolean): void {
    const current = this.preferences();
    const updated = {
      ...current,
      sms: {
        bookingReminders: enabled,
        importantUpdates: enabled
      }
    };
    this.preferences.set(updated);
  }

  areAllEmailEnabled(): boolean {
    const email = this.preferences().email;
    return Object.values(email).every(value => value === true);
  }

  areAllPushEnabled(): boolean {
    const push = this.preferences().push;
    return Object.values(push).every(value => value === true);
  }

  areAllSmsEnabled(): boolean {
    const sms = this.preferences().sms;
    return Object.values(sms).every(value => value === true);
  }

  savePreferences(): void {
    this.saving.set(true);

    // In a real app, you would save to the API
    // For now, we'll simulate a save
    setTimeout(() => {
      this.saving.set(false);
      this.showSnackBar('Notification preferences saved successfully', 'success');
    }, 1000);
  }

  resetToDefaults(): void {
    if (confirm('Are you sure you want to reset all notification preferences to defaults?')) {
      this.preferences.set({
        email: {
          bookings: true,
          payments: true,
          reviews: true,
          swaps: true,
          subscriptions: true,
          marketing: false
        },
        push: {
          bookings: true,
          payments: true,
          reviews: true,
          swaps: true,
          messages: true
        },
        sms: {
          bookingReminders: true,
          importantUpdates: true
        }
      });
      this.showSnackBar('Preferences reset to defaults', 'info');
    }
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
