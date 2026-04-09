import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Variabel di luar fungsi untuk menjaga state locking antar request
let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<
  string | null
>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const accessToken = auth.accessToken();

  const authReq = accessToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: unknown) => {
      console.log(err);
      if (
        err instanceof HttpErrorResponse &&
        err.status === 401 &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/refresh-token') // Jangan refresh jika yang error adalah endpoint refresh itu sendiri
      ) {
        return handle401Error(auth, req, next);
      }
      return throwError(() => err);
    }),
  );
};

const handle401Error = (
  auth: AuthService,
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return auth.refresh().pipe(
      switchMap((res: any) => {
        isRefreshing = false;
        // Sesuaikan dengan path data di response refresh Anda
        const newToken = res.accessToken;
        refreshTokenSubject.next(newToken);

        return next(
          req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          }),
        );
      }),
      catchError((error) => {
        isRefreshing = false;
        auth.logout();
        return throwError(() => error);
      }),
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => {
        return next(
          req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          }),
        );
      }),
    );
  }
};
