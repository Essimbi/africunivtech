import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/users`;

  list(): Observable<{ success: boolean; data: User[] }> {
    return this.http.get<{ success: boolean; data: User[] }>(this.base);
  }

  create(payload: { email: string; password: string; firstName: string; lastName: string; role: 'admin' | 'superadmin' }): Observable<{ success: boolean; data: User }> {
    return this.http.post<{ success: boolean; data: User }>(this.base, payload);
  }

  updateRole(id: string, role: 'admin' | 'superadmin', isActive?: boolean): Observable<{ success: boolean; data: User }> {
    return this.http.patch<{ success: boolean; data: User }>(`${this.base}/${id}`, { role, isActive });
  }
}
