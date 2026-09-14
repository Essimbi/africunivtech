import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  authService = inject(AuthService);
  cartService = inject(CartService);
  private router = inject(Router);

  searchTerm = signal('');
  mobileMenuOpen = signal(false);
  catalogMenuOpen = signal(false);

  itemCount = signal(0);

  ngOnInit(): void {
    this.cartService.refresh();
    this.cartService.cart$.subscribe((cart) => {
      this.itemCount.set(cart.items.reduce((sum, i) => sum + i.quantity, 0));
    });
  }

  submitSearch(): void {
    const term = this.searchTerm().trim();
    this.mobileMenuOpen.set(false);
    this.router.navigate(['/catalogue'], { queryParams: term ? { search: term } : {} });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
