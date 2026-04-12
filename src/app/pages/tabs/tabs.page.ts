import { Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  journalOutline,
  gridOutline,
  bookmarkOutline,
  personOutline,
  personCircleOutline,
  receiptOutline,
  logOutOutline,
  mapOutline,
  bagHandleOutline,
  person,
  bookmark,
  journal,
  grid,
  chevronForwardOutline,
} from 'ionicons/icons';
import { filter } from 'rxjs';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage {
  private router = inject(Router);
  selectedTab: string = 'home'; // Default tab

  constructor() {
    addIcons({
      bagHandleOutline,
      bookmark,
      bookmarkOutline,
      chevronForwardOutline,
      journal,
      journalOutline,
      grid,
      gridOutline,
      logOutOutline,
      mapOutline,
      personCircleOutline,
      person,
      personOutline,
      receiptOutline,
    });
  }

  ngOnInit() {
    // Jalankan pengecekan saat pertama kali load
    this.updateSelectedTab(this.router.url);

    // Subscribe ke perubahan route untuk update icon secara real-time
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateSelectedTab(event.urlAfterRedirects);
      });
  }

  private updateSelectedTab(url: string) {
    if (url.includes('/home')) {
      this.selectedTab = 'home';
    } else if (url.includes('/category')) {
      this.selectedTab = 'category';
    } else if (url.includes('/wishlist')) {
      this.selectedTab = 'wishlist';
    } else if (url.includes('/profile')) {
      this.selectedTab = 'profile';
    }
  }
}
