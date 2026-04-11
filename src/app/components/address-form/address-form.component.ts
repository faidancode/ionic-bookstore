import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Address } from 'src/app/core/models';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss'],
})
export class AddressFormComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private fb = inject(FormBuilder);

  @Input() initialData: Address | null = null;
  @Input() loading: boolean = false;

  @Output() submitForm = new EventEmitter<Address>();
  @Output() cancel = new EventEmitter<void>();

  addressForm: FormGroup = this.fb.group({
    label: ['', [Validators.required]],
    recipientName: ['', [Validators.required]],
    recipientPhone: ['', [Validators.required]],
    street: ['', [Validators.required]],
    subdistrict: ['', [Validators.required]],
    district: ['', [Validators.required]],
    city: ['', [Validators.required]],
    province: ['', [Validators.required]],
    postalCode: ['', [Validators.required]],
    isPrimary: [false],
  });

  submitted = false;

  ngOnInit() {
    const data = this.initialData;

    if (data) {
      this.addressForm.patchValue({
        label: data.label,
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        street: data.street,
        subdistrict: data.subdistrict,
        district: data.district,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        isPrimary: data.isPrimary,
      });
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.addressForm.get(controlName);
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || this.submitted)
    );
  }

  getErrorMessage(field: string): string {
    const control = this.addressForm.get(field);
    if (control?.hasError('required')) return 'Bagian ini wajib diisi';
    if (control?.hasError('minlength')) return `Minimal ${control.errors?.['minlength'].requiredLength} karakter`;
    if (control?.hasError('pattern')) return 'Format tidak valid';
    return 'Data tidak valid';
  }

  handleCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onSubmit() {
    this.submitted = true;

    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.modalCtrl.dismiss(this.addressForm.value, 'confirm');
  }
}