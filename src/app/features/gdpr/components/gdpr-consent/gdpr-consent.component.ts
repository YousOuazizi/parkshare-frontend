import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

import { GdprService } from '../../services/gdpr.service';
import { Consent, ConsentType, ConsentUpdate } from '../../../../core/models/gdpr.model';

interface ConsentCategory {
  type: ConsentType;
  label: string;
  description: string;
  icon: string;
  required: boolean;
  enabled: boolean;
}

@Component({
  selector: 'app-gdpr-consent',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './gdpr-consent.component.html',
  styleUrls: ['./gdpr-consent.component.scss']
})
export class GdprConsentComponent implements OnInit {
  private gdprService = inject(GdprService);
  private snackBar = inject(MatSnackBar);

  // Signals for state management
  consents = signal<Consent[]>([]);
  consentCategories = signal<ConsentCategory[]>([
    {
      type: ConsentType.TERMS_AND_CONDITIONS,
      label: 'Terms and Conditions',
      description: 'Required to use ParkShare services',
      icon: 'description',
      required: true,
      enabled: true
    },
    {
      type: ConsentType.PRIVACY_POLICY,
      label: 'Privacy Policy',
      description: 'Required for data processing',
      icon: 'privacy_tip',
      required: true,
      enabled: true
    },
    {
      type: ConsentType.ANALYTICS,
      label: 'Analytics',
      description: 'Help us improve by collecting anonymous usage data',
      icon: 'analytics',
      required: false,
      enabled: false
    },
    {
      type: ConsentType.MARKETING_EMAILS,
      label: 'Marketing Emails',
      description: 'Receive promotional emails and special offers',
      icon: 'mail',
      required: false,
      enabled: false
    },
    {
      type: ConsentType.THIRD_PARTY_SHARING,
      label: 'Third Party Sharing',
      description: 'Share data with trusted partners for enhanced services',
      icon: 'people',
      required: false,
      enabled: false
    },
    {
      type: ConsentType.GEOLOCATION,
      label: 'Geolocation',
      description: 'Use your location to find nearby parking spots',
      icon: 'location_on',
      required: false,
      enabled: false
    },
    {
      type: ConsentType.PUSH_NOTIFICATIONS,
      label: 'Push Notifications',
      description: 'Receive push notifications for important updates',
      icon: 'notifications',
      required: false,
      enabled: false
    }
  ]);

  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  error = signal<string | null>(null);
  showHistory = signal<boolean>(false);

  ngOnInit(): void {
    this.loadConsents();
  }

  loadConsents(): void {
    this.loading.set(true);
    this.error.set(null);

    this.gdprService.getConsents().subscribe({
      next: (consents) => {
        this.consents.set(consents);
        this.updateConsentCategories(consents);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load consent settings');
        this.loading.set(false);
        this.showSnackBar('Failed to load consent settings', 'error');
      }
    });
  }

  private updateConsentCategories(consents: Consent[]): void {
    const categories = this.consentCategories();
    const updatedCategories = categories.map(category => {
      const consent = consents.find(c => c.consentType === category.type);
      return {
        ...category,
        enabled: consent?.granted ?? category.required
      };
    });
    this.consentCategories.set(updatedCategories);
  }

  toggleConsent(category: ConsentCategory): void {
    if (category.required) {
      this.showSnackBar('This consent is required and cannot be disabled', 'info');
      return;
    }

    const newValue = !category.enabled;

    // Optimistically update UI
    const categories = this.consentCategories();
    const updatedCategories = categories.map(cat =>
      cat.type === category.type ? { ...cat, enabled: newValue } : cat
    );
    this.consentCategories.set(updatedCategories);

    // Update on server
    const consentUpdate: ConsentUpdate = {
      consentType: category.type,
      granted: newValue
    };

    if (newValue) {
      this.gdprService.recordConsent(consentUpdate).subscribe({
        next: (consent) => {
          this.showSnackBar(`${category.label} consent granted`, 'success');
          this.loadConsents(); // Reload to get updated history
        },
        error: (error) => {
          // Revert on error
          const revertedCategories = categories.map(cat =>
            cat.type === category.type ? { ...cat, enabled: !newValue } : cat
          );
          this.consentCategories.set(revertedCategories);
          this.showSnackBar(`Failed to update ${category.label} consent`, 'error');
        }
      });
    } else {
      this.gdprService.withdrawConsent(category.type).subscribe({
        next: () => {
          this.showSnackBar(`${category.label} consent withdrawn`, 'success');
          this.loadConsents(); // Reload to get updated history
        },
        error: (error) => {
          // Revert on error
          const revertedCategories = categories.map(cat =>
            cat.type === category.type ? { ...cat, enabled: !newValue } : cat
          );
          this.consentCategories.set(revertedCategories);
          this.showSnackBar(`Failed to withdraw ${category.label} consent`, 'error');
        }
      });
    }
  }

  toggleHistory(): void {
    this.showHistory.set(!this.showHistory());
  }

  getConsentHistory(type: ConsentType): Consent[] {
    return this.consents()
      .filter(c => c.consentType === type)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getConsentStatusIcon(consent: Consent): string {
    return consent.granted ? 'check_circle' : 'cancel';
  }

  getConsentStatusColor(consent: Consent): string {
    return consent.granted ? 'success' : 'warn';
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
