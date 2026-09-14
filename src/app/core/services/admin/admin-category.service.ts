import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Category } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class AdminCategoryService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/categories`;

  create(payload: { name: string; slug: string; description?: string; icon?: string; position?: number }): Observable<{ success: boolean; data: Category }> {
    return this.http.post<{ success: boolean; data: Category }>(this.base, payload);
  }

  update(id: string, payload: Partial<{ name: string; slug: string; description: string; icon: string; position: number }>): Observable<{ success: boolean; data: Category }> {
    return this.http.patch<{ success: boolean; data: Category }>(`${this.base}/${id}`, payload);
  }

  remove(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.base}/${id}`);
  }
}
