export interface CreateOrderDto {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
}
