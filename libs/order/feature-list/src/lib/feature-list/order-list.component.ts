import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  pairwise,
} from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import {
  HasPermissionDirective,
  PermissionsService,
} from '@e-commerce/shared-permissions';
import { LoadingStateDirective } from '@e-commerce/shared-ui-common';

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
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OrderStatusPipe,
    HasPermissionDirective,
    LoadingStateDirective,
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListComponent implements OnInit {
  // variables para manejar los filtros de búsqueda y estado seleccionados por el usuario.
  customerId = '';
  fromDate = '';
  toDate = '';
  minTotal?: number;

  // facade: OrdersFacade - La fachada para interactuar con el estado de los pedidos.
  facade = inject(OrdersFacade);
  router = inject(Router);

  // permissionsService: PermissionsService - El servicio para manejar los permisos del usuario.
  private permissionsService = inject(PermissionsService);

  // Observables para obtener los datos de pedidos, estado de carga, estadísticas y filtros activos desde la fachada.
  orders$: Observable<Order[]> = this.facade.orders$;
  loading$ = this.facade.isLoadingList$;
  filteredOrders$ = this.facade.filteredOrders$;
  totalRevenue$ = this.facade.totalRevenue$;
  activeFilters$ = this.facade.activeFilters$;
  pagination$ = this.facade.pagination$;
  totalPages$ = this.facade.totalPages$;
  ordersByStatus$ = this.facade.ordersByStatus$;

  // currentPermissions$: Observable<string[]> - Un observable que emite los permisos actuales del usuario.
  currentPermissions$ = inject(PermissionsService).permissions$;

  // Variables para manejar los filtros de búsqueda y estado seleccionados por el usuario.
  searchTerm = '';
  selectedStatuses: OrderStatus[] = [];

  // Lista de todos los estados de pedido disponibles para mostrar en la interfaz de filtros.
  allStatuses = Object.values(OrderStatus);

  // variable para almacenar los IDs de los pedidos seleccionados para acciones masivas.
  selectedOrderIds = new Set<string>();
  searchControl = new FormControl('', { nonNullable: true });

  // destroyRef: DestroyRef - Un objeto para manejar la destrucción de suscripciones y evitar fugas de memoria.
  private destroyRef = inject(DestroyRef);

  /**
   * Método ngOnInit para inicializar el componente.
   * Carga los pedidos iniciales y configura las suscripciones reactivas a cambios
   * de búsqueda y estado de acciones masivas.
   */
  ngOnInit() {
    this.facade.loadOrders();
    this.initSearchSubscription();
    this.initBulkActionCompletionHandler();
  }

  /**
   * Suscripción al control de búsqueda con debounce.
   * Aplica el término de búsqueda al filtro de pedidos 300ms después de que
   * el usuario deje de escribir, evitando llamadas innecesarias por cada tecla.
   */
  private initSearchSubscription(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term) => {
        this.facade.updateFilters({ searchTerm: term || undefined });
      });
  }

  /**
   * Suscripción al estado de carga de acciones masivas.
   * Detecta la transición de loading=true a loading=false (acción completada)
   * para limpiar los pedidos seleccionados automáticamente, evitando que la barra
   * de acciones masivas desaparezca antes de que termine el spinner.
   */
  private initBulkActionCompletionHandler(): void {
    this.facade.isLoadingAction$
      .pipe(
        pairwise(),
        filter(([prev, curr]) => prev === true && curr === false),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.selectedOrderIds.clear();
      });
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
    this.searchControl.setValue('', { emitEvent: false });
    this.selectedStatuses = [];
    this.customerId = '';
    this.fromDate = '';
    this.toDate = '';
    this.minTotal = undefined;
    this.facade.clearFilters();
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
  /**
   * Metodo que selecciona o deselecciona un pedido para realizar una acción masiva
   * @param orderId El ID del pedido cuyo estado de selección se va a cambiar.
   * @param event El evento de cambio del checkbox.
   */
  toggleOrderSelection(orderId: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
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
    this.facade.bulkUpdateStatus(
      Array.from(this.selectedOrderIds),
      status as OrderStatus,
    );
  }

  /**
   * Aplica un preset de permisos. Se usa en el panel de demo para cambiar de rol en vivo
   * y demostrar que la directiva appHasPermission reacciona automáticamente.
   */
  setRole(role: 'viewer' | 'editor' | 'admin') {
    const roleMap: Record<typeof role, string[]> = {
      viewer: ['orders:read'],
      editor: ['orders:read', 'orders:update'],
      admin: ['orders:read', 'orders:update', 'orders:delete', 'admin'],
    };
    this.permissionsService.setPermissions(roleMap[role]);
  }

  /**
   * Método para manejar el cambio de estado de un pedido específico.
   * Se llama cuando el usuario selecciona un nuevo estado desde el select.
   * Usa ngModelChange para garantizar sincronización bidireccional: si el estado
   * se revierte en el store (por un rollback, por ejemplo), el select refleja el cambio.
   * @param orderId El ID del pedido cuyo estado se va a cambiar.
   * @param status El nuevo estado seleccionado.
   */
  onStatusChange(orderId: string, status: OrderStatus) {
    if (!orderId || !status) return;
    this.facade.updateOrderStatus(orderId, status);
  }
}
