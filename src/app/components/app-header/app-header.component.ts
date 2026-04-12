import { Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonBackButton,
  IonTitle,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, arrowBackOutline, bagHandleOutline } from 'ionicons/icons';
import { CartService } from 'src/app/core/services/cart.service';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonBackButton,
    IonTitle,
    IonIcon,
  ],
})
export class AppHeaderComponent {
  // Input menggunakan Signal (Required atau Optional dengan default)
  private cartService = inject(CartService);
  private router = inject(Router);

  title = input<string>('');
  hideBackButton = input<boolean>(false);
  showEndButton = input<boolean>(true);
  backHref = input<string>('/tabs/home');
  endIcon = input<string>('');

  showCart = input<boolean>(true);
  // cartCount = computed(() => this.cartService.getCartCount());

  onEndButtonClick = output<void>();

  constructor() {
    addIcons({
      arrowBackOutline,
      add,
      bagHandleOutline
    });
  }

  cartCount = computed(() => {
    const count = this.cartService.count(); // Pastikan ini hanya return nilai
    return count;
  });

  ngOnInit() {
    // Membaca signal di ngOnInit untuk log diperbolehkan
    console.log('Current Cart Count:', this.cartCount());
  }

  handleEndClick() {
    this.onEndButtonClick.emit();
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}
