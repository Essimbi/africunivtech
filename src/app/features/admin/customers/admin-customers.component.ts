import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Customer } from '../../../core/models/models';
import { AdminCustomerService } from '../../../core/services/admin/admin-customer.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  templateUrl: './admin-customers.component.html',
  styleUrl: './admin-customers.component.scss'
})
export class AdminCustomersComponent implements OnInit {
  private customerService = inject(AdminCustomerService);

  customers = signal<Customer[]>([]);
  loading = signal(true);
  search = signal('');
  page = signal(1);
  totalPages = signal(1);
  total = signal(0);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.customerService.list(this.page(), 15, this.search()).subscribe((res) => {
      this.customers.set(res.data);
      this.totalPages.set(res.meta.totalPages);
      this.total.set(res.meta.total);
      this.loading.set(false);
    });
  }

  onSearch(): void {
    this.page.set(1);
    this.load();
  }

  changePage(p: number): void {
    this.page.set(p);
    this.load();
  }

  toggleActive(customer: Customer, event: Event): void {
    event.stopPropagation();
    this.customerService.setActive(customer.id, !customer.isActive).subscribe((res) => {
      this.customers.update((list) => list.map((c) => (c.id === customer.id ? res.data : c)));
    });
  }
}
