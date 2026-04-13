import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { BookFilterComponent, FilterPayload } from 'src/app/components/book-filter/book-filter.component';
import { BookService } from 'src/app/core/services/book.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { BookListParams } from 'src/app/core/models';
import { BookCardComponent } from 'src/app/components/book-card/book-card.component';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [IonicModule, CommonModule, BookFilterComponent, BookCardComponent],
  templateUrl: './book-list.page.html',
  styleUrls: ['./book-list.page.scss'],
})
export class BookListPage implements OnInit {
  private bookService = inject(BookService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private modalCtrl = inject(ModalController);

  // Signals dari Services
  books = this.bookService.books;
  loading = this.bookService.loading;
  total = this.bookService.total;
  allCategories = this.categoryService.categories;

  // Single source of truth untuk params
  // Menggunakan tipe data yang konsisten dengan FilterPayload
  currentParams = signal<BookListParams>({
    page: 1,
    pageSize: 12,
    sort: 'createdAt:desc',
    categories: [],
    minPrice: undefined,
    maxPrice: undefined,
    search: undefined
  });

  // Signal untuk menghitung filter aktif (untuk badge UI)
  activeFilterCount = computed(() => {
    const p = this.currentParams();
    let count = 0;
    if (p.minPrice !== undefined && p.minPrice !== null) count++;
    if (p.maxPrice !== undefined && p.maxPrice !== null) count++;
    if (p.categories && p.categories.length > 0) count++;
    return count;
  });

  ngOnInit() {
    // 1. Ambil Kategori untuk filter
    this.categoryService.fetchAll(1, 100).subscribe();

    // 2. Listen ke Query Params (Search dari Home)
    this.route.queryParams.subscribe(params => {
      this.currentParams.update(prev => ({
        ...prev,
        search: params['search'] || undefined,
        page: 1
      }));
      this.loadData();
    });
  }

  loadData(append: boolean = false) {
    this.bookService.fetchAll(this.currentParams(), append).subscribe();
  }

  // Handle perubahan filter dari Sidebar (Desktop) atau Modal (Mobile)
  onFilterChange(filters: FilterPayload) {
    this.currentParams.update(prev => ({
      ...prev,
      ...filters,
      minPrice: filters.minPrice ?? undefined,
      maxPrice: filters.maxPrice ?? undefined,
      page: 1
    }));
    this.loadData();
  }

  async openFilterModal() {
    const modal = await this.modalCtrl.create({
      component: BookFilterComponent,
      componentProps: {
        categories: this.allCategories(),
        initialValue: this.getFilterPayloadFromParams()
      },
      breakpoints: [0, 0.7, 1.0],
      initialBreakpoint: 0.7,
      handle: true,
      cssClass: 'atheneum-filter-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.onFilterChange(data);
    }
  }

  loadMore(event: any) {
    if (this.bookService.hasMore()) {
      this.currentParams.update(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
      this.loadData(true);
      event.target.complete();
    } else {
      event.target.disabled = true;
    }
  }

  // Helper untuk mapping params ke payload filter
  private getFilterPayloadFromParams(): FilterPayload {
    const p = this.currentParams();
    return {
      sort: p.sort || 'createdAt:desc',
      minPrice: p.minPrice ?? null,
      maxPrice: p.maxPrice ?? null,
      categories: p.categories || []
    };
  }
}