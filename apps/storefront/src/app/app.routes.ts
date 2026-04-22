import { Route } from '@angular/router';

/**
 * appRoutes: Array de rutas principales de la aplicación.
 * Define las rutas para la lista de pedidos y la creación de pedidos, utilizando carga perezosa (lazy loading) para optimizar el rendimiento.
 */
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
