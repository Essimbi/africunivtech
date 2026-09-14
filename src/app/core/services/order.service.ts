import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, PagedResult, PaymentMethod } from '../models/models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/orders`;

  checkout(payload: { addressId: string; paymentMethod: PaymentMethod; notes?: string }): Observable<{ success: boolean; data: Order }> {
    return this.http.post<{ success: boolean; data: Order }>(`${this.base}/checkout`, payload);
  }

  listMine(page = 1, limit = 10): Observable<PagedResult<Order>> {
    return this.http.get<PagedResult<Order>>(this.base, { params: { page, limit } as any });
  }

  getOne(id: string): Observable<{ success: boolean; data: Order }> {
    return this.http.get<{ success: boolean; data: Order }>(`${this.base}/${id}`);
  }

  invoiceUrl(id: string): string {
    return `${this.base}/${id}/invoice`;
  }

  downloadInvoice(id: string, orderNumber: string): Observable<Blob> {
    return this.http.get(`${this.base}/${id}/invoice`, { responseType: 'blob' });
  }
}
