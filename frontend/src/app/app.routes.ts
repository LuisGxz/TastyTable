import { Routes } from '@angular/router';
import { authGuard, guestGuard, homeRedirectGuard } from './core/auth/guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [homeRedirectGuard], children: [] },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'discover' },
      { path: 'discover', loadComponent: () => import('./features/discover/discover.page').then((m) => m.DiscoverPage) },
      { path: 'reservations', loadComponent: () => import('./features/reservations/reservations.page').then((m) => m.ReservationsPage) },
      { path: 'restaurant', loadComponent: () => import('./features/owner/owner-restaurant.page').then((m) => m.OwnerRestaurantPage) },
      { path: 'account', loadComponent: () => import('./features/account/account.page').then((m) => m.AccountPage) },
    ],
  },
  {
    path: 'restaurant/:slug',
    canActivate: [authGuard],
    loadComponent: () => import('./features/detail/detail.page').then((m) => m.DetailPage),
  },
  {
    path: 'about',
    canActivate: [authGuard],
    loadComponent: () => import('./features/about/about.page').then((m) => m.AboutPage),
  },
  { path: '**', redirectTo: '' },
];
