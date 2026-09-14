import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-storefront-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastComponent],
  template: `
    <a class="skip-link" href="#main-content">Aller au contenu principal</a>
    <app-header />
    <main id="main-content">
      <router-outlet />
    </main>
    <app-footer />
    <app-toast />
  `
})
export class StorefrontLayoutComponent {}
