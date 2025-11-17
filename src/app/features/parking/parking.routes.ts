import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { verificationLevelGuard } from '../../core/guards/verification-level.guard';
import { VerificationLevel } from '../../core/models';

export const PARKING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/parking-list/parking-list.component').then(m => m.ParkingListComponent)
  },
  {
    path: 'create',
    canActivate: [authGuard, verificationLevelGuard],
    data: { verificationLevel: VerificationLevel.LEVEL_3 },
    loadComponent: () => import('./components/parking-form/parking-form.component').then(m => m.ParkingFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/parking-detail/parking-detail.component').then(m => m.ParkingDetailComponent)
  },
  {
    path: ':id/edit',
    canActivate: [authGuard, verificationLevelGuard],
    data: { verificationLevel: VerificationLevel.LEVEL_3 },
    loadComponent: () => import('./components/parking-form/parking-form.component').then(m => m.ParkingFormComponent)
  }
];
