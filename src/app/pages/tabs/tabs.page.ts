import { Component } from '@angular/core';
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
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage {
  constructor() {
    addIcons({
      bookmarkOutline,
      journalOutline,
      gridOutline,
      logOutOutline,
      mapOutline,
      personCircleOutline,
      personOutline,
      receiptOutline,
    });
  }
}
