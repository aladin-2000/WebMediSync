import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  const authorizedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  const isLoginRequest = req.url.endsWith('/auth/login');

  return next(authorizedReq).pipe(
    catchError((error) => {
      if (!isLoginRequest && (error.status === 401 || error.status === 403)) {
        const message = error.error?.message || '';
        authService.logout();
        router.navigate(['/login'], message ? { queryParams: { message } } : {});
      }
      return throwError(() => error);
    })
  );
};
