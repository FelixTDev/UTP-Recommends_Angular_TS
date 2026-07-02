import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role'] as string;
  const currentRole = authService.userRole();

  if (authService.isAuthenticated() && currentRole === expectedRole) {
    return true;
  }

  // Not authorized, redirect based on role or to public view
  if (currentRole === 'ADMIN') {
    router.navigate(['/admin/inicio']);
  } else if (currentRole === 'ESTUDIANTE') {
    router.navigate(['/estudiante/inicio']);
  } else {
    router.navigate(['/public/inicio']);
  }
  return false;
};
