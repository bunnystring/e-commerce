import { Customer } from './customer.model';
import { OrderItem } from './order-item.model';
import { OrderStatus } from './order-status.enum';

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}
