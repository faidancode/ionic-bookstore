import { Injectable, inject, signal } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { ApiResponse, Cart, CartItem } from '../models';
import { of, tap } from 'rxjs';

export interface LocalCartItem {
  id: string;
  title: string;
  slug?: string;
  author?: string;
  price: number;
  coverUrl: string;
  category: string;
  qty: number;
  cartItemId?: string;
}

export type CartWithItems = Cart & {
  data?: CartItem[];
  items?: CartItem[];
};

export type CartItemInput = {
  bookId: string;
  quantity: number;
  priceCentsAtAdd: number;
};

export type CartMergeInput = {
  userId: string;
  items: CartItemInput[];
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private api = inject(BaseApiService);
  private readonly endpoint = '/carts';

  // --- State ---
  private _cart = signal<CartWithItems | null>(null);
  private _loading = signal(false);
  private _count = signal(0);

  // --- Public Signals (read-only) ---
  readonly cart = this._cart.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly count = this._count.asReadonly();

  // --- Helpers ---
  mapLocalItemsToCartInput(items: LocalCartItem[]): CartItemInput[] {
    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }
    return items
      .filter((item) => item && item.qty > 0)
      .map((item) => ({
        bookId: item.id,
        quantity: item.qty,
        priceCentsAtAdd: item.price,
      }));
  }

  mapServerCartItemsToLocal(items?: CartItem[]): LocalCartItem[] {
    if (!Array.isArray(items) || items.length === 0) return [];

    const localItems: LocalCartItem[] = [];

    for (const item of items) {
      if (!item) continue;
      const id = item.bookId;
      if (!id) continue;

      localItems.push({
        id,
        title: item.bookTitle ?? 'Untitled',
        slug: item.bookSlug ?? undefined,
        author: item.bookAuthor ?? undefined,
        price: item.priceCentsAtAdd ?? 0,
        coverUrl: item.bookCoverUrl ?? '',
        category: item.categoryId ?? '',
        qty: item.quantity ?? 1,
        cartItemId: item.id,
      });
    }

    return localItems;
  }

  // --- Actions ---
  replaceCart(input: CartMergeInput) {
    if (!input?.userId) {
      throw new Error('userId is required');
    }
    this._loading.set(true);
    return this.api
      .post<ApiResponse<CartWithItems>>(`${this.endpoint}`, input)
      .pipe(
        tap({
          next: (res) => {
            this._cart.set(res.data ?? null);
            this._loading.set(false);
          },
          error: () => this._loading.set(false),
        }),
      );
  }

  // Alias untuk backward compatibility
  syncCartWithServer(input: CartMergeInput) {
    return this.replaceCart(input);
  }

  getCartByUser(userId: string) {
    if (!userId) {
      this._cart.set(null);
      return of({
        ok: true,
        data: null,
        meta: null,
        error: null,
      } as ApiResponse<CartWithItems | null>);
    }
    this._loading.set(true);
    return this.api.get<ApiResponse<CartWithItems>>(`${this.endpoint}/detail`).pipe(
      tap({
        next: (res) => {
          this._cart.set(res.data ?? null);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  private parseCartCount(payload: unknown): number {
    if (typeof payload === 'number') return payload;
    if (typeof payload === 'string' && payload.trim().length > 0) {
      const parsed = Number(payload);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    if (payload && typeof payload === 'object') {
      const record = payload as Record<string, unknown>;
      const candidates = [
        record.count,
        record.data && typeof record.data === 'object'
          ? (record.data as Record<string, unknown>).count
          : undefined,
      ];
      for (const candidate of candidates) {
        if (typeof candidate === 'number') {
          return candidate;
        }
        if (typeof candidate === 'string' && candidate.trim().length > 0) {
          const parsed = Number(candidate);
          if (!Number.isNaN(parsed)) {
            return parsed;
          }
        }
      }
    }
    throw new Error('Invalid cart count response');
  }

  getCartCount(userId?: string) {
    if (!userId) {
      this._count.set(0);
      return of(0);
    }
    return this.api.get<unknown>(`${this.endpoint}/count`).pipe(
      tap((payload) => {
        this._count.set(this.parseCartCount(payload));
      }),
    );
  }

  updateCartItemQuantity(itemId: string, quantity: number) {
    if (!itemId) {
      throw new Error('itemId is required');
    }
    this._loading.set(true);
    return this.api
      .patch<ApiResponse<CartWithItems>>(
        `${this.endpoint}/items/${encodeURIComponent(itemId)}`,
        { quantity },
      )
      .pipe(
        tap({
          next: (res) => {
            this._cart.set(res.data ?? null);
            this._loading.set(false);
          },
          error: () => this._loading.set(false),
        }),
      );
  }
}
