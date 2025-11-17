import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

import {
  AdminService,
  SystemHealth,
  ApplicationSettings,
  FeatureFlag,
  CacheStats,
  DatabaseStats,
  SystemLog
} from '../../services/admin.service';

@Component({
  selector: 'app-system-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatTableModule
  ],
  templateUrl: './system-management.component.html',
  styleUrls: ['./system-management.component.scss']
})
export class SystemManagementComponent implements OnInit {
  private adminService = inject(AdminService);

  // Signals
  systemHealth = signal<SystemHealth | null>(null);
  applicationSettings = signal<ApplicationSettings | null>(null);
  featureFlags = signal<FeatureFlag[]>([]);
  cacheStats = signal<CacheStats | null>(null);
  databaseStats = signal<DatabaseStats | null>(null);
  systemLogs = signal<SystemLog[]>([]);

  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  settingsSaving = signal<boolean>(false);

  // Settings form
  settingsForm = new FormGroup({
    maintenanceMode: new FormControl<boolean>(false),
    registrationEnabled: new FormControl<boolean>(true),
    emailVerificationRequired: new FormControl<boolean>(true),
    phoneVerificationRequired: new FormControl<boolean>(false),
    maxUploadSize: new FormControl<number>(10),
    sessionTimeout: new FormControl<number>(3600),
    rateLimitEnabled: new FormControl<boolean>(true),
    rateLimitMaxRequests: new FormControl<number>(100),
    rateLimitWindowMs: new FormControl<number>(60000)
  });

  // Table columns for logs
  logColumns: string[] = ['timestamp', 'level', 'message'];

  ngOnInit(): void {
    this.loadAllData();
    this.setupAutoRefresh();
  }

  /**
   * Load all system data
   */
  loadAllData(): void {
    this.loadSystemHealth();
    this.loadApplicationSettings();
    this.loadFeatureFlags();
    this.loadCacheStats();
    this.loadDatabaseStats();
    this.loadSystemLogs();
  }

  /**
   * Setup auto-refresh for system health
   */
  setupAutoRefresh(): void {
    interval(30000) // Refresh every 30 seconds
      .pipe(
        startWith(0),
        switchMap(() => this.adminService.getSystemHealth())
      )
      .subscribe({
        next: (health) => {
          this.systemHealth.set(health);
        },
        error: (err) => {
          console.error('Error refreshing system health:', err);
        }
      });
  }

  /**
   * Load system health
   */
  loadSystemHealth(): void {
    this.adminService.getSystemHealth().subscribe({
      next: (health) => {
        this.systemHealth.set(health);
      },
      error: (err) => {
        console.error('Error loading system health:', err);
      }
    });
  }

  /**
   * Load application settings
   */
  loadApplicationSettings(): void {
    this.adminService.getApplicationSettings().subscribe({
      next: (settings) => {
        this.applicationSettings.set(settings);
        this.settingsForm.patchValue({
          maintenanceMode: settings.maintenanceMode,
          registrationEnabled: settings.registrationEnabled,
          emailVerificationRequired: settings.emailVerificationRequired,
          phoneVerificationRequired: settings.phoneVerificationRequired,
          maxUploadSize: settings.maxUploadSize,
          sessionTimeout: settings.sessionTimeout,
          rateLimitEnabled: settings.rateLimit.enabled,
          rateLimitMaxRequests: settings.rateLimit.maxRequests,
          rateLimitWindowMs: settings.rateLimit.windowMs
        });
      },
      error: (err) => {
        console.error('Error loading application settings:', err);
      }
    });
  }

