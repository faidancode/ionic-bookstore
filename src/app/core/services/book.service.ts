import { Injectable, computed, inject, signal } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { ApiResponse, Book, BookListParams } from '../models';
import { of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookService {
  private api = inject(BaseApiService);
  private readonly endpoint = '/books';

  // --- State ---
  private _books = signal<Book[]>([]);
  private _selectedBook = signal<Book | null>(null); // State baru untuk detail
  private _loading = signal(false);
  private _total = signal(0);
  private _page = signal(1);
  private _pageSize = signal(10);
  private _searchQuery = signal('');
  private _sort = signal('createdAt:desc');
  private _categories = signal<string[]>([]);
  private _minPrice = signal<number | null>(null);
  private _maxPrice = signal<number | null>(null);
  private _isFlashSale = signal<boolean | null>(null);

  // --- Public Signals (read-only) ---
  readonly books = this._books.asReadonly();
  readonly selectedBook = this._selectedBook.asReadonly(); // Public access
  readonly loading = this._loading.asReadonly();
  readonly total = this._total.asReadonly();
  readonly page = this._page.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly sort = this._sort.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly minPrice = this._minPrice.asReadonly();
  readonly maxPrice = this._maxPrice.asReadonly();
  readonly isFlashSale = this._isFlashSale.asReadonly();

  hasMore = computed(() => this._books().length < this._total());

  // --- Actions ---
  fetchAll(params: BookListParams = {}, append: boolean = false) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const search = params.search ?? '';
    const sort = params.sort ?? 'createdAt:desc';
    const categories = params.categories ?? [];
    const minPrice = params.minPrice ?? null;
    const maxPrice = params.maxPrice ?? null;
    const isFlashSale =
      typeof params.isFlashSale === 'boolean' ? params.isFlashSale : null;

    this._loading.set(true);
    this._page.set(page);
    this._pageSize.set(pageSize);
    this._searchQuery.set(search);
    this._sort.set(sort);
    this._categories.set(categories);
    this._minPrice.set(minPrice);
    this._maxPrice.set(maxPrice);
    this._isFlashSale.set(isFlashSale);

    const requestParams = {
      page: page.toString(),
      pageSize: pageSize.toString(),
      search,
      categories: categories.length > 0 ? categories.join(',') : undefined,
      category: params.category,
      minPrice: minPrice ?? undefined,
      maxPrice: maxPrice ?? undefined,
      sort,
      isFlashSale: isFlashSale ?? undefined,
    };

    return this.api.get<ApiResponse<Book[]>>(this.endpoint, requestParams).pipe(
      tap({
        next: (res) => {
          if (append) {
            this._books.update((prev) => [...prev, ...res.data]);
          } else {
            this._books.set(res.data);
          }
          this._total.set(res.meta?.total ?? 0);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  getDetail(idOrSlug: string, userId?: string) {
    if (!idOrSlug) {
      this._selectedBook.set(null);
      return of({
        ok: true,
        data: null,
        meta: null,
        error: null,
      } as ApiResponse<Book | null>);
    }

    this._loading.set(true);
    const params = userId ? { userId } : undefined;

    return this.api
      .get<ApiResponse<Book>>(`${this.endpoint}/${idOrSlug}`, params)
      .pipe(
        tap({
          next: (res) => {
            if (res.data) {
              this._selectedBook.set(res.data);
            }
            this._loading.set(false);
          },
          error: () => {
            this._loading.set(false);
            this._selectedBook.set(null);
          },
        }),
      );
  }

  /**
   * Helper untuk mengupdate state _selectedBook secara manual dari komponen
   * Berguna jika data sudah ada di list dan ingin langsung ditampilkan
   * tanpa hit API lagi (Optimistic UI).
   */
  setSelectedBook(book: Book | null) {
    this._selectedBook.set(book);
  }

  /**
   * Membersihkan data detail (misalnya saat meninggalkan halaman)
   */
  clearSelectedBook() {
    this._selectedBook.set(null);
  }
}
