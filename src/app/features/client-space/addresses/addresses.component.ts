import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Address } from '../../../core/models/models';
import { AddressService } from '../../../core/services/address.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-client-addresses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './addresses.component.html',
  styleUrl: './addresses.component.scss'
})
export class ClientAddressesComponent implements OnInit {
  private addressService = inject(AddressService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  addresses = signal<Address[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingId = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    label: ['Livraison'],
    fullName: ['', Validators.required],
    phone: ['', Validators.required],
    line1: ['', Validators.required],
    line2: [''],
    city: ['', Validators.required],
    region: [''],
    country: ['Cameroun'],
    isDefault: [false]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.addressService.list().subscribe((res) => {
      this.addresses.set(res.data);
      this.loading.set(false);
    });
  }

  newAddress(): void {
    this.editingId.set(null);
    this.form.reset({ label: 'Livraison', country: 'Cameroun', isDefault: false });
    this.showForm.set(true);
  }

  edit(address: Address): void {
    this.editingId.set(address.id);
    this.form.reset(address);
    this.showForm.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.getRawValue();
    const id = this.editingId();
    const req = id ? this.addressService.update(id, payload) : this.addressService.create(payload);
    req.subscribe(() => {
      this.notification.success(id ? 'Adresse mise à jour.' : 'Adresse ajoutée.');
      this.showForm.set(false);
      this.load();
    });
  }

  remove(address: Address): void {
    if (!confirm(`Supprimer l'adresse "${address.label}" ?`)) return;
    this.addressService.remove(address.id).subscribe(() => {
      this.notification.info('Adresse supprimée.');
      this.load();
    });
  }
}
