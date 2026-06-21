import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.hasTokens() ? true : router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.hasTokens() ? router.createUrlTree(['/tabs']) : true;
};

/** Routes the landing path to the right home depending on role. */
export const homeRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.hasTokens()) return router.createUrlTree(['/login']);
  return router.createUrlTree([auth.role() === 'owner' ? '/tabs/restaurant' : '/tabs/discover']);
};
