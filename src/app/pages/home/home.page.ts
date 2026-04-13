import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { PopularBooksComponent } from '../../components/popular-books/popular-books.component';
import { CategoryListComponent } from '../../components/category-list/category-list.component';
import { HomeHeaderComponent } from 'src/app/components/home-header/home-header.component';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { SearchInputComponent } from 'src/app/components/search-input/search-input.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    HomeHeaderComponent,
    PopularBooksComponent,
    CategoryListComponent,
  ],
})
export class HomePage {
  private modalCtrl = inject(ModalController);
  private router = inject(Router);

  async presentSearchModal() {
    const modal = await this.modalCtrl.create({
      component: SearchInputComponent,
      cssClass: 'search-modal-full' // Opsional: untuk styling khusus
    });

    await modal.present();

    // Menunggu data dari modal saat ditutup (User menekan Enter)
    const { data } = await modal.onWillDismiss();

    if (data) {
      // Navigasi ke halaman list buku dengan query pencarian
      this.router.navigate(['/tabs/book-list'], {
        queryParams: { search: data }
      });
    }
  }
}
