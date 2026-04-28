import * as OrdersSelectors from './orders.selectors';
import { OrderStatus } from '../models/order-status.enum';
import {
  createMockOrder,
  createMockOrdersState,
} from '@e-commerce/testing';


describe('selectores básicos', () => {
  it('selectAllOrders debe retornar el array orders del state', () => {
    const orders = [createMockOrder({ id: 'a' }), createMockOrder({ id: 'b' })];
    const state = createMockOrdersState({ orders });

    const result = OrdersSelectors.selectAllOrders.projector(state);
    expect(result).toEqual(orders);
  });

  it('selectSelectedOrder debe retornar selectedOrder del state', () => {
    const order = createMockOrder({ id: 'a' });
    const state = createMockOrdersState({ selectedOrder: order });

    expect(OrdersSelectors.selectSelectedOrder.projector(state)).toEqual(order);
  });

  it('selectOrdersError debe retornar el error del state', () => {
    const error = { code: 'X', message: 'algo' };
    const state = createMockOrdersState({ error });

    expect(OrdersSelectors.selectOrdersError.projector(state)).toEqual(error);
  });
});
