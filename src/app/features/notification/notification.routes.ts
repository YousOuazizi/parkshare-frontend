import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const NOTIFICATION_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./components/notification-list/notification-list.component').then(m => m.NotificationListComponent)
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./components/notification-settings/notification-settings.component').then(m => m.NotificationSettingsComponent)
  }
];
