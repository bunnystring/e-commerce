import { OrderStatus } from './order-status.enum';

export interface OrderFilters {
  status?: OrderStatus[];
  searchTerm?: string;
  customerId?: string;
  dateRange?: {from: Date; to: Date};
  minTotal?: number;
}
