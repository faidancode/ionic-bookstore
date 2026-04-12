import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { CartService } from 'src/app/core/services/cart.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { AddressService } from 'src/app/core/services/address.service';
import { Router } from '@angular/router';
import { AppHeaderComponent } from 'src/app/components/app-header/app-header.component';
import { AddressCardComponent } from 'src/app/components/address-card/address-card.component';
import { AddressFormComponent } from 'src/app/components/address-form/address-form.component';
import { ToastService } from 'src/app/core/services/toast.service';
import { Address } from 'src/app/core/models';
import { addIcons } from 'ionicons';
import { checkmarkCircle } from 'ionicons/icons';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    AppHeaderComponent,
    AddressCardComponent,
    AddressFormComponent
  ],
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {
  private router = inject(Router);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private addressService = inject(AddressService);
  private modalCtrl = inject(ModalController);
  private toastService = inject(ToastService);

  constructor() {
    addIcons({ checkmarkCircle });
  }

  // Cart State
  cart = this.cartService.cart;
  cartLoading = this.cartService.loading;

  // Address State
  addresses = this.addressService.addresses;
  addressLoading = this.addressService.loading;

  // Get top 3 addresses
  topAddresses = computed(() => {
    return this.addresses().slice(0, 3);
  });

  selectedAddressId: string | null = null;

  totalBayar = computed(() => {
    const items = this.cart()?.items || [];
    return items.reduce(
      (acc, item) => acc + item.priceCentsAtAdd * item.quantity,
      0
    );
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const user = this.authService.currentUser();
    if (!user?.id) return;

    this.cartService.getCartByUser(user.id).subscribe();
    this.addressService.fetchByUser(user.id).subscribe({
      next: (addrs) => {
        // Auto select primary address if exists, or first address
        if (addrs && addrs.data.length > 0) {
          const primary = addrs.data.find((a: any) => a.isPrimary);
          if (primary) {
            this.selectedAddressId = primary.id;
          } else {
            this.selectedAddressId = addrs.data[0].id;
          }
        }
      }
    });
  }

  selectAddress(id: string) {
    this.selectedAddressId = id;
  }

  async openAddressModal() {
    const modal = await this.modalCtrl.create({
      component: AddressFormComponent,
      componentProps: {
        initialData: null,
      },
      cssClass: 'atheneum-full-modal',
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.handleFormSubmit(data);
    }
  }

  handleFormSubmit(formData: any) {
    const user = this.authService.currentUser();
    if (!user) return;

    this.addressService.create({ ...formData, userId: user.id }).subscribe({
      next: (res) => {
        this.toastService.show('Alamat baru berhasil ditambahkan', 'success');
        if (!this.selectedAddressId && res?.data?.id) {
          // If no address selected previously, select the newly created one
          this.selectedAddressId = res?.data?.id;
        } else {
          // Reload addresses to make sure the newly created one appears
          this.addressService.fetchByUser(user.id).subscribe();
        }
      },
      error: (err) => {
        this.toastService.show('Gagal menambahkan alamat', 'danger');
        console.error(err);
      },
    });
  }

  formatPrice(cents: number | undefined): string {
    if (cents === undefined || cents === null) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(cents / 100);
  }

  processCheckout() {
    if (!this.selectedAddressId) {
      this.toastService.show('Pilih alamat pengiriman terlebih dahulu', 'danger');
      return;
    }
    if (this.totalBayar() === 0) return;

    console.log('Processed checkout for total:', this.totalBayar(), 'to address ID:', this.selectedAddressId);
    this.toastService.show('Pesanan berhasil dibuat!', 'success');
    this.router.navigate(['/tabs/home']); // go home or to orders page
  }
}
