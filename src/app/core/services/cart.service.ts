import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart, CartLine, Product, ProductVariant } from '../models/models';
import { AuthService } from './auth.service';

// Doit rester cohérent avec backend/src/config/env.js (business rules).
const VAT_RATE = 0.1925;
const FREE_SHIPPING_THRESHOLD = 500000;
const DEFAULT_SHIPPING_FEE = 10000;

const GUEST_CART_KEY = 'auts_guest_cart';

interface GuestCartLine {
  productId: string;
  variantId: string | null;
  quantity: number;
  product: { id: string; name: string; slug: string; sku: string; stock: number; image: string | null };
  variant: { id: string; name: string; stock: number } | null;
  unitPriceTtc: number;
}

const EMPTY_CART: Cart = {
  id: 'guest',
  items: [],
  totals: { subtotalHt: 0, vatAmount: 0, vatRate: VAT_RATE, itemsTotalTtc: 0, shippingFee: 0, totalTtc: 0 }
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private base = `${environment.apiUrl}/cart`;

  private cartSubject = new BehaviorSubject<Cart>(EMPTY_CART);
  readonly cart$ = this.cartSubject.asObservable();

  get snapshot(): Cart {
    return this.cartSubject.value;
  }

  async refresh(): Promise<void> {
    if (this.authService.isAuthenticated) {
      const res = await firstValueFrom(this.http.get<{ success: boolean; data: Cart }>(this.base));
      this.cartSubject.next(res.data);
    } else {
      this.cartSubject.next(this.computeGuestCart());
    }
  }

  async addItem(product: Product, quantity: number, variant: ProductVariant | null = null): Promise<void> {
    if (this.authService.isAuthenticated) {
      const res = await firstValueFrom(this.http.post<{ success: boolean; data: Cart }>(`${this.base}/items`, {
        productId: product.id, variantId: variant?.id ?? null, quantity
      }));
      this.cartSubject.next(res.data);
    } else {
      const lines = this.readGuestLines();
      const existing = lines.find((l) => l.productId === product.id && l.variantId === (variant?.id ?? null));
      if (existing) {
        existing.quantity += quantity;
      } else {
        lines.push({
          productId: product.id,
          variantId: variant?.id ?? null,
          quantity,
          unitPriceTtc: product.priceTtc + (variant?.priceDeltaTtc ?? 0),
          product: { id: product.id, name: product.name, slug: product.slug, sku: product.sku, stock: variant ? variant.stock : product.stock, image: product.images?.[0]?.url ?? null },
          variant: variant ? { id: variant.id, name: variant.name, stock: variant.stock } : null
        });
      }
      this.writeGuestLines(lines);
      this.cartSubject.next(this.computeGuestCart());
    }
  }

  async updateQuantity(itemId: string, quantity: number): Promise<void> {
    if (this.authService.isAuthenticated) {
      const res = await firstValueFrom(this.http.patch<{ success: boolean; data: Cart }>(`${this.base}/items/${itemId}`, { quantity }));
      this.cartSubject.next(res.data);
    } else {
      const lines = this.readGuestLines();
      const line = lines[this.guestLineIndex(itemId)];
      if (line) line.quantity = quantity;
      this.writeGuestLines(lines);
      this.cartSubject.next(this.computeGuestCart());
    }
  }

  async removeItem(itemId: string): Promise<void> {
    if (this.authService.isAuthenticated) {
      const res = await firstValueFrom(this.http.delete<{ success: boolean; data: Cart }>(`${this.base}/items/${itemId}`));
      this.cartSubject.next(res.data);
    } else {
      const lines = this.readGuestLines().filter((_, idx) => `guest-${idx}` !== itemId);
      this.writeGuestLines(lines);
      this.cartSubject.next(this.computeGuestCart());
    }
  }

  async clear(): Promise<void> {
    if (this.authService.isAuthenticated) {
      const res = await firstValueFrom(this.http.delete<{ success: boolean; data: Cart }>(this.base));
      this.cartSubject.next(res.data);
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
      this.cartSubject.next(EMPTY_CART);
    }
  }

  /** Transfère le panier localStorage du visiteur vers son panier serveur après connexion. */
  async mergeGuestCartIntoServer(): Promise<void> {
    const lines = this.readGuestLines();
    if (!lines.length) {
      await this.refresh();
      return;
    }
    for (const line of lines) {
      try {
        await firstValueFrom(this.http.post(`${this.base}/items`, {
          productId: line.productId, variantId: line.variantId, quantity: line.quantity
        }));
      } catch {
        // Stock insuffisant ou produit indisponible : on ignore cette ligne et on continue.
      }
    }
    localStorage.removeItem(GUEST_CART_KEY);
    await this.refresh();
  }

  private guestLineIndex(itemId: string): number {
    const match = itemId.match(/^guest-(\d+)$/);
    return match ? parseInt(match[1], 10) : -1;
  }

  private readGuestLines(): GuestCartLine[] {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as GuestCartLine[]) : [];
  }

  private writeGuestLines(lines: GuestCartLine[]): void {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(lines));
  }

  private computeGuestCart(): Cart {
    const guestLines = this.readGuestLines();
    const items: CartLine[] = guestLines.map((l, idx) => ({
      id: `guest-${idx}`,
      productId: l.productId,
      variantId: l.variantId,
      quantity: l.quantity,
      unitPriceTtc: l.unitPriceTtc,
      lineTotalTtc: l.unitPriceTtc * l.quantity,
      product: l.product,
      variant: l.variant
    }));

    const itemsTotalTtc = items.reduce((sum, i) => sum + i.lineTotalTtc, 0);
    const subtotalHt = itemsTotalTtc / (1 + VAT_RATE);
    const vatAmount = itemsTotalTtc - subtotalHt;
    const shippingFee = itemsTotalTtc === 0 ? 0 : (itemsTotalTtc >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE);

    return {
      id: 'guest',
      items,
      totals: {
        subtotalHt: round2(subtotalHt),
        vatAmount: round2(vatAmount),
        vatRate: VAT_RATE,
        itemsTotalTtc: round2(itemsTotalTtc),
        shippingFee,
        totalTtc: round2(itemsTotalTtc + shippingFee)
      }
    };
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
