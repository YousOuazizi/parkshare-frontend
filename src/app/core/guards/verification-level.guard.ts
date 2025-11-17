import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { VerificationLevel } from '../models';

export const verificationLevelGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredLevel = route.data['verificationLevel'] as VerificationLevel;

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (authService.hasMinimumVerificationLevel(requiredLevel)) {
    return true;
  }

  // Redirect to verification page
  router.navigate(['/verification'], {
    queryParams: { requiredLevel }
  });
  return false;
};
