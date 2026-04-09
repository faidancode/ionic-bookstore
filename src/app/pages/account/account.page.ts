import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: true, // Instruksi: Selalu gunakan standalone
  imports: [CommonModule, IonicModule],
})
export class AccountPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Menggunakan signal dari AuthService
  user = this.authService.currentUser;

  handleLogout() {
    this.authService.logout();
  }

  navigate(path: string) {
    this.router.navigate([`/tabs/account/${path}`]);
  }
}
