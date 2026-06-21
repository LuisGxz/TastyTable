import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { API_BASE } from '../config';
import { AuthService } from './auth.service';

/** Attaches the bearer token and transparently refreshes once on 401. */
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const auth = inject(AuthService);
  const isAuthCall = req.url.includes('/auth/login') || req.url.includes('/auth/register') || req.url.includes('/auth/refresh');

  const withAuth = (token: string | null) =>
    token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(withAuth(auth.getAccessToken())).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || isAuthCall || !auth.getRefreshToken() || !req.url.startsWith(API_BASE)) {
        return throwError(() => err);
      }
      return auth.refresh().pipe(
        switchMap(() => next(withAuth(auth.getAccessToken()))),
        catchError((refreshErr) => { auth.clear(); return throwError(() => refreshErr); }),
      );
    }),
  );
}
