import { Injectable, computed, inject, signal } from '@angular/core';
import { BaseApiService } from './base-api.service';
import {
  Address,
  AddressCreatePayload,
  AddressUpdatePayload,
  ApiResponse,
} from '../models';
import { of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private api = inject(BaseApiService);
  private readonly endpoint = '/addresses';

  // --- State ---
  private _addresses = signal<Address[]>([]);
  private _loading = signal(false);
  private _total = signal(0);
  private _page = signal(1);
  private _pageSize = signal(10);
  private _searchQuery = signal('');

  // --- Public Signals (read-only) ---
  readonly addresses = this._addresses.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly total = this._total.asReadonly();
  readonly page = this._page.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();

  hasMore = computed(() => this._addresses().length < this._total());

  // --- Actions ---
  fetchByUser(
    userId: string,
    page: number = 1,
    append: boolean = false,
    search: string = '',
    pageSize: number = 10,
  ) {
    if (!userId) {
      this._addresses.set([]);
      this._total.set(0);
      return of({
        ok: true,
        data: [],
        meta: {
          page: 1,
          pageSize: this._pageSize(),
          total: 0,
          totalPages: 0,
        },
        error: null,
      } as ApiResponse<Address[]>);
    }

    this._loading.set(true);
    this._page.set(page);
    this._pageSize.set(pageSize);
    this._searchQuery.set(search);

    const params = {
      page: page.toString(),
      pageSize: this._pageSize().toString(),
      search,
    };

    return this.api
      .get<ApiResponse<Address[]>>(`${this.endpoint}/user/${userId}`, params)
      .pipe(
        tap({
          next: (res) => {
            if (append) {
              this._addresses.update((prev) => [...prev, ...res.data]);
            } else {
              this._addresses.set(res.data);
            }
            this._total.set(res.meta?.total ?? 0);
            this._loading.set(false);
          },
          error: () => this._loading.set(false),
        }),
      );
  }

  create(payload: AddressCreatePayload) {
    return this.api
      .post<ApiResponse<Address>>(`${this.endpoint}/customer`, payload)
      .pipe(
        tap((res) => {
          const created = res?.data;
          if (created) {
            this._addresses.update((list) => [...list, created]);
          }
        }),
      );
  }

  getDetail(id: string) {
    return this.api.get<ApiResponse<Address>>(`${this.endpoint}/${id}`);
  }

  update(id: string, payload: AddressUpdatePayload) {
    return this.api
      .patch<ApiResponse<Address>>(`${this.endpoint}/customer/${id}`, payload)
      .pipe(
        tap((res) => {
          const updated = res?.data;
          if (updated) {
            this._addresses.update((list) =>
              list.map((item) => (item.id === id ? updated : item)),
            );
          }
        }),
      );
  }

  remove(id: string, userId?: string) {
    const suffix = userId
      ? `${this.endpoint}/customer/${id}?userId=${encodeURIComponent(userId)}`
      : `${this.endpoint}/customer/${id}`;
    return this.api.delete<ApiResponse<unknown>>(suffix).pipe(
      tap(() => {
        this._addresses.update((list) => list.filter((item) => item.id !== id));
      }),
    );
  }
}
