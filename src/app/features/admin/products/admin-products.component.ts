import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/models';
import { AdminProductService } from '../../../core/services/admin/admin-product.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss'
})
export class AdminProductsComponent implements OnInit {
  private productService = inject(AdminProductService);
  private notification = inject(NotificationService);

  products = signal<Product[]>([]);
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
    this.productService.list(this.page(), 20, this.search()).subscribe((res) => {
      this.products.set(res.data);
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

  adjustStock(product: Product, delta: number, event: Event): void {
    event.stopPropagation();
    this.productService.adjustStock(product.id, delta).subscribe((res) => {
      this.products.update((list) => list.map((p) => (p.id === product.id ? res.data : p)));
    });
  }

  remove(product: Product, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Désactiver le produit "${product.name}" ?`)) return;
    this.productService.remove(product.id).subscribe(() => {
      this.notification.info('Produit désactivé.');
      this.load();
    });
  }
}
