import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const GDPR_ROUTES: Routes = [
  {
    path: 'consent',
    canActivate: [authGuard],
    loadComponent: () => import('./components/gdpr-consent/gdpr-consent.component').then(m => m.GdprConsentComponent)
  },
  {
    path: 'export',
    canActivate: [authGuard],
    loadComponent: () => import('./components/gdpr-export/gdpr-export.component').then(m => m.GdprExportComponent)
  },
  {
    path: 'delete',
    canActivate: [authGuard],
    loadComponent: () => import('./components/gdpr-delete/gdpr-delete.component').then(m => m.GdprDeleteComponent)
  },
  {
    path: '',
    redirectTo: 'consent',
    pathMatch: 'full'
  }
];
