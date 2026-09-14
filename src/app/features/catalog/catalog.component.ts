import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category, Product } from '../../core/models/models';
import { CategoryService } from '../../core/services/category.service';
import { ProductFilters, ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularité & Recommandés' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'newest', label: 'Derniers arrivages' }
];

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, PaginationComponent, BreadcrumbComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  sortOptions = SORT_OPTIONS;

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  brands = signal<string[]>([]);
  priceBounds = signal<{ min: number; max: number }>({ min: 0, max: 2000000 });
  loading = signal(true);
  filtersOpen = signal(false);

  total = signal(0);
  page = signal(1);
  totalPages = signal(1);

  selectedCategory = signal<string | null>(null);
  selectedBrands = signal<string[]>([]);
  selectedAvailability = signal<string[]>([]);
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  searchTerm = signal<string>('');
  sort = signal('popularity');

  ngOnInit(): void {
    this.categoryService.list().subscribe((res) => this.categories.set(res.data));
    this.productService.facets().subscribe((res) => {
      this.brands.set(res.data.brands);
      this.priceBounds.set({ min: Math.floor(res.data.minPrice), max: Math.ceil(res.data.maxPrice) });
    });

    this.route.queryParamMap.subscribe((params) => {
      this.selectedCategory.set(params.get('category'));
      this.selectedBrands.set(params.get('brand')?.split(',').filter(Boolean) ?? []);
      this.selectedAvailability.set(params.get('availability')?.split(',').filter(Boolean) ?? []);
      this.minPrice.set(params.get('minPrice') ? Number(params.get('minPrice')) : null);
      this.maxPrice.set(params.get('maxPrice') ? Number(params.get('maxPrice')) : null);
      this.searchTerm.set(params.get('search') ?? '');
      this.sort.set(params.get('sort') ?? 'popularity');
      this.page.set(params.get('page') ? Number(params.get('page')) : 1);
      this.fetchProducts();
    });
  }

  fetchProducts(): void {
    this.loading.set(true);
    const filters: ProductFilters = {
      category: this.selectedCategory() ?? undefined,
      brand: this.selectedBrands().length ? this.selectedBrands() : undefined,
      availability: this.selectedAvailability().length ? this.selectedAvailability() : undefined,
      minPrice: this.minPrice() ?? undefined,
      maxPrice: this.maxPrice() ?? undefined,
      search: this.searchTerm() || undefined,
      sort: this.sort(),
      page: this.page(),
      limit: 12
    };

    this.productService.list(filters).subscribe((res) => {
      this.products.set(res.data);
      this.total.set(res.meta.total);
      this.totalPages.set(res.meta.totalPages);
      this.loading.set(false);
    });
  }

  get activeCategoryName(): string {
    return this.categories().find((c) => c.slug === this.selectedCategory())?.name || '';
  }

  updateQuery(patch: Record<string, any>): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...patch, page: patch['page'] ?? null },
      queryParamsHandling: 'merge'
    });
  }

  selectCategory(slug: string | null): void {
    this.updateQuery({ category: slug });
  }

  toggleBrand(brand: string): void {
    const current = new Set(this.selectedBrands());
    current.has(brand) ? current.delete(brand) : current.add(brand);
    this.updateQuery({ brand: current.size ? [...current].join(',') : null });
  }

  toggleAvailability(value: string): void {
    const current = new Set(this.selectedAvailability());
    current.has(value) ? current.delete(value) : current.add(value);
    this.updateQuery({ availability: current.size ? [...current].join(',') : null });
  }

  applyPriceRange(min: number | null, max: number | null): void {
    this.updateQuery({ minPrice: min || null, maxPrice: max || null });
  }

  changeSort(value: string): void {
    this.updateQuery({ sort: value });
  }

  changePage(p: number): void {
    this.updateQuery({ page: p });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  removeBrand(brand: string): void {
    this.toggleBrand(brand);
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedCategory() || this.selectedBrands().length || this.selectedAvailability().length || this.minPrice() || this.maxPrice() || this.searchTerm());
  }
}
