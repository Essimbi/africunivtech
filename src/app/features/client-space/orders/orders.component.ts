import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order } from '../../../core/models/models';
import { OrderService } from '../../../core/services/order.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { downloadBlob } from '../../../core/utils/download';
import { orderStatusLabel } from '../../../core/utils/labels';

@Component({
  selector: 'app-client-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class ClientOrdersComponent implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  page = signal(1);
  totalPages = signal(1);
  total = signal(0);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.orderService.listMine(this.page(), 10).subscribe((res) => {
      this.orders.set(res.data);
      this.totalPages.set(res.meta.totalPages);
      this.total.set(res.meta.total);
      this.loading.set(false);
    });
  }

  changePage(p: number): void {
    this.page.set(p);
    this.load();
  }

  statusLabel = orderStatusLabel;

  downloadInvoice(order: Order, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.orderService.downloadInvoice(order.id, order.orderNumber).subscribe((blob) => {
      downloadBlob(blob, `Facture-${order.orderNumber}.pdf`);
    });
  }
}
