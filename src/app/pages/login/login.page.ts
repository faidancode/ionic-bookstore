import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class LoginPage {
  // Menggunakan Signal lokal untuk UI
  email = '';
  password = '';
  loading = signal(false);

  constructor(private authService: AuthService) {}

  handleLogin(event: Event) {
    event.preventDefault();

    if (!this.email || !this.password) return;

    this.loading.set(true);

    const payload = {
      email: this.email,
      password: this.password,
    };

    this.authService.login(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        // Navigasi sudah ditangani oleh AuthService via tap()
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Login gagal:', err);
        // Tambahkan toast atau alert kustom di sini
      },
    });
  }
}
