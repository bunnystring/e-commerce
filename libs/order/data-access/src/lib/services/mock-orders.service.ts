import { OrderItem } from './../models/order-item.model';
import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError, switchMap } from 'rxjs';
import { Order } from '../models/order.model';
import { OrderStatus } from '../models/order-status.enum';
import { CreateOrderDto } from '../models/create-order.dto';

/**
 * MockOrdersService
 * Simulamos un servicio de pedidos con datos ficticios para desarrollo y pruebas.
 * Proporciona métodos para obtener pedidos, obtener un pedido por ID y crear nuevos pedidos.
 * Los datos se generan aleatoriamente y se retrasan para simular la latencia de una API real.
 * @version 1.0.0
 * @author Arlez Camilo Ceron Herrera
 */
@Injectable({ providedIn: 'root' })
export class MockOrdersService {
  private orders: Order[] = this.generateOrders();

  getOrders(): Observable<Order[]> {
    return of([...this.orders]).pipe(delay(500));
  }

  /**
   * Servicio para obtener un pedido por su ID.
   * Simula una llamada a una API con un retraso de 300ms.
   * Si el pedido no se encuentra, devuelve un error.
   * @param id - El ID del pedido a buscar.
   * @returns Observable<Order> - Un observable que emite el pedido encontrado o un error si no existe.
   */
  getOrderById(id: string): Observable<Order> {
    const order = this.orders.find((o) => o.id === id);
    if (!order)
      return throwError(() => ({ message: 'Order not found', code: 404 }));
    return of(order).pipe(delay(300));
  }

  /**
   * Servicio para crear un nuevo pedido.
   * Simula una llamada a una API con un retraso de 500ms.
   * Genera un nuevo pedido con un ID único y lo agrega a la lista de pedidos.
   * @param dto - Los datos del pedido a crear.
   * @returns Observable<Order> - Un observable que emite el pedido creado.
   */
  createOrder(dto: CreateOrderDto): Observable<Order> {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      orderNumber: `ORD-${String(this.orders.length + 1).padStart(5, '0')}`,
      customer: {
        id: dto.customerId,
        name: dto.customerName,
        email: dto.customerEmail,
        phone: dto.customerPhone,
      },
      items: dto.items.map((item, idx) => ({
        id: `item-${idx}`,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
      })),
      status: OrderStatus.PENDING,
      total: dto.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders = [newOrder, ...this.orders];
    return of(newOrder).pipe(delay(500));
  }

  /**
   * Servicio para actualizar el estado de un pedido específico.
   * Simula una llamada a una API con un retraso de 400ms.
   * @param id - El ID del pedido a actualizar.
   * @param status - El nuevo estado a aplicar al pedido.
   * @returns Observable<Order> - Un observable que emite el pedido actualizado.
   */
  updateOrderStatus(id: string, status: OrderStatus): Observable<Order> {

    /* return of(null).pipe(
    delay(10000),
    switchMap(() => throwError(() => ({ message: 'Order update failed', code: 'ERROR_UPDATE' })))
  ); */

    const idx = this.orders.findIndex((o) => o.id === id);
    if (idx === -1)
      return throwError(() => ({ message: 'Order update failed', code: 'ERROR_UPDATE' }));
    this.orders[idx] = { ...this.orders[idx], status, updatedAt: new Date() };
    return of(this.orders[idx]).pipe(delay(400));
  }

  /**
   * Servicio para realizar una actualización masiva del estado de varios pedidos.
   * Simula una llamada a una API con un retraso de 600ms.
   * Actualiza el estado de los pedidos cuyos IDs se proporcionan y devuelve la lista de pedidos actualizados.
   * @param ids - Los IDs de los pedidos a actualizar.
   * @param status - El nuevo estado a aplicar a los pedidos seleccionados.
   * @returns Observable<Order[]> - Un observable que emite los pedidos actualizados.
   */
  bulkUpdateStatus(ids: string[], status: OrderStatus): Observable<Order[]> {

     return of(null).pipe(
    delay(2000),
    switchMap(() => throwError(() => ({ message: 'Order Update Bulk Failed', code: 'ERROR_UPDATE_BULK' })))
  );

    const changed: Order[] = [];
    this.orders = this.orders.map((o) => {
      if (ids.includes(o.id)) {
        const updated = { ...o, status, updatedAt: new Date() };
        changed.push(updated);
        return updated;
      }
      return o;
    });
    return of(changed).pipe(delay(600));
  }

  /**
   * Metodo que genera una lista de pedidos ficticios para simular datos reales.
   * Cada pedido tiene un número aleatorio de artículos, un cliente con información ficticia y un estado aleatorio.
   * @returns Order[] - Una lista de pedidos generados aleatoriamente.
   */
  private generateOrders(): Order[] {
    const orders: Order[] = [];
    const statuses = Object.values(OrderStatus);

    const productPool = [
      { productId: 'prod-001', productName: 'Laptop Dell XPS 13' },
      { productId: 'prod-002', productName: 'Mouse Logitech MX Master' },
      { productId: 'prod-003', productName: 'Teclado Mecánico Keychron' },
      { productId: 'prod-004', productName: 'Monitor LG 27"' },
      { productId: 'prod-005', productName: 'Webcam Logitech C920' },
      { productId: 'prod-006', productName: 'Audífonos Sony WH-1000XM5' },
      { productId: 'prod-007', productName: 'Silla Ergonómica' },
      { productId: 'prod-008', productName: 'Escritorio Regulable' },
    ];

    for (let i = 1; i <= 50; i++) {
      const numItems = Math.floor(Math.random() * 5) + 1;
      const items: OrderItem[] = [];

      for (let j = 0; j < numItems; j++) {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const unitPrice = parseFloat((Math.random() * 200 + 10).toFixed(2));
        const product =
          productPool[Math.floor(Math.random() * productPool.length)];
        items.push({
          id: `item-${i}-${j}`,
          productId: product.productId,
          productName: product.productName,
          quantity,
          unitPrice,
          subtotal: quantity * unitPrice,
        });
      }

      const mobilePrefixes = [
        '300',
        '301',
        '302',
        '310',
        '311',
        '312',
        '313',
        '314',
        '315',
        '316',
        '317',
        '318',
        '320',
        '321',
        '322',
        '323',
        '350',
        '351',
      ];
      const prefix =
        mobilePrefixes[Math.floor(Math.random() * mobilePrefixes.length)];
      const rest = String(Math.floor(Math.random() * 10_000_000)).padStart(
        7,
        '0',
      );

      orders.push({
        id: `ord-${i}`,
        orderNumber: `ORD-${String(i).padStart(5, '0')}`,
        customer: {
          id: `cust-${i}`,
          name: `Customer ${i}`,
          email: `customer${i}@grupoASD.com`,
          phone: `+57 ${prefix}${rest}`,
        },
        items,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        total: items.reduce((sum, item) => sum + item.subtotal, 0),
        createdAt: new Date(
          Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
        ),
        updatedAt: new Date(),
      });
    }

    return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
