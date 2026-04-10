import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { WishlistService } from 'src/app/core/services/wishlist.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { BookCardComponent } from 'src/app/components/book-card/book-card.component';
import { addIcons } from 'ionicons';
import { arrowBackOutline, bagHandleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.page.html',
  styleUrls: ['./wishlist.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink, BookCardComponent],
})
export class WishlistPage implements OnInit {
  private router = inject(Router);
  private wishlistService = inject(WishlistService);
  private authService = inject(AuthService);

  constructor() {
    addIcons({
      bagHandleOutline,
      arrowBackOutline,
    });
  }

  // --- State ---
  loading = this.wishlistService.loading;

  // Ambil items dari signal wishlist di service
  wishlistItems = computed(() => {
    const data = this.wishlistService.wishlist();
    return data?.items || [];
  });

  ngOnInit() {
    this.loadWishlist();
  }

  loadWishlist() {
    const user = this.authService.currentUser();
    if (user) {
      this.wishlistService.getWishlistByUser().subscribe();
    }
  }

  loadMore(event: any) {
    // Catatan: API Anda saat ini mengembalikan seluruh list tanpa pagination server-side
    // Jika nanti ditambahkan pagination, logika fetch-nya diletakkan di sini.
    event.target.complete();
    event.target.disabled = true;
  }

  toCart() {
    this.router.navigate(['/cart']);
  }
}
