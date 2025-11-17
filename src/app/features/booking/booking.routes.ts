import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const BOOKING_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./components/booking-list/booking-list.component').then(m => m.BookingListComponent)
  },
  {
    path: ':id',
    canActivate: [authGuard],
    loadComponent: () => import('./components/booking-detail/booking-detail.component').then(m => m.BookingDetailComponent)
  }
];
