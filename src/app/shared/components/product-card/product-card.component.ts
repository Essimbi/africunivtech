import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/models';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, StarRatingComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() added = new EventEmitter<Product>();

  private cartService = inject(CartService);
  private notification = inject(NotificationService);

  adding = false;

  get discountPercent(): number | null {
    if (!this.product.compareAtPriceTtc || this.product.compareAtPriceTtc <= this.product.priceTtc) return null;
    return Math.round((1 - this.product.priceTtc / this.product.compareAtPriceTtc) * 100);
  }

  get primaryImage(): string {
    return this.product.images?.[0]?.url || '/assets/products/placeholder.svg';
  }

  get availabilityLabel(): string {
    switch (this.product.availability) {
      case 'in_stock': return 'En stock';
      case 'on_order': return 'Sur commande';
      default: return 'En arrivage';
    }
  }

  async quickAdd(event: Event): Promise<void> {
    event.stopPropagation();
    event.preventDefault();
    if (this.product.variants?.length) {
      this.notification.info('Choisissez une option sur la fiche produit avant d\'ajouter au panier.');
      return;
    }
    this.adding = true;
    try {
      await this.cartService.addItem(this.product, 1);
      this.notification.success(`${this.product.name} ajouté au panier.`);
      this.added.emit(this.product);
    } catch (e: any) {
      this.notification.error(e?.error?.message || 'Impossible d\'ajouter ce produit au panier.');
    } finally {
      this.adding = false;
    }
  }
}
