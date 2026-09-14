import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DashboardKpis } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/dashboard`;

  kpis(): Observable<{ success: boolean; data: DashboardKpis }> {
    return this.http.get<{ success: boolean; data: DashboardKpis }>(`${this.base}/kpis`);
  }
}
