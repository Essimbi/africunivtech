import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-checkout-steps',
  standalone: true,
  template: `
    <ol class="steps">
      @for (step of steps; track step.label; let i = $index) {
        <li [class.active]="i + 1 === current" [class.done]="i + 1 < current">
          <span class="step-num">
            @if (i + 1 < current) { <span class="material-symbols-outlined">check</span> } @else { {{ i + 1 }} }
          </span>
          <span class="step-text">
            <strong>{{ i + 1 }}. {{ step.label }}</strong>
            <small>{{ step.hint }}</small>
          </span>
        </li>
      }
    </ol>
  `,
  styles: [`
    .steps {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-md);
      list-style: none;
      margin: 0 0 var(--space-lg);
      padding: 0;
    }
    li {
      display: flex;
      align-items: center;
      gap: .625rem;
      opacity: .5;
    }
    li.active, li.done { opacity: 1; }
    .step-num {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--color-surface-container);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: .8125rem;
      color: var(--color-on-surface-variant);
    }
    li.active .step-num { background: var(--color-primary); color: #fff; }
    li.done .step-num { background: var(--color-inverse-primary); color: var(--color-primary); }
    .step-num .material-symbols-outlined { font-size: 1rem; }
    .step-text { display: flex; flex-direction: column; line-height: 1.15; }
    .step-text strong { font-size: .8125rem; }
    .step-text small { font-size: .6875rem; color: var(--color-outline); }
  `]
})
export class CheckoutStepsComponent {
  @Input() current = 1;

  steps = [
    { label: 'Panier', hint: 'Validation des matériels' },
    { label: 'Livraison & Facturation', hint: 'Bordereau & IFU/RCCM' },
    { label: 'Paiement Sécurisé', hint: 'Mobile Money & Virement' },
    { label: 'Confirmation', hint: 'BL & Fiche de Garantie' }
  ];
}
