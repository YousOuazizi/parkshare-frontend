import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const SWAP_ROUTES: Routes = [
  {
    path: 'listings',
    loadComponent: () => import('./components/swap-listings/swap-listings.component').then(m => m.SwapListingsComponent)
  },
  {
    path: 'create',
    canActivate: [authGuard],
    loadComponent: () => import('./components/swap-create/swap-create.component').then(m => m.SwapCreateComponent)
  },
  {
    path: 'offers',
    canActivate: [authGuard],
    loadComponent: () => import('./components/swap-offers/swap-offers.component').then(m => m.SwapOffersComponent)
  },
  {
    path: '',
    redirectTo: 'listings',
    pathMatch: 'full'
  }
];
