import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Order, OrderStatus, PagedResult } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/orders`;

  list(page = 1, limit = 15, status?: string, search?: string): Observable<PagedResult<Order>> {
    const params: any = { page, limit };
    if (status) params.status = status;
    if (search) params.search = search;
    return this.http.get<PagedResult<Order>>(this.base, { params });
  }

  getOne(id: string): Observable<{ success: boolean; data: Order }> {
    return this.http.get<{ success: boolean; data: Order }>(`${this.base}/${id}`);
  }

  updateStatus(id: string, status: OrderStatus, comment?: string): Observable<{ success: boolean; data: Order }> {
    return this.http.patch<{ success: boolean; data: Order }>(`${this.base}/${id}/status`, { status, comment });
  }

  invoiceUrl(id: string): string {
    return `${this.base}/${id}/invoice`;
  }

  downloadInvoice(id: string): Observable<Blob> {
    return this.http.get(`${this.base}/${id}/invoice`, { responseType: 'blob' });
  }
}
