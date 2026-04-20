import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'orders',
    pathMatch: 'full'
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('@e-commerce/order/feature-list').then(m => m.OrderListComponent)
  },
  {
    path: 'orders/create',
    loadComponent: () =>
      import('@e-commerce/order/feature-creation').then(m => m.OrderCreationComponent)
  }
];
