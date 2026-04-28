import { OrdersState } from '@e-commerce/order/data-access';

/**
 * Factory para crear un OrdersState de prueba.
 * Por defecto retorna el estado inicial; permite override de cualquier propiedad.
 */
export function createMockOrdersState(
  overrides: Partial<OrdersState> = {},
): OrdersState {
  return {
    orders: [],
    selectedOrder: null,
    filters: {},
    pagination: { page: 1, pageSize: 10 },
    loading: { list: false, detail: false, action: false },
    error: null,
    ...overrides,
  };
}
