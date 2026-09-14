import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardKpis, Order, Product } from '../../../core/models/models';
import { AdminDashboardService } from '../../../core/services/admin/admin-dashboard.service';
import { AdminOrderService } from '../../../core/services/admin/admin-order.service';
import { AdminProductService } from '../../../core/services/admin/admin-product.service';
import { orderStatusLabel } from '../../../core/utils/labels';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(AdminDashboardService);
  private orderService = inject(AdminOrderService);
  private productService = inject(AdminProductService);

  kpis = signal<DashboardKpis | null>(null);
  recentOrders = signal<Order[]>([]);
  criticalStock = signal<Product[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.dashboardService.kpis().subscribe((res) => this.kpis.set(res.data));
    this.orderService.list(1, 5).subscribe((res) => this.recentOrders.set(res.data));
    this.productService.list(1, 100).subscribe((res) => {
      this.criticalStock.set(res.data.filter((p) => p.stock <= p.stockAlertThreshold).slice(0, 6));
      this.loading.set(false);
    });
  }

  statusLabel = orderStatusLabel;
}
