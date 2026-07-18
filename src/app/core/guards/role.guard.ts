import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

export const roleHomePath: Record<Role, string> = {
  ADMIN: '/admin',
  MEDECIN: '/medecin',
  DELEGUE: '/delegue',
  LABO: '/labo',
};

export function roleGuard(allowedRoles: Role[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.parseUrl('/login');
    }

    const role = authService.currentUserRole;
    if (role && allowedRoles.includes(role)) {
      return true;
    }

    return router.parseUrl(role ? roleHomePath[role] : '/login');
  };
}

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  const role = authService.currentUserRole;
  return router.parseUrl(role ? roleHomePath[role] : '/login');
};
