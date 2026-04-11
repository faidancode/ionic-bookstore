import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { AddressService } from 'src/app/core/services/address.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Address } from 'src/app/core/models';
import { AddressCardComponent } from 'src/app/components/address-card/address-card.component';
import { AddressFormComponent } from 'src/app/components/address-form/address-form.component';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline } from 'ionicons/icons';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    AddressCardComponent,
    AddressFormComponent,
  ],
  templateUrl: './address.page.html',
  styleUrls: ['./address.page.scss'],
})
export class AddressPage implements OnInit {
  private addressService = inject(AddressService);
  private authService = inject(AuthService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private toastService = inject(ToastService);

  constructor() {
    addIcons({ createOutline, trashOutline });
  }

  addresses = this.addressService.addresses;
  loading = this.addressService.loading;

  // State untuk kontrol tampilan Form (atau gunakan Modal)
  showForm = false;
  selectedAddress: Address | null = null;

  ngOnInit() {
    this.loadAddresses();
  }

  loadAddresses() {
    const user = this.authService.currentUser();
    if (user) {
      this.addressService.fetchByUser(user.id).subscribe();
    }
  }

  // address.page.ts
  async openAddressModal(address: Address | null = null) {
    console.log(this.selectedAddress);
    const modal = await this.modalCtrl.create({
      component: AddressFormComponent, // Gunakan komponen yang sudah dibuat
      componentProps: {
        initialData: address,
      },
      // Tambahkan class khusus jika ingin styling tambahan
      cssClass: 'atheneum-full-modal',
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.handleFormSubmit(data);
    }
  }

  onEdit(address: Address) {
    this.selectedAddress = address;
    this.openAddressModal(address);
  }

  async onDelete(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Hapus Alamat',
      message: 'Apakah Anda yakin ingin menghapus alamat ini?',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => {
            this.addressService.remove(id).subscribe({
              next: () => {
                this.toastService.show('Alamat berhasil dihapus', 'success');
                this.showForm = false;
              },
              error: (err) => {
                this.toastService.show('Gagal menghapus alamat', 'danger');
                console.error(err);
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  handleFormSubmit(formData: any) {
    const user = this.authService.currentUser();
    if (!user) {
      this.toastService.show('Sesi berakhir, silakan login kembali', 'danger');
      return;
    }

    if (this.selectedAddress) {
      // Kondisi UPDATE
      this.addressService.update(this.selectedAddress.id, formData).subscribe({
        next: () => {
          this.toastService.show('Alamat berhasil diperbarui', 'success');
          this.showForm = false;
        },
        error: (err) => {
          this.toastService.show('Gagal memperbarui alamat', 'danger');
          console.error(err);
        },
      });
    } else {
      // Kondisi CREATE
      this.addressService.create({ ...formData, userId: user.id }).subscribe({
        next: () => {
          this.toastService.show('Alamat baru berhasil ditambahkan', 'success');
          this.showForm = false;
        },
        error: (err) => {
          this.toastService.show('Gagal menambahkan alamat', 'danger');
          console.error(err);
        },
      });
    }
  }
}
