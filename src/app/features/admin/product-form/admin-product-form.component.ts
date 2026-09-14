import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Category } from '../../../core/models/models';
import { CategoryService } from '../../../core/services/category.service';
import { AdminProductService, ProductPayload } from '../../../core/services/admin/admin-product.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-product-form.component.html',
  styleUrl: './admin-product-form.component.scss'
})
export class AdminProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private productService = inject(AdminProductService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  categories = signal<Category[]>([]);
  productId = signal<string | null>(null);
  saving = signal(false);

  form = this.fb.nonNullable.group({
    categoryId: ['', Validators.required],
    sku: ['', Validators.required],
    name: ['', Validators.required],
    slug: ['', Validators.required],
    brand: ['', Validators.required],
    shortDescription: [''],
    description: [''],
    priceHt: [0, [Validators.required, Validators.min(0)]],
    priceTtc: [0, [Validators.required, Validators.min(0)]],
    compareAtPriceTtc: [null as number | null],
    stock: [0, [Validators.required, Validators.min(0)]],
    stockAlertThreshold: [5, [Validators.required, Validators.min(0)]],
    warrantyMonths: [24, Validators.min(0)],
    availability: ['in_stock', Validators.required],
    isActive: [true],
    isFeatured: [false],
    isNew: [false],
    highlights: this.fb.array<string>([]),
    images: this.fb.array([]),
    variants: this.fb.array([]),
    specs: this.fb.array([])
  });

  get highlightsArray(): FormArray {
    return this.form.get('highlights') as FormArray;
  }
  get imagesArray(): FormArray {
    return this.form.get('images') as FormArray;
  }
  get variantsArray(): FormArray {
    return this.form.get('variants') as FormArray;
  }
  get specsArray(): FormArray {
    return this.form.get('specs') as FormArray;
  }

  ngOnInit(): void {
    this.categoryService.list().subscribe((res) => this.categories.set(res.data));

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nouveau') {
      this.productId.set(id);
      this.productService.getOne(id).subscribe((res) => {
        const p = res.data;
        this.form.patchValue({
          categoryId: p.categoryId, sku: p.sku, name: p.name, slug: p.slug, brand: p.brand,
          shortDescription: p.shortDescription, description: p.description,
          priceHt: p.priceHt, priceTtc: p.priceTtc, compareAtPriceTtc: p.compareAtPriceTtc ?? null,
          stock: p.stock, stockAlertThreshold: p.stockAlertThreshold, warrantyMonths: p.warrantyMonths,
          availability: p.availability, isActive: p.isActive, isFeatured: p.isFeatured, isNew: p.isNew
        });
        p.highlights.forEach((h) => this.highlightsArray.push(this.fb.nonNullable.control(h)));
        p.images.forEach((img) => this.imagesArray.push(this.fb.nonNullable.group({ url: [img.url, Validators.required], altText: [img.altText || ''], isPrimary: [img.isPrimary] })));
        p.variants.forEach((v) => this.variantsArray.push(this.fb.nonNullable.group({
          name: [v.name, Validators.required], sku: [v.sku, Validators.required],
          priceDeltaTtc: [v.priceDeltaTtc], stock: [v.stock], isDefault: [v.isDefault]
        })));
        Object.entries(p.specs).forEach(([key, value]) => this.specsArray.push(this.fb.nonNullable.group({ key: [key], value: [value] })));
      });
    }
  }

  addHighlight(): void {
    this.highlightsArray.push(this.fb.nonNullable.control(''));
  }
  removeHighlight(i: number): void {
    this.highlightsArray.removeAt(i);
  }

  addImage(): void {
    this.imagesArray.push(this.fb.nonNullable.group({ url: ['', Validators.required], altText: [''], isPrimary: [this.imagesArray.length === 0] }));
  }
  removeImage(i: number): void {
    this.imagesArray.removeAt(i);
  }

  addVariant(): void {
    this.variantsArray.push(this.fb.nonNullable.group({
      name: ['', Validators.required], sku: ['', Validators.required], priceDeltaTtc: [0], stock: [0], isDefault: [this.variantsArray.length === 0]
    }));
  }
  removeVariant(i: number): void {
    this.variantsArray.removeAt(i);
  }

  addSpec(): void {
    this.specsArray.push(this.fb.nonNullable.group({ key: [''], value: [''] }));
  }
  removeSpec(i: number): void {
    this.specsArray.removeAt(i);
  }

  slugify(): void {
    const name = this.form.get('name')?.value || '';
    if (!this.form.get('slug')?.value) {
      const normalized = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      this.form.patchValue({ slug: normalized.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') });
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.error('Veuillez compléter les champs obligatoires.');
      return;
    }
    const raw = this.form.getRawValue();
    const specs: Record<string, string> = {};
    raw.specs.forEach((s: any) => { if (s.key) specs[s.key] = s.value; });

    const payload: ProductPayload = {
      ...raw,
      compareAtPriceTtc: raw.compareAtPriceTtc || null,
      specs,
      highlights: raw.highlights.filter((h): h is string => !!h),
      images: raw.images as ProductPayload['images'],
      variants: raw.variants as ProductPayload['variants']
    };

    this.saving.set(true);
    const id = this.productId();
    const req = id ? this.productService.update(id, payload) : this.productService.create(payload);
    req.subscribe({
      next: () => {
        this.notification.success(id ? 'Produit mis à jour.' : 'Produit créé.');
        this.router.navigate(['/admin/produits']);
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err?.error?.message || 'Impossible d\'enregistrer le produit.');
      }
    });
  }
}
