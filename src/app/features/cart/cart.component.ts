import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Cart } from '../../core/models/models';
import { QuantityInputComponent } from '../../shared/components/quantity-input/quantity-input.component';
import { CheckoutStepsComponent } from '../../shared/components/checkout-steps/checkout-steps.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, QuantityInputComponent, CheckoutStepsComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);
  authService = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  cart = signal<Cart>({ id: '', items: [], totals: { subtotalHt: 0, vatAmount: 0, vatRate: 0.1925, itemsTotalTtc: 0, shippingFee: 0, totalTtc: 0 } });
  loading = signal(true);

  ngOnInit(): void {
    this.cartService.refresh().then(() => this.loading.set(false));
    this.cartService.cart$.subscribe((c) => this.cart.set(c));
  }

  async updateQuantity(itemId: string, quantity: number): Promise<void> {
    try {
      await this.cartService.updateQuantity(itemId, quantity);
    } catch (e: any) {
      this.notification.error(e?.error?.message || 'Stock insuffisant pour cette quantité.');
    }
  }

  async removeItem(itemId: string): Promise<void> {
    await this.cartService.removeItem(itemId);
    this.notification.info('Article retiré du panier.');
  }

  async clearCart(): Promise<void> {
    await this.cartService.clear();
  }

  proceedToCheckout(): void {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/compte/connexion'], { queryParams: { redirect: '/commande' } });
      return;
    }
    this.router.navigate(['/commande']);
  }
}
