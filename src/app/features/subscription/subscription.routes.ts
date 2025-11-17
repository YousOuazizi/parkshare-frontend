import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const SUBSCRIPTION_ROUTES: Routes = [
  {
    path: 'plans',
    loadComponent: () => import('./components/subscription-plans/subscription-plans.component').then(m => m.SubscriptionPlansComponent)
  },
  {
    path: 'my-subscriptions',
    canActivate: [authGuard],
    loadComponent: () => import('./components/my-subscriptions/my-subscriptions.component').then(m => m.MySubscriptionsComponent)
  },
  {
    path: '',
    redirectTo: 'plans',
    pathMatch: 'full'
  }
];
