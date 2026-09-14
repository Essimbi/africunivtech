import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-quantity-input',
  standalone: true,
  template: `
    <div class="qty">
      <button type="button" (click)="change(-1)" [disabled]="qty() <= min" aria-label="Diminuer la quantité">
        <span class="material-symbols-outlined">remove</span>
      </button>
      <span class="qty-value" aria-live="polite">{{ qty() }}</span>
      <button type="button" (click)="change(1)" [disabled]="qty() >= max" aria-label="Augmenter la quantité">
        <span class="material-symbols-outlined">add</span>
      </button>
    </div>
  `,
  styles: [`
    .qty {
      display: inline-flex;
      align-items: center;
      border: 1.5px solid var(--color-outline-variant);
      border-radius: var(--radius);
      overflow: hidden;
    }
    button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: var(--color-surface-container);
      border: none;
      color: var(--color-on-surface);
      transition: background .15s ease;
    }
    button:hover:not(:disabled) { background: var(--color-surface-high); }
    button:disabled { opacity: .4; cursor: not-allowed; }
    .qty-value {
      min-width: 36px;
      text-align: center;
      font-weight: 700;
      font-family: var(--font-display);
    }
  `]
})
export class QuantityInputComponent {
  private _value = signal(1);

  @Input() min = 1;
  @Input() max = 99;
  @Input() set value(v: number) { this._value.set(v ?? 1); }
  @Output() valueChange = new EventEmitter<number>();

  qty = this._value.asReadonly();

  change(delta: number): void {
    const next = Math.min(this.max, Math.max(this.min, this._value() + delta));
    this._value.set(next);
    this.valueChange.emit(next);
  }
}
