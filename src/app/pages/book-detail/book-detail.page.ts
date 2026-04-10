import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from 'src/app/core/services/book.service';
import { Book } from 'src/app/core/models';
import { addIcons } from 'ionicons';
import { arrowBackOutline, bookmark, bookmarkOutline } from 'ionicons/icons';
import { CartService } from 'src/app/core/services/cart.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { WishlistService } from 'src/app/core/services/wishlist.service';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.page.html',
  styleUrls: ['./book-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class BookDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readonly bookService = inject(BookService);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);

  constructor() {
    addIcons({
      bookmark,
      bookmarkOutline,
      arrowBackOutline,
    });
  }

  // State menggunakan Signal
  book = signal<Book | null>(null);
  isWishlisted = signal<boolean>(false);
  wishlistItemId = signal<string | null>(null);
  loading = signal(false);

  ngOnInit() {
    console.log('BookDetailPage initialized');
    const bookSlug = this.route.snapshot.paramMap.get('slug');
    if (bookSlug) {
      this.loadBookDetails(bookSlug);
    }
  }

  loadBookDetails(slug: string) {
    this.bookService.getDetail(slug).subscribe((response) => {
      this.book.set(response.data);

      // Setelah data buku didapat, cek status wishlist jika user sudah login
      const user = this.authService.currentUser();
      if (user && response.data) {
        this.checkWishlist(response.data.id);
      }
    });
  }

  checkWishlist(bookId: string) {
    this.wishlistService.checkWishlistStatus(bookId).subscribe((res) => {
      this.isWishlisted.set(res.isWishlisted);

      // Gunakan ?? null untuk menangani nilai undefined
      this.wishlistItemId.set(res.wishlistItemId ?? null);
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

  addToCart() {
    const user = this.authService.currentUser();
    const currentBook = this.book();

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    if (currentBook) {
      this.loading.set(true);

      // Kirim currentBook secara utuh dan tentukan quantity (misal: 1)
      this.cartService.addItem(user.id, currentBook, 1).subscribe({
        next: () => {
          this.loading.set(false);
          console.log('Berhasil ditambahkan ke keranjang');
        },
        error: (err) => {
          this.loading.set(false);
          console.error('Gagal menambahkan ke keranjang', err);
        },
      });
    }
  }

  toggleWishlist() {
    const user = this.authService.currentUser();
    const currentBook = this.book();

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    if (!currentBook) return;

    this.loading.set(true);

    if (this.isWishlisted()) {
      // Jika sudah ada, maka hapus
      this.wishlistService
        .removeBookFromWishlist(user.id, currentBook.id, {
          wishlistItemId: this.wishlistItemId(),
        })
        .subscribe({
          next: () => {
            this.isWishlisted.set(false);
            this.wishlistItemId.set(null);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
    } else {
      // Jika belum ada, maka tambah
      this.wishlistService
        .addBookToWishlist(user.id, currentBook.id)
        .subscribe({
          next: () => {
            // Re-check status untuk mendapatkan wishlistItemId terbaru
            this.checkWishlist(currentBook.id);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
    }
  }
}
