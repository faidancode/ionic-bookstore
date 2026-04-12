import { Component, OnInit, signal } from '@angular/core';
import {
  IonContent,
  IonIcon,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  searchOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { AppHeaderComponent } from 'src/app/components/app-header/app-header.component';
import { SectionHeaderComponent } from 'src/app/components/section-header/section-header.component';
import { CategoryService } from 'src/app/core/services/category.service';

@Component({
  standalone: true,
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
  imports: [
    IonContent,
    IonIcon,
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    AppHeaderComponent,
    SectionHeaderComponent,
  ],
})
export class CategoryPage implements OnInit {
  // Signals untuk state management
  categories = this.categoryService.categories; // Signal dari service
  loading = this.categoryService.loading; // Signal dari service

  constructor(public categoryService: CategoryService) {
    addIcons({ searchOutline, chevronForwardOutline, chevronBackOutline });
  }

  ngOnInit() {
    this.categoryService.fetchAll().subscribe();
  }

  onSearch(event: any) {
    const query = event.target.value;
    this.categoryService.fetchAll(1, 10, false, query).subscribe();
  }

  loadMore(event: any) {
    this.categoryService
      .fetchAll(this.categoryService.page() + 1, 10, true)
      .subscribe({
        next: () => {
          event.target.complete();
          // Jika sudah tidak ada data lagi, disable infinite scroll
          if (!this.categoryService.hasMore()) {
            event.target.disabled = true;
          }
        },
        error: () => event.target.complete(),
      });
  }

  navigateToCategory(category: any) {
    // Navigasi ke detail
  }
}
