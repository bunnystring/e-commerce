import { ordersReducer, initialState } from './orders.reducer';
import * as OrdersActions from './orders.actions';
import { OrderStatus } from '../models/order-status.enum';
import { createMockOrder, createMockOrders } from '@e-commerce/testing';

/**
 * Tests del reducer de Orders.
 *
 * Estrategia: el reducer es una función pura (estado, acción) => nuevo estado.
 * No requiere mocks, ni TestBed, ni asincronía. Cada test instancia un estado
 * de partida, despacha una acción, y verifica el estado resultante.
 *
 */
describe('ordersReducer', () => {
  describe('estado inicial', () => {
    it('debe retornar el estado inicial cuando recibe una acción desconocida', () => {
      const action = { type: 'UNKNOWN_ACTION' } as never;
      const state = ordersReducer(undefined, action);
      expect(state).toEqual(initialState);
    });
  });

  describe('loadOrders', () => {
    it('debe activar loading.list y limpiar el error previo', () => {
      const stateConError = {
        ...initialState,
        error: { code: 'PREV_ERROR', message: 'error previo' },
      };

      const result = ordersReducer(stateConError, OrdersActions.loadOrders({}));

      expect(result.loading.list).toBe(true);
      expect(result.error).toBeNull();
    });

    it('debe mergear filters y resetear page a 1 cuando recibe filters', () => {
      const stateInicial = {
        ...initialState,
        filters: { searchTerm: 'previo' },
        pagination: { page: 5, pageSize: 10 },
      };

      const result = ordersReducer(
        stateInicial,
        OrdersActions.loadOrders({ filters: { customerId: 'c-1' } }),
      );

      expect(result.filters).toEqual({
        searchTerm: 'previo',
        customerId: 'c-1',
      });
      expect(result.pagination.page).toBe(1);
    });

    it('NO debe modificar filters ni page cuando filters es undefined', () => {
      const stateInicial = {
        ...initialState,
        filters: { searchTerm: 'previo' },
        pagination: { page: 5, pageSize: 10 },
      };

      const result = ordersReducer(stateInicial, OrdersActions.loadOrders({}));

      expect(result.filters).toEqual({ searchTerm: 'previo' });
      expect(result.pagination.page).toBe(5);
    });
  });

  describe('loadOrdersSuccess', () => {
    it('debe poblar orders y desactivar loading.list', () => {
      const orders = createMockOrders(3);
      const stateLoading = {
        ...initialState,
        loading: { ...initialState.loading, list: true },
      };

      const result = ordersReducer(
        stateLoading,
        OrdersActions.loadOrdersSuccess({ orders }),
      );

      expect(result.orders).toEqual(orders);
      expect(result.loading.list).toBe(false);
    });
  });

  describe('loadOrdersFailure', () => {
    it('debe setear el error y desactivar loading.list', () => {
      const error = { code: 'NETWORK', message: 'Sin conexión' };
      const stateLoading = {
        ...initialState,
        loading: { ...initialState.loading, list: true },
      };

      const result = ordersReducer(
        stateLoading,
        OrdersActions.loadOrdersFailure({ error }),
      );

      expect(result.error).toEqual(error);
      expect(result.loading.list).toBe(false);
    });
  });

  describe('createOrderSuccess', () => {
    it('debe agregar el nuevo pedido al INICIO de la lista', () => {
      const ordersExistentes = createMockOrders(2);
      const nuevoOrder = createMockOrder({ id: 'order-nuevo' });
      const stateInicial = { ...initialState, orders: ordersExistentes };

      const result = ordersReducer(
        stateInicial,
        OrdersActions.createOrderSuccess({ order: nuevoOrder }),
      );

      expect(result.orders[0]).toEqual(nuevoOrder);
      expect(result.orders).toHaveLength(3);
      expect(result.loading.action).toBe(false);
    });
  });

  describe('applyOptimisticStatus', () => {
    it('debe actualizar el status del pedido indicado sin tocar los demás', () => {
      const orders = [
        createMockOrder({ id: 'a', status: OrderStatus.PENDING }),
        createMockOrder({ id: 'b', status: OrderStatus.PENDING }),
      ];
      const stateInicial = { ...initialState, orders };

      const result = ordersReducer(
        stateInicial,
        OrdersActions.applyOptimisticStatus({
          id: 'a',
          status: OrderStatus.PAID,
          prevStatus: OrderStatus.PENDING,
        }),
      );

      expect(result.orders[0].status).toBe(OrderStatus.PAID);
      expect(result.orders[1].status).toBe(OrderStatus.PENDING);
    });
  });

  describe('updateOrderStatusFailure (rollback)', () => {
    it('debe revertir el status al prevStatus cuando se proporciona', () => {
      const orders = [createMockOrder({ id: 'a', status: OrderStatus.PAID })];
      const stateInicial = { ...initialState, orders };
      const error = { code: 'CONFLICT', message: 'No se pudo actualizar' };

      const result = ordersReducer(
        stateInicial,
        OrdersActions.updateOrderStatusFailure({
          id: 'a',
          prevStatus: OrderStatus.PENDING,
          error,
        }),
      );

      expect(result.orders[0].status).toBe(OrderStatus.PENDING);
      expect(result.error).toEqual(error);
      expect(result.loading.action).toBe(false);
    });

    it('NO debe modificar orders cuando prevStatus es undefined', () => {
      const orders = [createMockOrder({ id: 'a', status: OrderStatus.PAID })];
      const stateInicial = { ...initialState, orders };

      const result = ordersReducer(
        stateInicial,
        OrdersActions.updateOrderStatusFailure({
          id: 'a',
          prevStatus: undefined,
          error: { code: 'NOT_FOUND', message: 'no existe' },
        }),
      );

      expect(result.orders[0].status).toBe(OrderStatus.PAID);
    });
  });

  describe('updateOrderStatusSuccess', () => {
    it('debe sincronizar selectedOrder cuando coincide con el order actualizado', () => {
      const orderOriginal = createMockOrder({
        id: 'a',
        status: OrderStatus.PENDING,
      });
      const orderActualizado = { ...orderOriginal, status: OrderStatus.PAID };
      const stateInicial = {
        ...initialState,
        orders: [orderOriginal],
        selectedOrder: orderOriginal,
      };

      const result = ordersReducer(
        stateInicial,
        OrdersActions.updateOrderStatusSuccess({ order: orderActualizado }),
      );

      expect(result.selectedOrder).toEqual(orderActualizado);
      expect(result.orders[0]).toEqual(orderActualizado);
    });

    it('NO debe tocar selectedOrder si el ID no coincide con el actualizado', () => {
      const orderEnLista = createMockOrder({ id: 'a' });
      const otroSeleccionado = createMockOrder({ id: 'b' });
      const stateInicial = {
        ...initialState,
        orders: [orderEnLista],
        selectedOrder: otroSeleccionado,
      };

      const result = ordersReducer(
        stateInicial,
        OrdersActions.updateOrderStatusSuccess({
          order: { ...orderEnLista, status: OrderStatus.PAID },
        }),
      );

      expect(result.selectedOrder).toEqual(otroSeleccionado);
    });
  });

  describe('bulkUpdateStatusFailure (rollback masivo)', () => {
    it('debe revertir cada pedido a su prevStatus correspondiente', () => {
      const orders = [
        createMockOrder({ id: 'a', status: OrderStatus.PAID }),
        createMockOrder({ id: 'b', status: OrderStatus.PAID }),
        createMockOrder({ id: 'c', status: OrderStatus.SHIPPED }),
      ];
      const stateInicial = { ...initialState, orders };

      const result = ordersReducer(
        stateInicial,
        OrdersActions.bulkUpdateStatusFailure({
          ids: ['a', 'b'],
          prevStatuses: {
            a: OrderStatus.PENDING,
            b: OrderStatus.PROCESSING,
          },
          error: { code: 'BULK_FAIL', message: 'falló' },
        }),
      );

      expect(result.orders.find((o) => o.id === 'a')!.status).toBe(
        OrderStatus.PENDING,
      );
      expect(result.orders.find((o) => o.id === 'b')!.status).toBe(
        OrderStatus.PROCESSING,
      );
      expect(result.orders.find((o) => o.id === 'c')!.status).toBe(
        OrderStatus.SHIPPED,
      );
    });
  });

  describe('updateFilters', () => {
    it('debe mergear filters y resetear page a 1', () => {
      const stateInicial = {
        ...initialState,
        filters: { searchTerm: 'algo' },
        pagination: { page: 4, pageSize: 10 },
      };

      const result = ordersReducer(
        stateInicial,
        OrdersActions.updateFilters({ filters: { customerId: 'c-1' } }),
      );

      expect(result.filters).toEqual({
        searchTerm: 'algo',
        customerId: 'c-1',
      });
      expect(result.pagination.page).toBe(1);
    });
  });

  describe('clearFilters', () => {
    it('debe vaciar filters y resetear page a 1', () => {
      const stateInicial = {
        ...initialState,
        filters: { searchTerm: 'algo', customerId: 'c-1' },
        pagination: { page: 3, pageSize: 10 },
      };

      const result = ordersReducer(stateInicial, OrdersActions.clearFilters());

      expect(result.filters).toEqual({});
      expect(result.pagination.page).toBe(1);
    });
  });

  describe('clearError', () => {
    it('debe poner error en null sin alterar lo demás', () => {
      const orders = createMockOrders(2);
      const stateInicial = {
        ...initialState,
        orders,
        error: { code: 'X', message: 'algo' },
      };

      const result = ordersReducer(stateInicial, OrdersActions.clearError());

      expect(result.error).toBeNull();
      expect(result.orders).toEqual(orders);
    });
  });

  describe('inmutabilidad', () => {
    it('no debe mutar el estado original al despachar acciones', () => {
      const stateInicial = {
        ...initialState,
        orders: createMockOrders(2),
      };
      const stateCongelado = Object.freeze(stateInicial);

      expect(() =>
        ordersReducer(
          stateCongelado,
          OrdersActions.createOrderSuccess({
            order: createMockOrder({ id: 'order-nuevo' }),
          }),
        ),
      ).not.toThrow();
    });
  });
});
