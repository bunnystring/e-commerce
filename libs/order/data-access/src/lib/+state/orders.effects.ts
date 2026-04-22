import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, concat } from 'rxjs';
import { map, catchError, switchMap, delay } from 'rxjs/operators';
import * as OrdersActions from './orders.actions';
import { MockOrdersService } from '../services/mock-orders.service';
import { Store } from '@ngrx/store';
import { OrderError } from '../models/order-error.model';
import { concatLatestFrom } from '@ngrx/operators';
import { selectOrderById } from './orders.selectors';
import { selectAllOrders } from './orders.selectors';
import { Order } from '../models/order.model';

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

  /**
   * Effect para actualizar el estado de un pedido específico.
   * Escucha la acción updateOrderStatus, obtiene el estado actual del pedido desde el store, realiza una llamada al servicio para actualizar el estado del pedido y despacha acciones de éxito o fracaso según el resultado.
   * Utiliza concatLatestFrom para obtener el estado actual del pedido antes de realizar la llamada al servicio, lo que permite manejar correctamente los casos de actualización fallida y revertir al estado anterior si es necesario.
   * @returns Observable<Action> - Un observable que emite acciones de éxito o fracaso basadas en el resultado de la operación de actualización del estado del pedido.
   */
  updateOrderStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrdersActions.updateOrderStatus),
      concatLatestFrom(({ id }) => this.store.select(selectOrderById(id))),
      switchMap(([{ id, status }, currentOrder]) => {
        const prevStatus = currentOrder?.status;

        if (!prevStatus) {
          return of(
            OrdersActions.updateOrderStatusFailure({
              id,
              prevStatus: undefined as any,
              error: { code: 'NOT_FOUND', message: 'Order not found in store' },
            }),
          );
        }

        return concat(
          of(OrdersActions.applyOptimisticStatus({ id, status, prevStatus })),
          this.ordersService.updateOrderStatus(id, status).pipe(
            map((order) => OrdersActions.updateOrderStatusSuccess({ order })),
            catchError((error) =>
              of(
                OrdersActions.updateOrderStatusFailure({
                  id,
                  prevStatus,
                  error: this.makeOrderError(error),
                }),
              ),
            ),
          ),
        );
      }),
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
      concatLatestFrom(() => this.store.select(selectAllOrders)),
      switchMap(([{ ids, status }, allOrders]) => {
        const prevStatuses: Record<string, Order['status']> = {};
        for (const id of ids) {
          const order = allOrders.find((o) => o.id === id);
          if (order) {
            prevStatuses[id] = order.status;
          }
        }

        return concat(
          of(
            OrdersActions.applyOptimisticBulkStatus({
              ids,
              status,
              prevStatuses,
            }),
          ),
          this.ordersService.bulkUpdateStatus(ids, status).pipe(
            map((orders) => OrdersActions.bulkUpdateStatusSuccess({ orders })),
            catchError((error) =>
              of(
                OrdersActions.bulkUpdateStatusFailure({
                  ids,
                  prevStatuses,
                  error: this.makeOrderError(error),
                }),
              ),
            ),
          ),
        );
      }),
    ),
  );

  /**
   * Effect para limpiar automáticamente el error del estado después de 3 segundos.
   * Escucha cualquier action de failure relacionada con pedidos y dispara clearError
   * tras el timeout, para que el mensaje de error desaparezca de la UI sin interacción del usuario.
   * Usa switchMap para que, si llega un nuevo failure antes de los 3 segundos, se reinicie el timer.
   */
  autoDismissError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        OrdersActions.loadOrdersFailure,
        OrdersActions.loadOrderByIdFailure,
        OrdersActions.createOrderFailure,
        OrdersActions.updateOrderStatusFailure,
        OrdersActions.bulkUpdateStatusFailure,
      ),
      switchMap(() => of(OrdersActions.clearError()).pipe(delay(3000))),
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
