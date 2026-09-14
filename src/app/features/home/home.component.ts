import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category, Product } from '../../core/models/models';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);

  categories = signal<Category[]>([]);
  featured = signal<Product[]>([]);
  newArrivals = signal<Product[]>([]);
  loading = signal(true);

  reassurance = [
    { icon: 'payments', title: 'Paiement Sécurisé', text: 'Mobile Money (Orange & MTN), virement bancaire pro et paiement à terme sous convention.' },
    { icon: 'local_shipping', title: 'Livraison Sécurisée', text: 'Expédition rapide en 24/48h sur tout le Cameroun et les corridors CEMAC.' },
    { icon: 'verified_user', title: 'Garantie Constructeur', text: 'Matériel neuf garanti 1 à 3 ans avec remplacement anticipé et traçabilité des numéros de série.' }
  ];

  ngOnInit(): void {
    this.categoryService.list().subscribe((res) => this.categories.set(res.data));
    this.productService.list({ featured: true, limit: 4 }).subscribe((res) => this.featured.set(res.data));
    this.productService.list({ isNew: true, limit: 4 }).subscribe((res) => {
      this.newArrivals.set(res.data);
      this.loading.set(false);
    });
  }
}
