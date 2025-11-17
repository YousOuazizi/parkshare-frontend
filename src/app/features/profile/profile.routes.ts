import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'edit',
    loadComponent: () => import('./pages/profile-edit/profile-edit.component').then(m => m.ProfileEditComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/profile-settings/profile-settings.component').then(m => m.ProfileSettingsComponent)
  }
];
