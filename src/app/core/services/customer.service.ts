import { Injectable, inject, signal } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { ApiResponse, User } from '../models';
import { tap } from 'rxjs';

export interface UpdateProfileInput {
  name: string;
  password?: string;
  confirmPassword?: string;
}

export type UpdateProfilePayload = {
  name: string;
  password?: string;
};

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private api = inject(BaseApiService);
  private readonly endpoint = '/customers';

  // --- State ---
  private _loading = signal(false);

  // --- Public Signals (read-only) ---
  readonly loading = this._loading.asReadonly();

  // --- Actions ---
  updateProfile(input: UpdateProfileInput) {
    const payload: UpdateProfilePayload = {
      name: input.name?.trim(),
      password: input.password?.trim() || undefined,
    };

    this._loading.set(true);
    return this.api
      .patch<ApiResponse<User>>(`${this.endpoint}/profile`, payload)
      .pipe(
        tap({
          next: () => this._loading.set(false),
          error: () => this._loading.set(false),
        }),
      );
  }
}
