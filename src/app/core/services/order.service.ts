import { Injectable, computed, inject, signal } from '@angular/core';
import { BaseApiService } from './base-api.service';
import {
  ApiResponse,
  CheckoutPayload,
  CheckoutResult,
  MidtransSnapTokenResponse,
  Order,
  OrderAddressSnapshot,
} from '../models';
import { of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private api = inject(BaseApiService);
  private readonly endpoint = '/orders';

  // --- State ---
  private _orders = signal<Order[]>([]);
  private _loading = signal(false);
  private _total = signal(0);
  private _page = signal(1);
  private _pageSize = signal(10);
  private _status = signal<string | null>(null);

  // --- Public Signals (read-only) ---
  readonly orders = this._orders.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly total = this._total.asReadonly();
  readonly page = this._page.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly status = this._status.asReadonly();

  hasMore = computed(() => this._orders().length < this._total());

  private normalizeAddressSnapshot(order: Order | null | undefined): Order | null {
    if (!order) return order ?? null;
    const snapshot = order.addressSnapshot as
      | OrderAddressSnapshot
      | string
      | undefined;
    if (snapshot && typeof snapshot === 'string') {
      try {
        const parsed = JSON.parse(snapshot) as OrderAddressSnapshot;
        return { ...order, addressSnapshot: parsed };
      } catch {
        return {
          ...order,
          addressSnapshot: {
            id: '',
            label: snapshot,
            recipientName: '',
            recipientPhone: '',
            street: snapshot,
          } as OrderAddressSnapshot,
        };
      }
    }
    return order;
  }

  private normalizeOrdersList(list: Order[]): Order[] {
    return list.map((order) => this.normalizeAddressSnapshot(order) ?? order);
  }

  // --- Actions ---
  checkoutOrder(input: CheckoutPayload, options?: { idempotencyKey?: string }) {
    if (!input?.userId || !input?.addressId) {
      throw new Error('userId and addressId are required');
    }

    this._loading.set(true);
    return this.api
      .post<ApiResponse<CheckoutResult>>(`${this.endpoint}/checkout`, {
        ...input,
      })
      .pipe(
        tap({
          next: (res) => {
            const result = res?.data;
            if (result?.order) {
              this._orders.update((prev) => [result.order, ...prev]);
            }
            this._loading.set(false);
          },
          error: () => this._loading.set(false),
        }),
      );
  }

  listByUser(
    userId: string,
    params?: { page?: number; pageSize?: number; status?: string },
    append: boolean = false,
  ) {
    if (!userId) {
      this._orders.set([]);
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
      } as ApiResponse<Order[]>);
    }

    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const status =
      params?.status && params.status.toUpperCase() !== 'ALL'
        ? params.status
        : undefined;

    this._loading.set(true);
    this._page.set(page);
    this._pageSize.set(pageSize);
    this._status.set(status ?? null);

    const requestParams = {
      page: page.toString(),
      pageSize: pageSize.toString(),
      status,
    };

    return this.api
      .get<ApiResponse<Order[]>>(
        `${this.endpoint}/user/${userId}`,
        requestParams,
      )
      .pipe(
        tap({
          next: (res) => {
            const normalized = this.normalizeOrdersList(res.data ?? []);
            if (append) {
              this._orders.update((prev) => [...prev, ...normalized]);
            } else {
              this._orders.set(normalized);
            }
            this._total.set(res.meta?.total ?? 0);
            this._loading.set(false);
          },
          error: () => this._loading.set(false),
        }),
      );
  }

  getDetail(orderId: string) {
    if (!orderId) {
      return of({
        ok: true,
        data: null,
        meta: null,
        error: null,
      } as ApiResponse<Order | null>);
    }
    return this.api.get<ApiResponse<Order>>(`${this.endpoint}/${orderId}`).pipe(
      tap((res) => {
        if (res?.data) {
          this.normalizeAddressSnapshot(res.data);
        }
      }),
    );
  }

  markCompletedByCustomer(orderId: string) {
    if (!orderId) {
      throw new Error('orderId is required');
    }
    return this.api
      .patch<ApiResponse<Order>>(
        `${this.endpoint}/${orderId}/status/customer`,
        {},
      )
      .pipe(
        tap((res) => {
          const updated = this.normalizeAddressSnapshot(res?.data ?? null);
          if (updated) {
            this._orders.update((list) =>
              list.map((item) => (item.id === orderId ? updated : item)),
            );
          }
        }),
      );
  }

  createMidtransSnapTransaction(orderId: string) {
    if (!orderId) {
      throw new Error('orderId is required to continue payment');
    }
    return this.api.post<ApiResponse<MidtransSnapTokenResponse>>(
      `${this.endpoint}/${orderId}/continue-payment`,
      { orderId },
    );
  }

  cancelByCustomer(orderId: string) {
    if (!orderId) {
      throw new Error('orderId is required');
    }
    return this.api
      .post<ApiResponse<Order>>(
        `${this.endpoint}/${orderId}/cancel/customer`,
        {},
      )
      .pipe(
        tap((res) => {
          const updated = this.normalizeAddressSnapshot(res?.data ?? null);
          if (updated) {
            this._orders.update((list) =>
              list.map((item) => (item.id === orderId ? updated : item)),
            );
          }
        }),
      );
  }
}
