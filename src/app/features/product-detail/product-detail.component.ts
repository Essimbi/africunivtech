import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product, ProductVariant } from '../../core/models/models';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { QuantityInputComponent } from '../../shared/components/quantity-input/quantity-input.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, StarRatingComponent, QuantityInputComponent, BreadcrumbComponent, ProductCardComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private notification = inject(NotificationService);

  product = signal<Product | null>(null);
  related = signal<Product[]>([]);
  loading = signal(true);
  activeImageIndex = signal(0);
  selectedVariant = signal<ProductVariant | null>(null);
  quantity = signal(1);
  activeTab = signal<'specs' | 'warranty'>('specs');
  adding = signal(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) return;
      this.loading.set(true);
      this.productService.getBySlug(slug).subscribe((res) => {
        this.product.set(res.data);
        this.activeImageIndex.set(0);
        this.quantity.set(1);
        const defaultVariant = res.data.variants?.find((v) => v.isDefault) || res.data.variants?.[0] || null;
        this.selectedVariant.set(defaultVariant);
        this.loading.set(false);
        this.productService.related(res.data.id).subscribe((r) => this.related.set(r.data));
        window.scrollTo({ top: 0 });
      });
    });
  }

  get specsEntries(): [string, string][] {
    return Object.entries(this.product()?.specs || {});
  }

  get currentPrice(): number {
    const p = this.product();
    if (!p) return 0;
    return p.priceTtc + (this.selectedVariant()?.priceDeltaTtc || 0);
  }

  get currentStock(): number {
    const p = this.product();
    if (!p) return 0;
    return this.selectedVariant() ? this.selectedVariant()!.stock : p.stock;
  }

  get discountPercent(): number | null {
    const p = this.product();
    if (!p?.compareAtPriceTtc || p.compareAtPriceTtc <= p.priceTtc) return null;
    return Math.round((1 - p.priceTtc / p.compareAtPriceTtc) * 100);
  }

  selectVariant(v: ProductVariant): void {
    this.selectedVariant.set(v);
    this.quantity.set(1);
  }

  async addToCart(): Promise<void> {
    const p = this.product();
    if (!p) return;
    this.adding.set(true);
    try {
      await this.cartService.addItem(p, this.quantity(), this.selectedVariant());
      this.notification.success(`${p.name} ajouté au panier (x${this.quantity()}).`);
    } catch (e: any) {
      this.notification.error(e?.error?.message || 'Impossible d\'ajouter ce produit au panier.');
    } finally {
      this.adding.set(false);
    }
  }
}
