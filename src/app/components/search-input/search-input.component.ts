import { Component, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [IonicModule, FormsModule],
  template: `
    <div class="search-overlay">
      <div class="search-bar">
        <ion-icon name="arrow-back" (click)="close()"></ion-icon>
        <input
          #searchInput
          type="text"
          [(ngModel)]="query"
          (keyup.enter)="onSearch()"
          placeholder="Cari judul buku atau penulis..."
          autofocus
        />
      </div>
    </div>
  `,
  styleUrls: ['./search-input.component.scss'],
})
export class SearchInputComponent {
  query = '';
  search = output<string>();
  cancel = output<void>();

  private modalCtrl = inject(ModalController);

  onSearch() {
    if (this.query.trim()) {
      this.search.emit(this.query);
      this.modalCtrl.dismiss(this.query);
    }
  }

  close() {
    this.cancel.emit();
    this.modalCtrl.dismiss();
  }
}
