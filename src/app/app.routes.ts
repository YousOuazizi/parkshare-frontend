import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { verificationLevelGuard } from './core/guards/verification-level.guard';
import { UserRole, VerificationLevel } from './core/models';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },

  // Authentication routes (public)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Parking routes (public for listing, protected for CRUD)
  {
    path: 'parkings',
    loadChildren: () => import('./features/parking/parking.routes').then(m => m.PARKING_ROUTES)
  },

  // Verification routes (protected)
  {
    path: 'verification',
    canActivate: [authGuard],
    loadChildren: () => import('./features/verification/verification.routes').then(m => m.VERIFICATION_ROUTES)
  },

  // Booking routes (protected, requires Level 2+)
  {
    path: 'bookings',
    canActivate: [authGuard, verificationLevelGuard],
    data: { verificationLevel: VerificationLevel.LEVEL_2 },
    loadChildren: () => import('./features/booking/booking.routes').then(m => m.BOOKING_ROUTES)
  },

  // Payment routes (protected)
  {
    path: 'payments',
    canActivate: [authGuard],
    loadChildren: () => import('./features/payment/payment.routes').then(m => m.PAYMENT_ROUTES)
  },

  // Review routes (protected)
  {
    path: 'reviews',
    canActivate: [authGuard],
    loadChildren: () => import('./features/review/review.routes').then(m => m.REVIEW_ROUTES)
  },

  // Subscription routes (protected, requires Level 2+)
  {
    path: 'subscriptions',
    canActivate: [authGuard, verificationLevelGuard],
    data: { verificationLevel: VerificationLevel.LEVEL_2 },
    loadChildren: () => import('./features/subscription/subscription.routes').then(m => m.SUBSCRIPTION_ROUTES)
  },

  // Swap routes (protected, requires Level 2+)
  {
    path: 'swap',
    canActivate: [authGuard, verificationLevelGuard],
    data: { verificationLevel: VerificationLevel.LEVEL_2 },
    loadChildren: () => import('./features/swap/swap.routes').then(m => m.SWAP_ROUTES)
  },

  // Pricing routes (protected, requires Level 3+ for owners)
  {
    path: 'pricing',
    canActivate: [authGuard, verificationLevelGuard],
    data: { verificationLevel: VerificationLevel.LEVEL_3 },
    loadChildren: () => import('./features/pricing/pricing.routes').then(m => m.PRICING_ROUTES)
  },

  // Notification routes (protected)
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadChildren: () => import('./features/notification/notification.routes').then(m => m.NOTIFICATION_ROUTES)
  },

  // Analytics routes (protected)
  {
    path: 'analytics',
    canActivate: [authGuard],
    loadChildren: () => import('./features/analytics/analytics.routes').then(m => m.ANALYTICS_ROUTES)
  },

  // GDPR routes (protected)
  {
    path: 'gdpr',
    canActivate: [authGuard],
    loadChildren: () => import('./features/gdpr/gdpr.routes').then(m => m.GDPR_ROUTES)
  },

  // Profile routes (protected)
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () => import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES)
  },

  // Admin routes (protected, admin only)
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN] },
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },

  // Error pages
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: 'not-found',
    loadComponent: () => import('./shared/pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  },

  // Wildcard route
  {
    path: '**',
    redirectTo: '/not-found'
  }
];
