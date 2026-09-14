import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  link?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="breadcrumb" aria-label="Fil d'Ariane">
      @for (item of items; track item.label; let last = $last) {
        @if (item.link && !last) {
          <a [routerLink]="item.link">{{ item.label }}</a>
          <span class="material-symbols-outlined sep">chevron_right</span>
        } @else {
          <span class="current" aria-current="page">{{ item.label }}</span>
        }
      }
    </nav>
  `,
  styles: [`
    .breadcrumb {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
      font-size: .8125rem;
      color: var(--color-on-surface-variant);
      margin-bottom: var(--space-md);
    }
    a { color: var(--color-on-surface-variant); transition: color .15s ease; }
    a:hover { color: var(--color-primary); }
    .current { color: var(--color-on-surface); font-weight: 600; }
    .sep { font-size: 1rem; color: var(--color-outline); }
  `]
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}
