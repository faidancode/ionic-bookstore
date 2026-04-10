import { Component, input, output } from '@angular/core';
import { NavController } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonBackButton,
  IonTitle,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, bagHandleOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonBackButton,
    IonTitle,
    IonIcon,
  ],
})
export class AppHeaderComponent {
  // Input menggunakan Signal (Required atau Optional dengan default)
  title = input<string>('');
  hideBackButton = input<boolean>(false);
  showEndButton = input<boolean>(true);
  backHref = input<string>('/tabs/home');
  endIcon = input<string>('bookmark-outline');

  // Output menggunakan Signal-based output
  onEndButtonClick = output<void>();

  constructor() {
    addIcons({
      arrowBackOutline,
    });
  }

  handleEndClick() {
    // Memancarkan event ke komponen parent
    this.onEndButtonClick.emit();
  }
}
