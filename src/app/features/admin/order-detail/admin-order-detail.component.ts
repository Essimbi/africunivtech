import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Order, OrderStatus } from '../../../core/models/models';
import { AdminOrderService } from '../../../core/services/admin/admin-order.service';
import { NotificationService } from '../../../core/services/notification.service';
import { downloadBlob } from '../../../core/utils/download';
import { orderStatusLabel, paymentMethodLabel } from '../../../core/utils/labels';

const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['completed'],
  completed: [],
  cancelled: []
};

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-order-detail.component.html',
  styleUrl: './admin-order-detail.component.scss'
})
export class AdminOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(AdminOrderService);
  private notification = inject(NotificationService);

  order = signal<Order | null>(null);
  loading = signal(true);
  updating = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loading.set(true);
    this.orderService.getOne(id).subscribe((res) => {
      this.order.set(res.data);
      this.loading.set(false);
    });
  }

  nextStatuses(): OrderStatus[] {
    const o = this.order();
    return o ? NEXT_STATUS[o.status] : [];
  }

  updateStatus(status: OrderStatus): void {
    const o = this.order();
    if (!o) return;
    if (status === 'cancelled' && !confirm('Annuler cette commande ? Le stock sera réapprovisionné automatiquement.')) return;

    this.updating.set(true);
    this.orderService.updateStatus(o.id, status).subscribe({
      next: () => {
        this.updating.set(false);
        this.notification.success('Statut de la commande mis à jour.');
        this.load();
      },
      error: (err) => {
        this.updating.set(false);
        this.notification.error(err?.error?.message || 'Transition invalide.');
      }
    });
  }

  statusLabel = orderStatusLabel;
  paymentLabel = paymentMethodLabel;

  downloadInvoice(): void {
    const o = this.order();
    if (!o) return;
    this.orderService.downloadInvoice(o.id).subscribe((blob) => {
      downloadBlob(blob, `Facture-${o.orderNumber}.pdf`);
    });
  }
}
