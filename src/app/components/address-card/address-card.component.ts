import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Address } from 'src/app/core/models';

@Component({
  selector: 'app-address-card',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './address-card.component.html',
  styleUrls: ['./address-card.component.scss'],
})
export class AddressCardComponent {
  /**
   * Data alamat yang akan ditampilkan
   */
  address = input.required<Address>();

  /**
   * Status apakah kartu ini sedang dipilih (misal di halaman Checkout)
   */
  isSelected = input<boolean>(false);

  /**
   * Menggabungkan detail area menjadi satu baris string yang rapi
   */
  formattedArea = computed(() => {
    const addr = this.address();
    const parts = [addr.district, addr.city, addr.postalCode].filter(Boolean);
    return parts.join(', ');
  });
}
