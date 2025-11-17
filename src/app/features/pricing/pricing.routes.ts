import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PRICING_ROUTES: Routes = [
  {
    path: 'dashboard/:parkingId',
    canActivate: [authGuard],
    loadComponent: () => import('./components/pricing-dashboard/pricing-dashboard.component').then(m => m.PricingDashboardComponent)
  },
  {
    path: '',
    redirectTo: '/parkings',
    pathMatch: 'full'
  }
];
