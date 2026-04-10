import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { BookService } from 'src/app/core/services/book.service';
import { Book } from 'src/app/core/models';
import { addIcons } from 'ionicons';
import { arrowBackOutline, bookmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.page.html',
  styleUrls: ['./book-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class BookDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private readonly bookService = inject(BookService);

  constructor() {
    addIcons({
      bookmarkOutline,
      arrowBackOutline,
    });
  }

  // State menggunakan Signal
  book = signal<Book | null>(null);
  isWishlisted = signal(false);

  ngOnInit() {
    console.log('BookDetailPage initialized');
    const bookSlug = this.route.snapshot.paramMap.get('slug');
    if (bookSlug) {
      this.loadBookDetails(bookSlug);
    }
  }

  loadBookDetails(slug: string) {
    this.bookService.getDetail(slug).subscribe((response) => {
      console.log({ response });
      return this.book.set(response.data);
    });
  }

  formatPrice(cents: number | undefined): string {
    if (!cents) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(cents / 100);
  }

  toggleWishlist() {
    this.isWishlisted.update((v) => !v);
  }

  addToCart() {
    console.log('Menambahkan ke keranjang:', this.book()?.title);
    // Logika cart service
  }
}
