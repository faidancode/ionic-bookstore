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
} from '@ionic/angular/standalone';
import { BookService } from '../../core/services/book.service';
import { BookCardComponent } from '../book-card/book-card.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-popular-books',
  templateUrl: './popular-books.component.html',
  styleUrls: ['./popular-books.component.scss'],
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
    BookCardComponent,
  ],
})
export class PopularBooksComponent implements OnInit {
  private readonly bookService = inject(BookService);
  private readonly destroyRef = inject(DestroyRef);

  readonly books = this.bookService.books;
  readonly loading = this.bookService.loading;

  ngOnInit() {
    this.bookService
      .fetchAll({ page: 1, pageSize: 6, sort: 'createdAt:desc' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
