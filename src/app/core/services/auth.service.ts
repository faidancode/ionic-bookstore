import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CurrentUser, LoginPayload, LoginResponse } from '../models';
import { Observable, throwError } from 'rxjs';

const STORAGE_KEY = 'current_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // --- State ---
  private _currentUser = signal<CurrentUser | null>(this.loadFromStorage());

  // --- Public Signals ---
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(
    () => this._currentUser()?.role === 'ADMINISTRATOR',
  );
  readonly accessToken = computed(
    () => this._currentUser()?.accessToken ?? null,
  );

  // --- Actions ---
  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http
      .post<any>(`${environment.BASE_URL}/auth/login`, payload)
      .pipe(
        map((res) => res.data as LoginResponse),
        tap((res) => {
          this.saveAuthenticatedUser(res);
          this.router.navigate(['/dashboard']);
        }),
      );
  }

  refresh(): Observable<any> {
    const user = this._currentUser();

    if (!user?.refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post<any>(`${environment.BASE_URL}/auth/refresh`, {
        refreshToken: user.refreshToken,
      })
      .pipe(
        map((res) => res.data),
        tap((res) => {
          console.log('Token refreshed successfully');
          this.saveAuthenticatedUser(res);
        }),
      );
  }

  logout() {
    this._currentUser.set(null);
    localStorage.removeItem(STORAGE_KEY);
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  // --- Helpers ---
  private saveAuthenticatedUser(res: any) {
    const user: CurrentUser = {
      id: res.userId,
      name: res.user.name,
      email: res.user.email,
      role: res.role,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    };

    this._currentUser.set(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  private loadFromStorage(): CurrentUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CurrentUser) : null;
    } catch {
      return null;
    }
  }
}
