import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { appRoutes } from './app.routes';
import { ordersReducer, OrdersEffects } from '@e-commerce/order/data-access';
import { DummyOrderStatusI18n, OrderStatusI18n } from '@e-commerce/order/ui-components';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideStore({ orders: ordersReducer }),
    provideEffects([OrdersEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: false }),
    { provide: OrderStatusI18n, useClass: DummyOrderStatusI18n }
  ],
};
