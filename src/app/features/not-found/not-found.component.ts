import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container not-found">
      <span class="material-symbols-outlined">travel_explore</span>
      <h1>Page introuvable</h1>
      <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <a routerLink="/" class="btn btn-primary">Retour à l'accueil</a>
    </div>
  `,
  styles: [`
    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-sm);
      padding: 5rem 0;
      text-align: center;
    }
    .material-symbols-outlined { font-size: 4rem; color: var(--color-outline); }
    p { color: var(--color-on-surface-variant); }
  `]
})
export class NotFoundComponent {}
