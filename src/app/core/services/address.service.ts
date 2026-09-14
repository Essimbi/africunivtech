import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Address } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/addresses`;

  list(): Observable<{ success: boolean; data: Address[] }> {
    return this.http.get<{ success: boolean; data: Address[] }>(this.base);
  }

  create(payload: Omit<Address, 'id'>): Observable<{ success: boolean; data: Address }> {
    return this.http.post<{ success: boolean; data: Address }>(this.base, payload);
  }

  update(id: string, payload: Partial<Omit<Address, 'id'>>): Observable<{ success: boolean; data: Address }> {
    return this.http.patch<{ success: boolean; data: Address }>(`${this.base}/${id}`, payload);
  }

  remove(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.base}/${id}`);
  }
}
