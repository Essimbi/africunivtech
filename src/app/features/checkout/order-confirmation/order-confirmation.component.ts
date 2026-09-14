import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Order } from '../../../core/models/models';
import { OrderService } from '../../../core/services/order.service';
import { CheckoutStepsComponent } from '../../../shared/components/checkout-steps/checkout-steps.component';
import { downloadBlob } from '../../../core/utils/download';
import { orderStatusLabel, paymentMethodLabel } from '../../../core/utils/labels';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink, CheckoutStepsComponent],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.scss'
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  order = signal<Order | null>(null);
  loading = signal(true);

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

  downloadInvoice(): void {
    const order = this.order();
    if (!order) return;
    this.orderService.downloadInvoice(order.id, order.orderNumber).subscribe((blob) => {
      downloadBlob(blob, `Facture-${order.orderNumber}.pdf`);
    });
  }
}
