import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order } from '../../../core/models/models';
import { OrderService } from '../../../core/services/order.service';
import { orderStatusLabel } from '../../../core/utils/labels';

const IN_TRANSIT_STATUSES = ['pending', 'confirmed', 'processing', 'shipped'];

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class ClientDashboardComponent implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  totalOrders = signal(0);
  loading = signal(true);

  totalInvested = computed(() => this.orders().reduce((sum, o) => sum + o.totalTtc, 0));
  inTransitCount = computed(() => this.orders().filter((o) => IN_TRANSIT_STATUSES.includes(o.status)).length);
  recentOrders = computed(() => this.orders().slice(0, 4));

  ngOnInit(): void {
    this.orderService.listMine(1, 50).subscribe((res) => {
      this.orders.set(res.data);
      this.totalOrders.set(res.meta.total);
      this.loading.set(false);
    });
  }

  statusLabel = orderStatusLabel;
}
