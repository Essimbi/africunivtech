import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Address, Customer, Order } from '../../../core/models/models';
import { AdminCustomerService } from '../../../core/services/admin/admin-customer.service';
import { orderStatusLabel } from '../../../core/utils/labels';

@Component({
  selector: 'app-admin-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-customer-detail.component.html',
  styleUrl: './admin-customer-detail.component.scss'
})
export class AdminCustomerDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private customerService = inject(AdminCustomerService);

  customer = signal<(Customer & { addresses: Address[]; orders: Order[] }) | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.customerService.getOne(id).subscribe((res) => {
      this.customer.set(res.data);
      this.loading.set(false);
    });
  }

  get totalSpent(): number {
    return this.customer()?.orders.reduce((sum, o) => sum + o.totalTtc, 0) || 0;
  }

  statusLabel = orderStatusLabel;
}