  /**
   * Save application settings
   */
  saveSettings(): void {
    this.settingsSaving.set(true);

    const formValue = this.settingsForm.value;
    const settings: Partial<ApplicationSettings> = {
      maintenanceMode: formValue.maintenanceMode ?? false,
      registrationEnabled: formValue.registrationEnabled ?? true,
      emailVerificationRequired: formValue.emailVerificationRequired ?? true,
      phoneVerificationRequired: formValue.phoneVerificationRequired ?? false,
      maxUploadSize: formValue.maxUploadSize ?? 10,
      sessionTimeout: formValue.sessionTimeout ?? 3600,
      rateLimit: {
        enabled: formValue.rateLimitEnabled ?? true,
        maxRequests: formValue.rateLimitMaxRequests ?? 100,
        windowMs: formValue.rateLimitWindowMs ?? 60000
      }
    };

    this.adminService.updateApplicationSettings(settings).subscribe({
      next: (updatedSettings) => {
        this.applicationSettings.set(updatedSettings);
        this.settingsSaving.set(false);
        alert('Settings saved successfully!');
      },
      error: (err) => {
        console.error('Error saving settings:', err);
        this.settingsSaving.set(false);
        alert('Failed to save settings. Please try again.');
      }
    });
  }

  /**
   * Load feature flags
   */
  loadFeatureFlags(): void {
    this.adminService.getFeatureFlags().subscribe({
      next: (flags) => {
        this.featureFlags.set(flags);
      },
      error: (err) => {
        console.error('Error loading feature flags:', err);
      }
    });
  }

  /**
   * Toggle feature flag
   */
  toggleFeatureFlag(flag: FeatureFlag): void {
    this.adminService.toggleFeatureFlag(flag.name, !flag.enabled).subscribe({
      next: (updatedFlag) => {
        const flags = this.featureFlags();
        const index = flags.findIndex(f => f.name === updatedFlag.name);
        if (index !== -1) {
          flags[index] = updatedFlag;
          this.featureFlags.set([...flags]);
        }
      },
      error: (err) => {
        console.error('Error toggling feature flag:', err);
        alert('Failed to toggle feature flag. Please try again.');
      }
    });
  }

  /**
   * Load cache statistics
   */
  loadCacheStats(): void {
    this.adminService.getCacheStats().subscribe({
      next: (stats) => {
        this.cacheStats.set(stats);
      },
      error: (err) => {
        console.error('Error loading cache stats:', err);
      }
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    if (!confirm('Are you sure you want to clear the cache?')) {
      return;
    }

    this.adminService.clearCache().subscribe({
      next: () => {
        alert('Cache cleared successfully!');
        this.loadCacheStats();
      },
      error: (err) => {
        console.error('Error clearing cache:', err);
        alert('Failed to clear cache. Please try again.');
      }
    });
  }

  /**
   * Load database statistics
   */
  loadDatabaseStats(): void {
    this.adminService.getDatabaseStats().subscribe({
      next: (stats) => {
        this.databaseStats.set(stats);
      },
      error: (err) => {
        console.error('Error loading database stats:', err);
      }
    });
  }

  /**
   * Load system logs
   */
  loadSystemLogs(): void {
    this.adminService.getSystemLogs({ page: 1, limit: 50 }).subscribe({
      next: (response) => {
        this.systemLogs.set(response.logs);
      },
      error: (err) => {
        console.error('Error loading system logs:', err);
      }
    });
  }

  /**
   * Get health status icon
   */
  getHealthStatusIcon(status: string): string {
    switch (status) {
      case 'healthy':
        return 'check_circle';
      case 'degraded':
        return 'warning';
      case 'unhealthy':
        return 'error';
      default:
        return 'help';
    }
  }

  /**
   * Get health status color
   */
  getHealthStatusColor(status: string): string {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'degraded':
        return 'warn';
      case 'unhealthy':
        return 'error';
      default:
        return 'default';
    }
  }

  /**
   * Get service status color
   */
  getServiceStatusColor(status: string): string {
    return status === 'healthy' ? 'success' : 'warn';
  }

  /**
   * Format uptime
   */
  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.join(' ') || '0m';
  }

  /**
   * Format bytes
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Format percentage
   */
  formatPercentage(value: number): string {
    return `${Math.round(value)}%`;
  }

  /**
   * Get log level color
   */
  getLogLevelColor(level: string): string {
    switch (level) {
      case 'error':
        return 'warn';
      case 'warn':
        return 'accent';
      case 'info':
        return 'primary';
      default:
        return 'default';
    }
  }

  /**
   * Format timestamp
   */
  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * Refresh all data
   */
  refreshAll(): void {
    this.loadAllData();
  }
}
