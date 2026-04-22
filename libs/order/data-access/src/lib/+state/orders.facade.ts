import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as OrdersActions from './orders.actions';
import * as OrdersSelectors from './orders.selectors';
import { OrderFilters } from '../models/order-filters.model';
import { CreateOrderDto } from '../models/create-order.dto';
import { Order } from '../models/order.model';
import { OrderStatus } from '../models/order-status.enum';

/**
 * OrdersFacade
 * La fachada para la gestión de pedidos en la aplicación.
 * Proporciona una interfaz simplificada para interactuar con el estado de los pedidos,
 * permitiendo cargar pedidos, crear nuevos pedidos, actualizar filtros y seleccionar pedidos.
 * Utiliza NgRx Store para manejar el estado de manera reactiva y eficiente.
 * @version 1.0.0
 * @author Arlez Camilo Ceron Herrera
 */
@Injectable({ providedIn: 'root' })
export class OrdersFacade {
  // store: Store - El store de NgRx para interactuar con el estado de los pedidos.
  private store = inject(Store);

  // observables para seleccionar diferentes partes del estado de los pedidos utilizando los selectores definidos en OrdersSelectors.
  orders$ = this.store.select(OrdersSelectors.selectPagedFilteredOrders);
  filteredOrders$ = this.store.select(OrdersSelectors.selectFilteredOrders);
  ordersByStatus$ = this.store.select(OrdersSelectors.selectOrdersByStatus);
  totalRevenue$ = this.store.select(OrdersSelectors.selectTotalRevenue);
  loading$ = this.store.select(OrdersSelectors.selectOrdersLoading);
  error$ = this.store.select(OrdersSelectors.selectOrdersError);
  activeFilters$ = this.store.select(OrdersSelectors.selectActiveFilters);
  pagination$ = this.store.select(OrdersSelectors.selectPagination);
  selectedOrder$ = this.store.select(OrdersSelectors.selectSelectedOrder);
  hasActiveFilters$ = this.store.select(OrdersSelectors.selectHasActiveFilters);
  isLoadingList$ = this.store.select(OrdersSelectors.selectIsLoadingList);
  isLoadingDetail$ = this.store.select(OrdersSelectors.selectIsLoadingDetail);
  isLoadingAction$ = this.store.select(OrdersSelectors.selectIsLoadingAction);
  totalPages$ = this.store.select(OrdersSelectors.selectTotalPages);

  /**
   * Método para cargar los pedidos desde la API.
   * Despacha la acción loadOrders para iniciar el proceso de carga.
   * @param filters - Filtros opcionales que se aplicarán antes de cargar (útil para deep links o cargas pre-filtradas).
   */
  loadOrders(filters?: OrderFilters) {
    this.store.dispatch(OrdersActions.loadOrders({ filters }));
  }

  /**
   * Método para cargar un pedido específico por su ID.
   * Despacha la acción loadOrderById con el ID del pedido a cargar.
   * El efecto correspondiente manejará la lógica de carga del pedido específico y actualización del estado.
   * @param id - El ID del pedido a cargar.
   */
  loadOrderById(id: string) {
    this.store.dispatch(OrdersActions.loadOrderById({ id }));
  }

  /**
   * Método para crear un nuevo pedido.
   * Despacha la acción createOrder con los datos del pedido a crear.
   * El efecto correspondiente manejará la lógica de creación y actualización del estado.
   * @param order - Los datos del pedido a crear, encapsulados en un CreateOrderDto.
   */
  createOrder(order: CreateOrderDto) {
    this.store.dispatch(OrdersActions.createOrder({ order }));
  }

  /**
   * Método para actualizar el estado de un pedido específico.
   * Despacha la acción updateOrderStatus con el ID del pedido a actualizar y el nuevo estado a aplicar.
   * El efecto correspondiente manejará la lógica de actualización del estado del pedido y actualización del estado.
   * @param id - El ID del pedido a actualizar.
   * @param status - El nuevo estado a aplicar al pedido.
   */
  updateOrderStatus(id: string, status: OrderStatus) {
    this.store.dispatch(OrdersActions.updateOrderStatus({ id, status }));
  }

  /**
   * Método para realizar una actualización masiva del estado de varios pedidos.
   * Despacha la acción bulkUpdateStatus con los IDs de los pedidos a actualizar y el nuevo estado a aplicar.
   * El efecto correspondiente manejará la lógica de actualización masiva y actualización del estado.
   * @param ids - Los IDs de los pedidos a actualizar.
   * @param status - El nuevo estado a aplicar a los pedidos seleccionados.
   */
  bulkUpdateStatus(ids: string[], status: OrderStatus) {
    this.store.dispatch(OrdersActions.bulkUpdateStatus({ ids, status }));
  }

  /**
   * Método para actualizar los filtros aplicados a la lista de pedidos.
   * Despacha la acción updateFilters con los filtros a actualizar.
   * El reductor correspondiente manejará la lógica de actualización de los filtros en el estado.
   * @param filters - Un objeto parcial de OrderFilters que contiene los filtros a actualizar.
   */
  updateFilters(filters: Partial<OrderFilters>) {
    this.store.dispatch(OrdersActions.updateFilters({ filters }));
  }

  /**
   * Método para limpiar todos los filtros aplicados a la lista de pedidos.
   * Despacha la acción clearFilters para restablecer los filtros a su estado inicial.
   * El reductor correspondiente manejará la lógica de limpieza de los filtros en el estado.
   */
  clearFilters() {
    this.store.dispatch(OrdersActions.clearFilters());
  }

  /**
   * Método para seleccionar un pedido específico.
   * Despacha la acción selectOrder con el pedido a seleccionar o null para deseleccionar.
   * El reductor correspondiente manejará la lógica de actualización del pedido seleccionado en el estado.
   * @param order - El pedido a seleccionar. Si se pasa null, se deseleccionará cualquier pedido seleccionado.
   */
  selectOrder(order: Order | null) {
    this.store.dispatch(OrdersActions.selectOrder({ order }));
  }

  /**
   * Método para cambiar la página actual en la paginación de la lista de pedidos.
   * Despacha la acción changePage con el número de página a cambiar.
   * El reductor correspondiente manejará la lógica de actualización de la página actual en el estado.
   * @param page - El número de página a cambiar.
   */
  changePage(page: number) {
    this.store.dispatch(OrdersActions.changePage({ page }));
  }
}
