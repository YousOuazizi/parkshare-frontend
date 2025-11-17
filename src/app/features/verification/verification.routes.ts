import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const VERIFICATION_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./components/verification-wizard/verification-wizard.component').then(m => m.VerificationWizardComponent)
  },
  {
    path: 'upload',
    canActivate: [authGuard],
    loadComponent: () => import('./components/verification-upload/verification-upload.component').then(m => m.VerificationUploadComponent)
  }
];
