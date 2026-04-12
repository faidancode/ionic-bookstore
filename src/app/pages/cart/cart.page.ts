import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CartService } from 'src/app/core/services/cart.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline, bookmarkOutline } from 'ionicons/icons';
import { AppHeaderComponent } from 'src/app/components/app-header/app-header.component';
import { SectionHeaderComponent } from 'src/app/components/section-header/section-header.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    AppHeaderComponent,
    SectionHeaderComponent,
    RouterLink,
  ],
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  private router = inject(Router);
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  constructor() {
    addIcons({
      bookmarkOutline,
      arrowBackOutline,
    });
  }

  // --- State ---
  // Mengambil data keranjang langsung dari service
  cart = this.cartService.cart;
  loading = this.cartService.loading;

  // Menggunakan computed untuk kalkulasi total otomatis
  totalBayar = computed(() => {
    const items = this.cart()?.items || [];
    return items.reduce(
      (acc, item) => acc + item.priceCentsAtAdd * item.quantity,
      0,
    );
  });

  ngOnInit() {
    this.refreshCart();
  }

  refreshCart() {
    const user = this.authService.currentUser();
    if (!user?.id) return;
    this.cartService.getCartByUser(user.id).subscribe({
      next: () => {},
    });
  }

  /**
   * Mengubah jumlah item
   */
  updateQty(bookId: string | undefined, newQty: number) {
    if (!bookId) return;

    const user = this.authService.currentUser();
    if (!user?.id) return;

    if (newQty < 1) {
      this.cartService.removeItem(user.id, bookId).subscribe({
        next: () => console.log('Item removed'),
        error: (err) => console.error(err),
      });
      return; // Hentikan eksekusi agar tidak lanjut ke updateCartItemQuantity
    }
    this.cartService.updateCartItemQuantity(user.id, bookId, newQty).subscribe({
      next: () => {
        // Berhasil diperbarui, Signal cart otomatis terupdate di service
        console.log('Jumlah item diperbarui');
      },
    });
  }

  /**
   * Format angka ke Rupiah
   */
  formatPrice(cents: number | undefined): string {
    if (cents === undefined || cents === null) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(cents / 100);
  }

  /**
   * Logika lanjut ke pembayaran
   */
  checkout() {
    if (this.totalBayar() === 0) return;
    this.router.navigate(['/checkout']);
  }

  toWishlist() {
    this.router.navigate(['/tabs/wishlist']);
  }
}
