import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Customer, Order, PagedResult, Address } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class AdminCustomerService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/customers`;

  list(page = 1, limit = 15, search = ''): Observable<PagedResult<Customer>> {
    return this.http.get<PagedResult<Customer>>(this.base, { params: { page, limit, search } as any });
  }

  getOne(id: string): Observable<{ success: boolean; data: Customer & { addresses: Address[]; orders: Order[] } }> {
    return this.http.get<{ success: boolean; data: Customer & { addresses: Address[]; orders: Order[] } }>(`${this.base}/${id}`);
  }

  setActive(id: string, isActive: boolean): Observable<{ success: boolean; data: Customer }> {
    return this.http.patch<{ success: boolean; data: Customer }>(`${this.base}/${id}/active`, { isActive });
  }
}
