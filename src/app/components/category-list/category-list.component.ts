import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCol,
  IonGrid,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonSpinner,
  IonIcon,
  IonContent,
} from '@ionic/angular/standalone';
import { CategoryService } from '../../core/services/category.service';
import { CategoryCardComponent } from '../category-card/category-card.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonGrid,
    IonRow,
    IonCol,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonIcon,
    IonContent,
    CategoryCardComponent,
  ],
})
export class CategoryListComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = this.categoryService.categories;
  readonly loading = this.categoryService.loading;

  ngOnInit() {
    this.categoryService
      .fetchAll(1, 8, false, '', 'createdAt:desc')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
