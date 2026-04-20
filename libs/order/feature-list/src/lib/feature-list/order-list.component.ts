import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  OrdersFacade,
  OrderStatus,
  Order,
} from '@e-commerce/order/data-access';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { OrderStatusPipe } from '@e-commerce/order/ui-components';

/**
 * OrderListComponent
 * Componente para mostrar la lista de pedidos en la aplicación.
 * Proporciona una interfaz para visualizar los pedidos, aplicar filtros de búsqueda y estado,
 * y mostrar estadísticas básicas sobre los pedidos. Utiliza la fachada OrdersFacade para interactuar
 * con el estado de los pedidos de manera reactiva.
 * @version 1.0.0
 * @author Arlez Camilo Ceron Herrera
 */
@Component({
  selector: 'lib-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, OrderStatusPipe],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
})
export class OrderListComponent implements OnInit {
  customerId = '';
  fromDate = '';
  toDate = '';
  minTotal?: number;

  // facade: OrdersFacade - La fachada para interactuar con el estado de los pedidos.
  facade = inject(OrdersFacade);
  router = inject(Router);

  // Observables para obtener los datos de pedidos, estado de carga, estadísticas y filtros activos desde la fachada.
  orders$: Observable<Order[]> = this.facade.orders$;
  loading$ = this.facade.isLoadingList$;
  filteredOrders$ = this.facade.filteredOrders$;
  totalRevenue$ = this.facade.totalRevenue$;
  activeFilters$ = this.facade.activeFilters$;
  pagination$ = this.facade.pagination$;
  totalPages$ = this.facade.totalPages$;

  // Variables para manejar los filtros de búsqueda y estado seleccionados por el usuario.
  searchTerm = '';
  selectedStatuses: OrderStatus[] = [];

  // Lista de todos los estados de pedido disponibles para mostrar en la interfaz de filtros.
  allStatuses = Object.values(OrderStatus);

  selectedOrderIds = new Set<string>();

  /**
   * Método ngOnInit para cargar los pedidos al inicializar el componente.
   * Llama al método loadOrders de la fachada para iniciar la carga de pedidos desde la API.
   */
  ngOnInit() {
    this.facade.loadOrders();
  }

  /**
   * Método para manejar la selección de estados de pedido en los filtros.
   * Actualiza el filtro de estado en la fachada cada vez que el usuario alterna un estado de pedido.
   * Si no hay estados seleccionados, se elimina el filtro de estado para mostrar todos los pedidos.
   * @param status El estado de pedido que se va a alternar en los filtros activos.
   */
  toggleStatus(status: OrderStatus) {
    const index = this.selectedStatuses.indexOf(status);
    if (index > -1) {
      this.selectedStatuses.splice(index, 1);
    } else {
      this.selectedStatuses.push(status);
    }
    this.facade.updateFilters({
      status:
        this.selectedStatuses.length > 0 ? this.selectedStatuses : undefined,
    });
  }

  /**
   * Método para limpiar todos los filtros aplicados.
   * Restablece los filtros de búsqueda y estado a sus valores predeterminados y actualiza la fachada.
   */
  clearFilters() {
    this.searchTerm = '';
    this.selectedStatuses = [];
    this.customerId = '';
    this.fromDate = '';
    this.toDate = '';
    this.minTotal = undefined;
    this.facade.clearFilters();
  }

  /**
   * Método para obtener la clase CSS correspondiente a un estado de pedido.
   * @param status El estado de pedido para el cual se desea obtener la clase CSS.
   * @returns La clase CSS correspondiente al estado de pedido.
   */
  getStatusClass(status: OrderStatus): string {
    const classes: Record<OrderStatus, string> = {
      [OrderStatus.DRAFT]: 'status-draft',
      [OrderStatus.PENDING]: 'status-pending',
      [OrderStatus.CONFIRMED]: 'status-confirmed',
      [OrderStatus.PROCESSING]: 'status-processing',
      [OrderStatus.SHIPPED]: 'status-shipped',
      [OrderStatus.DELIVERED]: 'status-delivered',
      [OrderStatus.CANCELLED]: 'status-cancelled',
      [OrderStatus.REFUNDED]: 'status-refunded',
    };
    return classes[status] ?? 'status-unknown';
  }

  /**
   * Método para navegar a la página de creación de un nuevo pedido.
   * Utiliza el enrutador de Angular para redirigir al usuario a la ruta de creación de pedidos.
   * La ruta se asume que es '/orders/create', pero puede ajustarse según la configuración de rutas de la aplicación.
   * No se emite ninguna acción a la fachada, ya que la navegación se maneja directamente a través del enrutador.
   */
  newOrder() {
    this.router.navigate(['/orders', 'create']);
  }

  /**
   * Método para manejar los cambios en el campo de búsqueda.
   * Actualiza el filtro de búsqueda en la fachada cada vez que el usuario cambia el término de búsqueda.
   */
  onSearchChange() {
    this.facade.updateFilters({ searchTerm: this.searchTerm });
  }

  /**
   * Método para manejar el cambio de estado de un pedido específico.
   * Se llama cuando el usuario selecciona un nuevo estado para un pedido desde el elemento select en la interfaz.
   * Actualiza el estado del pedido a través de la fachada, que a su vez despacha la acción correspondiente para actualizar el estado en el store y realizar la llamada a la API.
   * @param orderId El ID del pedido cuyo estado se va a cambiar.
   * @param event El evento de cambio del elemento select que contiene el nuevo estado.
   * @returns void
   */
  onChangeStatus(orderId: string, event: Event) {
    const select = event.target as HTMLSelectElement | null;
    const status = select?.value as OrderStatus | undefined;
    if (!orderId || !status) return;
    this.facade.updateOrderStatus(orderId, status);
  }

  /**
   * Metodo para buscar una orden por su ID
   *
   */
  onCustomerIdChange() {
    this.facade.updateFilters({
      customerId: this.customerId ? this.customerId : undefined,
    });
  }

  /**
   * Metodo para buscar por rango de fechas
   *
   */
  onDateRangeChange() {
    const from = this.fromDate ? new Date(this.fromDate) : undefined;
    const to = this.toDate ? new Date(this.toDate) : undefined;

    this.facade.updateFilters({
      dateRange: from && to ? { from, to } : undefined,
    });
  }

  /**
   * Metodo para buscar por total minimo
   *
   * Si el valor de minTotal es mayor que 0, se actualiza el filtro de minTotal en la fachada con ese valor. De lo contrario, se elimina el filtro de minTotal para mostrar todos los pedidos sin filtrar por total mínimo.
   * @returns void
   */
  onMinTotalChange() {
    const val = this.minTotal && this.minTotal > 0 ? this.minTotal : undefined;
    this.facade.updateFilters({ minTotal: val });
  }

  /**
   * Metodo que selecciona o deselecciona un pedido para realizar una acción masiva
   * @param orderId El ID del pedido cuyo estado de selección se va a cambiar.
   * @param checked Indica si el pedido está seleccionado o no.
   */
  toggleOrderSelection(orderId: string, checked: boolean) {
  if (checked) {
    this.selectedOrderIds.add(orderId);
  } else {
    this.selectedOrderIds.delete(orderId);
  }
}

/**
 * Metodo para cambiar el estado de múltiples pedidos seleccionados
 * @param status El nuevo estado que se aplicará a los pedidos seleccionados.
 */
bulkChangeStatus(status: string) {
  this.facade.bulkUpdateStatus(Array.from(this.selectedOrderIds), status as OrderStatus);
  this.selectedOrderIds.clear();
}
}
