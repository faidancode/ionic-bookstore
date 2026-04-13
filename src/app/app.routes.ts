import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'tabs',
    loadComponent: () =>
      import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'category',
        loadComponent: () =>
          import('./pages/category/category.page').then((m) => m.CategoryPage),
      },
      {
        path: 'wishlist',
        loadComponent: () =>
          import('./pages/wishlist/wishlist.page').then((m) => m.WishlistPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/account/account.page').then((m) => m.AccountPage),
        canActivate: [authGuard],
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'wishlist',
    loadComponent: () =>
      import('./pages/wishlist/wishlist.page').then((m) => m.WishlistPage),
  },
  {
    path: 'category',
    loadComponent: () =>
      import('./pages/category/category.page').then((m) => m.CategoryPage),
  },
  {
    path: 'book-list',
    loadComponent: () =>
      import('./pages/book-list/book-list.page').then((m) => m.BookListPage),
  },
  {
    path: 'book-detail/:slug',
    loadComponent: () =>
      import('./pages/book-detail/book-detail.page').then(
        (m) => m.BookDetailPage,
      ),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart.page').then((m) => m.CartPage),
  },
  {
    path: 'tabs/account/order',
    loadComponent: () =>
      import('./pages/order/order.page').then((m) => m.OrderPage),
  },
  {
    path: 'tabs/order/:id',
    loadComponent: () =>
      import('./pages/order-detail/order-detail.page').then(
        (m) => m.OrderDetailPage,
      ),
  },
  {
    path: 'tabs/account/address',
    loadComponent: () =>
      import('./pages/address/address.page').then((m) => m.AddressPage),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.page').then((m) => m.CheckoutPage),
  },
  {
    path: '',
    redirectTo: 'tabs/home',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: 'tabs/home',
  },
];
