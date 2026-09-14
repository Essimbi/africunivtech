import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AddressService } from '../../core/services/address.service';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { NotificationService } from '../../core/services/notification.service';
import { Address, Cart, PaymentMethod } from '../../core/models/models';
import { CheckoutStepsComponent } from '../../shared/components/checkout-steps/checkout-steps.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CheckoutStepsComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  private addressService = inject(AddressService);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  step = signal<'address' | 'payment'>('address');
  addresses = signal<Address[]>([]);
  selectedAddressId = signal<string | null>(null);
  showAddressForm = signal(false);
  submitting = signal(false);

  cart = signal<Cart>({ id: '', items: [], totals: { subtotalHt: 0, vatAmount: 0, vatRate: 0.1925, itemsTotalTtc: 0, shippingFee: 0, totalTtc: 0 } });

  paymentMethod = signal<PaymentMethod>('orange_money');
  notes = signal('');

  addressForm = this.fb.nonNullable.group({
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

  paymentOptions: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: 'orange_money', label: 'Orange Money', icon: 'smartphone' },
    { value: 'mtn_momo', label: 'MTN MoMo', icon: 'smartphone' },
    { value: 'card', label: 'Carte Visa / Mastercard', icon: 'credit_card' },
    { value: 'bank_transfer', label: 'Virement Bancaire', icon: 'account_balance' }
  ];

  ngOnInit(): void {
    this.cartService.refresh().then(() => {
      if (!this.cartService.snapshot.items.length) {
        this.router.navigate(['/panier']);
      }
    });
    this.cartService.cart$.subscribe((c) => this.cart.set(c));
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.addressService.list().subscribe((res) => {
      this.addresses.set(res.data);
      const def = res.data.find((a) => a.isDefault) || res.data[0];
      if (def) this.selectedAddressId.set(def.id);
      this.showAddressForm.set(res.data.length === 0);
    });
  }

  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }
    this.addressService.create(this.addressForm.getRawValue()).subscribe((res) => {
      this.addresses.update((list) => [res.data, ...list]);
      this.selectedAddressId.set(res.data.id);
      this.showAddressForm.set(false);
      this.addressForm.reset({ label: 'Livraison', country: 'Cameroun', isDefault: false });
      this.notification.success('Adresse enregistrée.');
    });
  }

  goToPayment(): void {
    if (!this.selectedAddressId()) {
      this.notification.error('Sélectionnez une adresse de livraison.');
      return;
    }
    this.step.set('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToAddress(): void {
    this.step.set('address');
  }

  confirmOrder(): void {
    const addressId = this.selectedAddressId();
    if (!addressId) return;
    this.submitting.set(true);
    this.orderService.checkout({ addressId, paymentMethod: this.paymentMethod(), notes: this.notes() || undefined }).subscribe({
      next: async (res) => {
        await this.cartService.refresh();
        this.notification.success('Commande validée avec succès !');
        this.router.navigate(['/commande/confirmation', res.data.id]);
      },
      error: (err) => {
        this.submitting.set(false);
        this.notification.error(err?.error?.message || 'Impossible de valider la commande.');
      }
    });
  }
}
