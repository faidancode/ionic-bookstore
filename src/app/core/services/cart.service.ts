import { Injectable, inject, signal } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { ApiResponse, Book, Cart, CartItem } from '../models';
import { of, tap, catchError, throwError, Observable } from 'rxjs';
import { ToastController } from '@ionic/angular';

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
  private toastCtrl = inject(ToastController);
  private readonly endpoint = '/carts';

  // --- State Signals ---
  private _cart = signal<CartWithItems | null>(null);
  private _loading = signal(false);
  private _count = signal(0);

  // --- Public Read-only Signals ---
  readonly cart = this._cart.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly count = this._count.asReadonly();

  /**
   * Helper untuk menampilkan pesan feedback ala 'sonner'
   */
  private async showToast(
    message: string,
    color: 'success' | 'danger' = 'success',
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
      buttons: [{ text: 'OK', role: 'cancel' }],
    });
    await toast.present();
  }

  /**
   * CORE SYNC LOGIC: Mengirim state lokal ke server.
   * Jika gagal, melakukan ROLLBACK ke state sebelumnya.
   */
  private syncWithServer(
    userId: string,
    updatedItems: CartItemInput[],
    prevCart: CartWithItems | null,
  ): Observable<ApiResponse<CartWithItems>> {
    const payload: CartMergeInput = { userId, items: updatedItems };
    console.log('Syncing cart with server...', payload);

    this._loading.set(true);
    return this.api
      .post<ApiResponse<CartWithItems>>(`${this.endpoint}`, payload)
      .pipe(
        tap((res) => {
          this._cart.set(res.data ?? null);
          // Update count manual dari jumlah item unik atau total qty
          const totalCount =
            res.data?.items?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
          this._count.set(totalCount);
          this._loading.set(false);
        }),
        catchError((err) => {
          // Optimistic Rollback: Kembalikan ke state sebelum perubahan
          this._cart.set(prevCart);
          this._loading.set(false);
          this.showToast(
            err?.error?.message || 'Gagal menyinkronkan keranjang',
            'danger',
          );
          return throwError(() => err);
        }),
      );
  }

  /**
   * Menambah item ke keranjang (Optimistic)
   */
  addItem(userId: string, book: Book, qty: number = 1) {
    const prevCart = this._cart();
    const currentItems = prevCart?.items || [];

    // Siapkan payload berdasarkan data saat ini
    const updatedItemsForPayload: CartItemInput[] = currentItems.map((i) => ({
      bookId: i.bookId,
      quantity: i.quantity,
      priceCentsAtAdd: i.priceCentsAtAdd,
    }));

    const existingIndex = updatedItemsForPayload.findIndex(
      (i) => i.bookId === book.id,
    );

    if (existingIndex >= 0) {
      updatedItemsForPayload[existingIndex].quantity += qty;
    } else {
      updatedItemsForPayload.push({
        bookId: book.id,
        quantity: qty,
        priceCentsAtAdd: book?.priceCents,
      });
    }

    return this.syncWithServer(userId, updatedItemsForPayload, prevCart).pipe(
      tap(() => this.showToast('Buku berhasil ditambahkan')),
    );
  }

  /**
   * Update quantity item (Digunakan di halaman Cart)
   */
  updateCartItemQuantity(userId: string, bookId: string, newQty: number) {
    const prevCart = this._cart();
    if (!prevCart) {
      return throwError(() => new Error('Cart tidak tersedia'));
    }
    const updatedItemsForPayload: CartItemInput[] = (prevCart.items || [])
      .map((i) => ({
        bookId: i.bookId,
        quantity: i.bookId === bookId ? newQty : i.quantity,
        priceCentsAtAdd: i.priceCentsAtAdd,
      }))
      .filter((i) => i.quantity > 0);

    return this.syncWithServer(userId, updatedItemsForPayload, prevCart);
  }

  /**
   * Menghapus item dari keranjang (Optimistic)
   */
  // Tambahkan return type yang jelas
  removeItem(
    userId: string,
    bookId: string,
  ): Observable<ApiResponse<CartWithItems> | null> {
    const prevCart = this._cart();

    if (!prevCart) return of(null);

    const updatedItemsForPayload = (prevCart.items || [])
      .filter((i) => i.bookId !== bookId)
      .map((i) => ({
        bookId: i.bookId,
        quantity: i.quantity,
        priceCentsAtAdd: i.priceCentsAtAdd,
      }));

    return this.syncWithServer(userId, updatedItemsForPayload, prevCart).pipe(
      tap(() => this.showToast('Item dihapus dari keranjang')),
    );
  }

  /**
   * Mengosongkan keranjang (Optimistic)
   */
  clearCart(userId: string) {
    const prevCart = this._cart();
    this._cart.set(null);
    this._count.set(0);

    return this.syncWithServer(userId, [], prevCart).pipe(
      tap(() => this.showToast('Keranjang telah dikosongkan')),
    );
  }

  /**
   * Load data keranjang dari server (biasanya saat login atau init app)
   */
  getCartByUser(userId: string) {
    if (!userId) {
      this._cart.set(null);
      this._count.set(0);
      return throwError(() => new Error('User ID tidak valid'));
    }

    this._loading.set(true);
    return this.api
      .get<ApiResponse<CartWithItems>>(`${this.endpoint}/detail`)
      .pipe(
        tap((res) => {
          this._cart.set(res.data ?? null);
          const totalCount =
            res.data?.items?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
          this._count.set(totalCount);
          this._loading.set(false);
        }),
        catchError((err) => {
          this._loading.set(false);
          return throwError(() => err);
        }),
      );
  }

  /**
   * Mendapatkan jumlah item di keranjang secara spesifik dari server
   */
  getCartCount(userId?: string) {
    if (!userId) {
      this._count.set(0);
      return of(0);
    }
    return this.api.get<any>(`${this.endpoint}/count`).pipe(
      tap((payload) => {
        const count = this.parseCartCount(payload);
        this._count.set(count);
      }),
    );
  }

  private parseCartCount(payload: any): number {
    if (typeof payload === 'number') return payload;
    if (payload?.data?.count !== undefined) return payload.data.count;
    if (payload?.count !== undefined) return payload.count;
    return 0;
  }
}
