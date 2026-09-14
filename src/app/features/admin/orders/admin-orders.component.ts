import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Order, OrderStatus } from '../../../core/models/models';
import { AdminOrderService } from '../../../core/services/admin/admin-order.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { orderStatusLabel } from '../../../core/utils/labels';

const STATUS_TABS: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'processing', label: 'En préparation' },
  { value: 'shipped', label: 'Expédiées' },
  { value: 'delivered', label: 'Livrées' },
  { value: 'completed', label: 'Terminées' },
  { value: 'cancelled', label: 'Annulées' }
];

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss'
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(AdminOrderService);

  statusTabs = STATUS_TABS;
  orders = signal<Order[]>([]);
  loading = signal(true);
  activeStatus = signal<OrderStatus | ''>('');
  search = signal('');
  page = signal(1);
  totalPages = signal(1);
  total = signal(0);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.orderService.list(this.page(), 15, this.activeStatus() || undefined, this.search() || undefined).subscribe((res) => {
      this.orders.set(res.data);
      this.totalPages.set(res.meta.totalPages);
      this.total.set(res.meta.total);
      this.loading.set(false);
    });
  }

  selectStatus(status: OrderStatus | ''): void {
    this.activeStatus.set(status);
    this.page.set(1);
    this.load();
  }

  onSearch(): void {
    this.page.set(1);
    this.load();
  }

  changePage(p: number): void {
    this.page.set(p);
    this.load();
  }

  statusLabel = orderStatusLabel;
}
