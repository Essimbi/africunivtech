import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  template: `
    <span class="stars" [attr.aria-label]="'Note ' + ratingValue() + ' sur 5'">
      @for (i of [0, 1, 2, 3, 4]; track i) {
        <span class="material-symbols-outlined" [style.font-variation-settings]="fillFor(i)">star</span>
      }
    </span>
  `,
  styles: [`
    .stars { display: inline-flex; color: var(--color-tertiary-fixed-dim); }
    .material-symbols-outlined { font-size: 1rem; }
  `]
})
export class StarRatingComponent {
  ratingValue = signal(0);

  @Input() set value(v: number) {
    this.ratingValue.set(v ?? 0);
  }

  fillFor(index: number): string {
    const filled = index < Math.round(this.ratingValue());
    return `'FILL' ${filled ? 1 : 0}, 'wght' 500`;
  }
}
