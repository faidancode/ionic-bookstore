import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './section-header.component.html',
  styleUrls: ['./section-header.component.scss'],
})
export class SectionHeaderComponent {
  // Judul utama (misal: "Koleksi")
  title = input.required<string>();

  // Judul aksen/outline (misal: "Tersimpan")
  subtitleAksan = input<string>('');

  // Deskripsi di bawah judul
  description = input<string>('');
}
