import { Injectable, computed, inject, signal } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { ApiResponse, Category } from '../models';
import { of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private api = inject(BaseApiService);
  private readonly endpoint = '/categories';

  // --- State ---
  private _categories = signal<Category[]>([]);
  private _loading = signal(false);
  private _total = signal(0);
  private _page = signal(1);
  private _pageSize = signal(10);
  private _searchQuery = signal('');
  private _sort = signal('createdAt:desc');

  // --- Public Signals (read-only) ---
  readonly categories = this._categories.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly total = this._total.asReadonly();
  readonly page = this._page.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly sort = this._sort.asReadonly();

  hasMore = computed(() => this._categories().length < this._total());

  // --- Actions ---
  fetchAll(
    page: number = 1,
    pageSize: number = 10,
    append: boolean = false,
    search: string = '',
    sort: string = 'createdAt:desc',
  ) {
    this._loading.set(true);
    this._page.set(page);
    this._pageSize.set(pageSize);
    this._searchQuery.set(search);
    this._sort.set(sort);

    const params = {
      page: page.toString(),
      pageSize: pageSize.toString(),
      search,
      sort,
    };

    return this.api.get<ApiResponse<Category[]>>(this.endpoint, params).pipe(
      tap({
        next: (res) => {
          console.log('Fetched categories:', res);
          if (append) {
            this._categories.update((prev) => [...prev, ...res.data]);
          } else {
            this._categories.set(res.data);
          }
          this._total.set(res.meta?.total ?? 0);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  getDetail(slugOrId: string) {
    if (!slugOrId) {
      return of({
        ok: true,
        data: null,
        meta: null,
        error: null,
      } as ApiResponse<Category | null>);
    }
    return this.api.get<ApiResponse<Category>>(`${this.endpoint}/${slugOrId}`);
  }
}
