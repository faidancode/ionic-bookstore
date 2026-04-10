// book-card.component.ts
import { Component, input, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-book-card',
  standalone: true,
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.scss'],
  imports: [RouterLink],
})
export class BookCardComponent {
  private router = inject(Router);
  private navCtrl = inject(NavController);

  // Input Signals
  book = input.required<any>();
  index = input<number>(0);

  // Formatted price computed signal
  displayPrice = computed(() => {
    const amount = this.book().priceCents / 100;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  });

  goToDetail(slug: string) {
    console.log({ slug });
    this.navCtrl.navigateForward(`/book-detail/${slug}`);
  }
}
