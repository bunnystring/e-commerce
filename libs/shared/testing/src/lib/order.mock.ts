import { Order, OrderStatus } from '@e-commerce/order/data-access';

let idCounter = 0;

/**
 * Factory para crear un Order de prueba con valores por defecto razonables.
 * Permite override de cualquier propiedad para casos específicos.
 *
 * @example
 *   const order = createMockOrder({ status: OrderStatus.PAID, total: 500 });
 */
export function createMockOrder(overrides: Partial<Order> = {}): Order {
  idCounter++;
  return {
    id: `order-${idCounter}`,
    status: OrderStatus.PENDING,
    total: 100,
    createdAt: new Date('2026-01-01T10:00:00Z'),
    customer: {
      id: 'customer-1',
      name: 'Juan Pérez',
      email: 'juan@example.com',
    },
    items: [],
    ...overrides,
  } as Order;
}

/**
 * Crea un array de Orders de prueba con IDs predecibles (order-1, order-2, ...).
 */
export function createMockOrders(
  count: number,
  overrides: Partial<Order> = {},
): Order[] {
  return Array.from({ length: count }, (_, i) =>
    createMockOrder({ ...overrides, id: `order-${i + 1}` }),
  );
}

/**
 * Resetea el contador interno de IDs.
 */
export function resetMockOrderIdCounter(): void {
  idCounter = 0;
}
