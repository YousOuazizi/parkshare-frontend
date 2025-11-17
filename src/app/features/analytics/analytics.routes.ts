import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/models';

export const ANALYTICS_ROUTES: Routes = [
  {
    path: 'user',
    canActivate: [authGuard],
    loadComponent: () => import('./components/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent)
  },
  {
    path: 'owner',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.OWNER, UserRole.ADMIN] },
    loadComponent: () => import('./components/owner-dashboard/owner-dashboard.component').then(m => m.OwnerDashboardComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN] },
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: '',
    redirectTo: 'user',
    pathMatch: 'full'
  }
];
