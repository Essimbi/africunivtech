import { Routes } from '@angular/router';
import { StorefrontLayoutComponent } from './shared/components/storefront-layout/storefront-layout.component';
import { authGuard, adminGuard, superAdminGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'admin/connexion',
    loadComponent: () => import('./features/admin/login/admin-login.component').then((m) => m.AdminLoginComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent) },
      { path: 'produits', loadComponent: () => import('./features/admin/products/admin-products.component').then((m) => m.AdminProductsComponent) },
      { path: 'produits/nouveau', loadComponent: () => import('./features/admin/product-form/admin-product-form.component').then((m) => m.AdminProductFormComponent) },
      { path: 'produits/:id', loadComponent: () => import('./features/admin/product-form/admin-product-form.component').then((m) => m.AdminProductFormComponent) },
      { path: 'commandes', loadComponent: () => import('./features/admin/orders/admin-orders.component').then((m) => m.AdminOrdersComponent) },
      { path: 'commandes/:id', loadComponent: () => import('./features/admin/order-detail/admin-order-detail.component').then((m) => m.AdminOrderDetailComponent) },
      { path: 'clients', loadComponent: () => import('./features/admin/customers/admin-customers.component').then((m) => m.AdminCustomersComponent) },
      { path: 'clients/:id', loadComponent: () => import('./features/admin/customer-detail/admin-customer-detail.component').then((m) => m.AdminCustomerDetailComponent) },
      { path: 'utilisateurs', canActivate: [superAdminGuard], loadComponent: () => import('./features/admin/admin-users/admin-users.component').then((m) => m.AdminUsersComponent) }
    ]
  },
  {
    path: '',
    component: StorefrontLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent) },
      { path: 'catalogue', loadComponent: () => import('./features/catalog/catalog.component').then((m) => m.CatalogComponent) },
      { path: 'produit/:slug', loadComponent: () => import('./features/product-detail/product-detail.component').then((m) => m.ProductDetailComponent) },
      { path: 'panier', loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent) },
      { path: 'commande', canActivate: [authGuard], loadComponent: () => import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent) },
      { path: 'commande/confirmation/:id', canActivate: [authGuard], loadComponent: () => import('./features/checkout/order-confirmation/order-confirmation.component').then((m) => m.OrderConfirmationComponent) },
      { path: 'contact', loadComponent: () => import('./features/contact/contact.component').then((m) => m.ContactComponent) },

      { path: 'compte/connexion', canActivate: [guestGuard], loadComponent: () => import('./features/client-space/login/login.component').then((m) => m.LoginComponent) },
      { path: 'compte/inscription', canActivate: [guestGuard], loadComponent: () => import('./features/client-space/register/register.component').then((m) => m.RegisterComponent) },
      { path: 'compte/mot-de-passe-oublie', loadComponent: () => import('./features/client-space/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent) },
      { path: 'compte/reinitialiser-mot-de-passe', loadComponent: () => import('./features/client-space/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent) },

      {
        path: 'compte',
        canActivate: [authGuard],
        loadComponent: () => import('./features/client-space/layout/client-space-layout.component').then((m) => m.ClientSpaceLayoutComponent),
        children: [
          { path: '', loadComponent: () => import('./features/client-space/dashboard/dashboard.component').then((m) => m.ClientDashboardComponent) },
          { path: 'commandes', loadComponent: () => import('./features/client-space/orders/orders.component').then((m) => m.ClientOrdersComponent) },
          { path: 'commandes/:id', loadComponent: () => import('./features/client-space/order-detail/order-detail.component').then((m) => m.ClientOrderDetailComponent) },
          { path: 'adresses', loadComponent: () => import('./features/client-space/addresses/addresses.component').then((m) => m.ClientAddressesComponent) },
          { path: 'profil', loadComponent: () => import('./features/client-space/profile/profile.component').then((m) => m.ClientProfileComponent) }
        ]
      },

      { path: '**', loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent) }
    ]
  }
];
