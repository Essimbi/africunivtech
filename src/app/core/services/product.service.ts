import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult, Product } from '../models/models';

export interface ProductFilters {
  category?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  availability?: string[];
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
  isNew?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/products`;

  list(filters: ProductFilters = {}): Observable<PagedResult<Product>> {
    let params = new HttpParams();
    if (filters.category) params = params.set('category', filters.category);
    if (filters.brand?.length) params = params.set('brand', filters.brand.join(','));
    if (filters.minPrice != null) params = params.set('minPrice', filters.minPrice);
    if (filters.maxPrice != null) params = params.set('maxPrice', filters.maxPrice);
    if (filters.availability?.length) params = params.set('availability', filters.availability.join(','));
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sort) params = params.set('sort', filters.sort);
    if (filters.page) params = params.set('page', filters.page);
    if (filters.limit) params = params.set('limit', filters.limit);
    if (filters.featured) params = params.set('featured', 'true');
    if (filters.isNew) params = params.set('isNew', 'true');

    return this.http.get<PagedResult<Product>>(this.base, { params });
  }

  facets(): Observable<{ success: boolean; data: { brands: string[]; minPrice: number; maxPrice: number; availability: string[] } }> {
    return this.http.get<{ success: boolean; data: { brands: string[]; minPrice: number; maxPrice: number; availability: string[] } }>(`${this.base}/facets`);
  }

  getBySlug(slug: string): Observable<{ success: boolean; data: Product }> {
    return this.http.get<{ success: boolean; data: Product }>(`${this.base}/${slug}`);
  }

  related(productId: string): Observable<{ success: boolean; data: Product[] }> {
    return this.http.get<{ success: boolean; data: Product[] }>(`${this.base}/${productId}/related`);
  }
}
