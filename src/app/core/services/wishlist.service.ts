import { Injectable, inject, signal } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { ApiResponse, Wishlist, WishlistCheckResult } from '../models';
import { map, of, switchMap, tap } from 'rxjs';

type WishlistItemInput = {
  bookId: string;
};

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private api = inject(BaseApiService);
  private readonly endpoint = '/wishlists';

  // --- State ---
  private _wishlist = signal<Wishlist | null>(null);
  private _loading = signal(false);

  // --- Public Signals (read-only) ---
  readonly wishlist = this._wishlist.asReadonly();
  readonly loading = this._loading.asReadonly();

  private normalizeWishlistCheck(payload: unknown): WishlistCheckResult {
    if (
      payload &&
      typeof payload === 'object' &&
      'data' in payload &&
      (payload as { data?: unknown }).data
    ) {
      const nested = (payload as { data?: unknown }).data;
      return this.normalizeWishlistCheck(nested);
    }

    if (payload && typeof payload === 'object') {
      const result = payload as {
        isWishlisted?: boolean;
        wishlistItemId?: string | null;
      };
      return {
        isWishlisted: Boolean(result.isWishlisted),
        wishlistItemId: result.wishlistItemId ?? null,
      };
    }

    return { isWishlisted: false, wishlistItemId: null };
  }

  private convertToInputs(bookIds: string[]): WishlistItemInput[] {
    return Array.from(new Set(bookIds.filter(Boolean))).map((bookId) => ({
      bookId,
    }));
  }

  private extractBookIds(wishlist?: Wishlist | null) {
    if (!wishlist || !Array.isArray(wishlist.items)) {
      return [];
    }
    return wishlist.items.map((item) => item.bookId).filter(Boolean);
  }

  checkWishlistStatus(bookId: string) {
    if (!bookId) {
      return of({ isWishlisted: false, wishlistItemId: null });
    }

    return this.api.get<unknown>(`${this.endpoint}/check`, { bookId }).pipe(
      map((payload) => this.normalizeWishlistCheck(payload)),
    );
  }

  private createWishlist(payload: { userId: string; items: WishlistItemInput[] }) {
    return this.api
      .post<ApiResponse<Wishlist>>(this.endpoint, payload)
      .pipe(
        tap((res) => {
          this._wishlist.set(res.data ?? null);
        }),
      );
  }

  private updateWishlist(
    wishlistId: string,
    payload: { items: WishlistItemInput[] },
  ) {
    return this.api
      .patch<ApiResponse<Wishlist>>(`${this.endpoint}/${wishlistId}`, payload)
      .pipe(
        tap((res) => {
          this._wishlist.set(res.data ?? null);
        }),
      );
  }

  getWishlistByUser(options?: { sort?: 'newest' | 'highest' | 'lowest' | string }) {
    this._loading.set(true);
    return this.api
      .get<ApiResponse<Wishlist>>(`${this.endpoint}/detail`, {
        sort: options?.sort,
      })
      .pipe(
        tap({
          next: (res) => {
            this._wishlist.set(res.data ?? null);
            this._loading.set(false);
          },
          error: () => this._loading.set(false),
        }),
      );
  }

  addBookToWishlist(
    userId: string,
    bookId: string,
    options?: { wishlist?: Wishlist | null },
  ) {
    if (!userId || !bookId) {
      throw new Error('userId and bookId are required');
    }

    const existing = options?.wishlist ?? this._wishlist();
    const nextBookIds = this.extractBookIds(existing);
    if (!nextBookIds.includes(bookId)) {
      nextBookIds.push(bookId);
    }
    const items = this.convertToInputs(nextBookIds);

    if (!existing) {
      return this.createWishlist({ userId, items });
    }
    return this.updateWishlist(existing.id, { items });
  }

  removeBookFromWishlist(
    userId: string,
    bookId: string,
    options?: { wishlist?: Wishlist | null; wishlistItemId?: string | null },
  ) {
    if (!userId || !bookId) {
      throw new Error('userId and bookId are required');
    }

    const existing = options?.wishlist ?? this._wishlist();
    const wishlistItemId =
      options?.wishlistItemId ??
      existing?.items?.find((item) => item.bookId === bookId)?.id ??
      null;

    if (!wishlistItemId) {
      return this.getWishlistByUser();
    }

    return this.api
      .delete<ApiResponse<unknown>>(
        `${this.endpoint}/items/${wishlistItemId}`,
      )
      .pipe(switchMap(() => this.getWishlistByUser()));
  }
}
