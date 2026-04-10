import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { OrderService } from 'src/app/core/services/order.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import { AppHeaderComponent } from 'src/app/components/app-header/app-header.component';

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    CommonModule,
    FormsModule,
    AppHeaderComponent,
  ],
})
export class OrderPage implements OnInit {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);

  orders = this.orderService.orders;
  loading = this.orderService.loading;
  hasMore = computed(() => this.orders().length < this.orderService.total());

  ngOnInit() {
    console.log('fetching orders...');
    this.fetchOrders();
  }

  fetchOrders(append = false) {
    const user = this.authService.currentUser();
    if (user) {
      this.orderService
        .listByUser(
          user.id,
          { page: append ? this.orderService.page() + 1 : 1 },
          append,
        )
        .subscribe();
    }
  }

  loadMore(event: any) {
    this.fetchOrders(true);
    event.target.complete();
  }

  goToDetail(id: string) {
    this.router.navigate(['/tabs/order', id]);
  }

  formatPrice(cents: number | undefined) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format((cents || 0) / 100);
  }
}
