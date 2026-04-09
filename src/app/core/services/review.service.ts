import { Injectable, computed, inject, signal } from '@angular/core';
import { BaseApiService } from './base-api.service';
import {
  ApiResponse,
  BookReviewsPageData,
  CreateReviewPayload,
  Review,
  ReviewEligibility,
} from '../models';
import { of, tap } from 'rxjs';

export interface ReviewWithBook extends Review {
  bookSlug?: string | null;
  bookTitle?: string | null;
  bookCoverUrl?: string | null;
  bookAuthorName?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private api = inject(BaseApiService);
  private readonly endpoint = '/books';

  // --- State ---
  private _reviews = signal<ReviewWithBook[]>([]);
  private _loading = signal(false);
  private _total = signal(0);
  private _page = signal(1);
  private _pageSize = signal(10);

  // --- Public Signals (read-only) ---
  readonly reviews = this._reviews.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly total = this._total.asReadonly();
  readonly page = this._page.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();

  hasMore = computed(() => this._reviews().length < this._total());

  // --- Actions ---
  listByUser(
    userId: string,
    params?: { page?: number; pageSize?: number },
    append: boolean = false,
  ) {
    if (!userId) {
      this._reviews.set([]);
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
      } as ApiResponse<ReviewWithBook[]>);
    }

    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    this._loading.set(true);
    this._page.set(page);
    this._pageSize.set(pageSize);

    return this.api
      .get<ApiResponse<ReviewWithBook[]>>(
        `${this.endpoint}/user/${userId}/reviews`,
        { page, pageSize },
      )
      .pipe(
        tap({
          next: (res) => {
            const list = res.data ?? [];
            if (append) {
              this._reviews.update((prev) => [...prev, ...list]);
            } else {
              this._reviews.set(list);
            }
            this._total.set(res.meta?.total ?? 0);
            this._loading.set(false);
          },
          error: () => this._loading.set(false),
        }),
      );
  }

  checkEligibility(slug: string) {
    if (!slug) {
      throw new Error('Slug is required to check eligibility.');
    }
    return this.api.get<ApiResponse<ReviewEligibility>>(
      `${this.endpoint}/${slug}/reviews/eligibility`,
    );
  }

  createReview(slug: string, payload: CreateReviewPayload) {
    if (!slug) {
      throw new Error('Slug is required to create a review.');
    }
    return this.api.post<ApiResponse<unknown>>(
      `${this.endpoint}/${slug}/reviews`,
      payload,
    );
  }

  getBookReviews(
    slug: string,
    params: { page: number; pageSize: number; sort?: string; rating?: number },
  ) {
    const requestParams = {
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
      sort: params.sort,
      rating: params.rating,
    };
    return this.api.get<ApiResponse<BookReviewsPageData>>(
      `${this.endpoint}/${slug}/reviews`,
      requestParams,
    );
  }
}
