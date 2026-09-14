import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Order } from '../../../core/models/models';
import { OrderService } from '../../../core/services/order.service';
import { downloadBlob } from '../../../core/utils/download';
import { orderStatusLabel, paymentMethodLabel } from '../../../core/utils/labels';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed'];

@Component({
  selector: 'app-client-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class ClientOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  order = signal<Order | null>(null);
  loading = signal(true);
  statusSteps = STATUS_STEPS;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.orderService.getOne(id).subscribe((res) => {
      this.order.set(res.data);
      this.loading.set(false);
    });
  }

  statusLabel = orderStatusLabel;
  paymentLabel = paymentMethodLabel;

  stepIndex(): number {
    const o = this.order();
    if (!o) return -1;
    return this.statusSteps.indexOf(o.status);
  }

  downloadInvoice(): void {
    const o = this.order();
    if (!o) return;
    this.orderService.downloadInvoice(o.id, o.orderNumber).subscribe((blob) => {
      downloadBlob(blob, `Facture-${o.orderNumber}.pdf`);
    });
  }
}
