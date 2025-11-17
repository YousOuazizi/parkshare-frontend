import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const REVIEW_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/review-list/review-list.component').then(m => m.ReviewListComponent)
  },
  {
    path: 'create/:parkingId',
    canActivate: [authGuard],
    loadComponent: () => import('./components/review-create/review-create.component').then(m => m.ReviewCreateComponent)
  }
];
