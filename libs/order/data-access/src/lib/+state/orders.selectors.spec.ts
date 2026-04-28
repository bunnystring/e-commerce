import * as OrdersSelectors from './orders.selectors';
import { OrderStatus } from '../models/order-status.enum';
import { createMockOrder, createMockOrdersState } from '@e-commerce/testing';

/**
 * Tests para los selectors de Orders.
 *
 * Se enfocan en la lógica de selección y transformación de datos, no en la integración con NgRx.
 * Por eso se prueban los "projector" functions directamente, pasando estados simulados.
 *
 * Cobertura objetivo: 95-100%. Son funciones puras, sin dependencias externas, y críticas para el correcto funcionamiento de la UI.
 */
describe('Orders Selectors', () => {
  describe('selectores básicos', () => {
    it('selectAllOrders debe retornar el array orders del state', () => {
      const orders = [
        createMockOrder({ id: 'a' }),
        createMockOrder({ id: 'b' }),
      ];
      const state = createMockOrdersState({ orders });

      const result = OrdersSelectors.selectAllOrders.projector(state);
      expect(result).toEqual(orders);
    });

    it('selectSelectedOrder debe retornar selectedOrder del state', () => {
      const order = createMockOrder({ id: 'a' });
      const state = createMockOrdersState({ selectedOrder: order });

      expect(OrdersSelectors.selectSelectedOrder.projector(state)).toEqual(
        order,
      );
    });

    it('selectOrdersError debe retornar el error del state', () => {
      const error = { code: 'X', message: 'algo' };
      const state = createMockOrdersState({ error });

      expect(OrdersSelectors.selectOrdersError.projector(state)).toEqual(error);
    });
  });

  describe('selectores de loading', () => {
  it('selectIsLoadingList debe leer loading.list', () => {
    const loadingState = { list: true, detail: false, action: false };

    const result = OrdersSelectors.selectIsLoadingList.projector(loadingState);
    expect(result).toBe(true);
  });

  it('selectIsLoadingDetail debe leer loading.detail', () => {
    const loadingState = { list: false, detail: true, action: false };

    expect(OrdersSelectors.selectIsLoadingDetail.projector(loadingState)).toBe(true);
  });

  it('selectIsLoadingAction debe leer loading.action', () => {
    const loadingState = { list: false, detail: false, action: true };

    expect(OrdersSelectors.selectIsLoadingAction.projector(loadingState)).toBe(true);
  });
});

describe('selectHasActiveFilters', () => {
  it.each([
    [{ status: [OrderStatus.PENDING] }, true, 'array de status no vacío'],
    [{ status: [] }, false, 'array de status vacío'],
    [{ searchTerm: 'algo' }, true, 'searchTerm con valor'],
    [{ searchTerm: '' }, false, 'searchTerm vacío'],
    [{ customerId: 'c-1' }, true, 'customerId presente'],
    [{ dateRange: { from: new Date(), to: undefined } }, true, 'dateRange.from definido'],
    [{ dateRange: { from: undefined, to: undefined } }, false, 'dateRange con ambos undefined'],
    [{ minTotal: 100 }, true, 'minTotal numérico positivo'],
    [{ minTotal: 0 }, true, 'minTotal = 0 (es number, cuenta)'],
    [{}, false, 'objeto de filtros vacío'],
  ])('con %j → retorna %s (%s)', (filtros, esperado) => {
    const result = OrdersSelectors.selectHasActiveFilters.projector(filtros);
    expect(result).toBe(esperado);
  });
});
});
