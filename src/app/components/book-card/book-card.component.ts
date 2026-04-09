// book-card.component.ts
import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-book-card',
  standalone: true,
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.scss'],
})
export class BookCardComponent {
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
}
