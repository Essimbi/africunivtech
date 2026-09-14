import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PagedResult, Product } from '../../models/models';

export interface ProductPayload {
  categoryId: string;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  shortDescription?: string;
  description?: string;
  specs?: Record<string, string>;
  highlights?: string[];
  priceHt: number;
  priceTtc: number;
  compareAtPriceTtc?: number | null;
  stock: number;
  stockAlertThreshold: number;
  warrantyMonths: number;
  availability: string;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  images?: { url: string; altText?: string; isPrimary?: boolean }[];
  variants?: { name: string; sku: string; priceDeltaTtc: number; stock: number; isDefault?: boolean }[];
}

@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/products`;

  list(page = 1, limit = 20, search = ''): Observable<PagedResult<Product>> {
    return this.http.get<PagedResult<Product>>(this.base, { params: { page, limit, search } as any });
  }

  getOne(id: string): Observable<{ success: boolean; data: Product }> {
    return this.http.get<{ success: boolean; data: Product }>(`${this.base}/${id}`);
  }

  create(payload: ProductPayload): Observable<{ success: boolean; data: Product }> {
    return this.http.post<{ success: boolean; data: Product }>(this.base, payload);
  }

  update(id: string, payload: Partial<ProductPayload>): Observable<{ success: boolean; data: Product }> {
    return this.http.patch<{ success: boolean; data: Product }>(`${this.base}/${id}`, payload);
  }

  remove(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.base}/${id}`);
  }

  adjustStock(id: string, delta: number): Observable<{ success: boolean; data: Product }> {
    return this.http.post<{ success: boolean; data: Product }>(`${this.base}/${id}/stock`, { delta });
  }
}
