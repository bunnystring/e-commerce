import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators';
import * as OrdersActions from './orders.actions';
import { MockOrdersService } from '../services/mock-orders.service';
import { Store } from '@ngrx/store';
import { selectActiveFilters, selectPagination } from './orders.selectors';
import { OrderError } from '../models/order-error.model';

/**
 * Orders Effects
 * Define los efectos relacionados con las acciones de pedidos en la aplicación.
 * Los efectos permiten manejar operaciones asincrónicas, como llamadas a API, y despachar acciones basadas en los resultados.
 * @version 1.0.0
 * @author Arlez Camilo Ceron Herrera
 */
@Injectable()
export class OrdersEffects {
  // actions$: Observable<Action> - Un observable que emite las acciones despachadas en la aplicación.
  private actions$ = inject(Actions);

  // ordersService: MockOrdersService - Un servicio simulado para manejar operaciones relacionadas con pedidos.
  private ordersService = inject(MockOrdersService);

  // store: Store - El store de NgRx para interactuar con el estado de los pedidos.
  private store = inject(Store);

  loadOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrdersActions.loadOrders),
      switchMap(() =>
        this.ordersService.getOrders().pipe(
          map((orders) => OrdersActions.loadOrdersSuccess({ orders })),
          catchError((error) =>
            of(
              OrdersActions.loadOrdersFailure({
                error: this.makeOrderError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  /**
   * Effect para cargar un pedido específico por su ID.
   * Escucha la acción loadOrderById, realiza una llamada al servicio para obtener el pedido por su ID y despacha acciones de éxito o fracaso según el resultado.
   * Utiliza switchMap para cancelar cualquier solicitud anterior si se emite una nueva acción de carga antes de que la anterior se complete.
   * @returns Observable<Action> - Un observable que emite acciones de éxito o fracaso basadas en el resultado de la operación de carga del pedido específico.
   */
  loadOrderById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrdersActions.loadOrderById),
      switchMap(({ id }) =>
        this.ordersService.getOrderById(id).pipe(
          map((order) => OrdersActions.loadOrderByIdSuccess({ order })),
          catchError((error) =>
            of(
              OrdersActions.loadOrderByIdFailure({
                error: this.makeOrderError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  /**
   * Effect para crear un nuevo pedido.
   * Escucha la acción createOrder, realiza una llamada al servicio para crear el pedido y despacha acciones de éxito o fracaso según el resultado.
   * Utiliza switchMap para cancelar cualquier solicitud anterior si se emite una nueva acción de creación antes de que la anterior se complete.
   * @returns Observable<Action> - Un observable que emite acciones de éxito o fracaso basadas en el resultado de la operación de creación.
   */
  createOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrdersActions.createOrder),
      switchMap(({ order }) =>
        this.ordersService.createOrder(order).pipe(
          map((newOrder) =>
            OrdersActions.createOrderSuccess({ order: newOrder }),
          ),
          catchError((error) =>
            of(
              OrdersActions.createOrderFailure({
                error: this.makeOrderError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  updateOrderStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrdersActions.updateOrderStatus),
      switchMap(({ id, status }) =>
        this.ordersService.updateOrderStatus(id, status).pipe(
          map((order) => OrdersActions.updateOrderStatusSuccess({ order })),
          catchError((error, caught) =>
            // Para rollback: obtener el estado anterior (si lo necesitas)
            // Lo común es pasarlo desde el action, pero aquí no tenemos acceso, así que deberías ajustarlo si tu servicio lo soporta
            of(
              OrdersActions.updateOrderStatusFailure({
                id,
                prevStatus: error.prevStatus ?? null,
                error: this.makeOrderError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  /**
   * Effect para realizar una actualización masiva del estado de varios pedidos.
   * Escucha la acción bulkUpdateStatus, realiza una llamada al servicio para actualizar el estado de los pedidos y despacha acciones de éxito o fracaso según el resultado.
   * Utiliza switchMap para cancelar cualquier solicitud anterior si se emite una nueva acción de actualización masiva antes de que la anterior se complete.
   * @returns Observable<Action> - Un observable que emite acciones de éxito o fracaso basadas en el resultado de la operación de actualización masiva.
   */
  bulkUpdateStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrdersActions.bulkUpdateStatus),
      switchMap(({ ids, status }) =>
        this.ordersService.bulkUpdateStatus(ids, status).pipe(
          map((orders) => OrdersActions.bulkUpdateStatusSuccess({ orders })),
          catchError((error) =>
            of(
              OrdersActions.bulkUpdateStatusFailure({
                ids,
                error: this.makeOrderError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  /**
   * Método auxiliar para convertir errores genéricos en objetos OrderError específicos para las operaciones relacionadas con pedidos.
   * Permite estandarizar el formato de los errores que se manejan en los efectos y reducers relacionados con pedidos, facilitando la gestión de errores en la aplicación.
   * @param error - El error recibido desde la operación fallida.
   * @returns OrderError - Un objeto que representa el error de la operación de pedido.
   */
  private makeOrderError(error: any): OrderError {
    return {
      code: error?.code ?? 'UNKNOWN',
      message:
        error?.message ??
        (typeof error === 'string' ? error : 'Error inesperado'),
    };
  }
}
