import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OrdersState } from './orders.reducer';
import { Order } from '../models/order.model';
import { OrderStatus } from '../models/order-status.enum';
import { Pagination } from '../models/pagination.model';

/**
 * Orders Selectors
 * Definimos los selectores para acceder a las partes específicas del estado de pedidos en la aplicación.
 * Incluye selectores para obtener la lista de pedidos, el estado de carga, los errores, los filtros activos y las estadísticas de pedidos.
 * Los selectores permiten a los componentes suscribirse a cambios específicos en el estado sin necesidad de conocer toda la estructura del estado.
 * @version 1.0.0
 * @author Arlez Camilo Ceron Herrera
 */

// SELECTORES BÁSICOS

/**
 * Selector para obtener el estado completo de pedidos desde el store.
 * Utiliza createFeatureSelector para seleccionar la parte del estado relacionada con los pedidos,
 * que se identifica con la clave 'orders'.
 */
export const selectOrdersState = createFeatureSelector<OrdersState>('orders');

/**
 * Selector para obtener la lista completa de pedidos desde el estado.
 * Utiliza createSelector para seleccionar la propiedad 'orders' del estado de pedidos.
 */
export const selectAllOrders = createSelector(
  selectOrdersState,
  (state) => state.orders,
);

/**
 * Selector para obtener el pedido seleccionado actualmente desde el estado.
 * Utiliza createSelector para seleccionar la propiedad 'selectedOrder' del estado de pedidos.
 */
export const selectSelectedOrder = createSelector(
  selectOrdersState,
  (state) => state.selectedOrder,
);

/**
 * Selector para obtener cualquier error relacionado con los pedidos desde el estado.
 * Utiliza createSelector para seleccionar la propiedad 'error' del estado de pedidos.
 */
export const selectOrdersError = createSelector(
  selectOrdersState,
  (state) => state.error,
);

/**
 * Selector para obtener los filtros activos aplicados a la lista de pedidos desde el estado.
 * Utiliza createSelector para seleccionar la propiedad 'filters' del estado de pedidos.
 */
export const selectActiveFilters = createSelector(
  selectOrdersState,
  (state) => state.filters,
);

/**
 * Selector para obtener las estadísticas de pedidos, como el total de pedidos y el total de ingresos, desde el estado de pedidos.
 * Utiliza createSelector para seleccionar la propiedad 'stats' del estado de pedidos.
 */
export const selectOrdersLoading = createSelector(
  selectOrdersState,
  (state) => state.loading,
);

/**
 * Selector para obtener el estado de carga de la lista de pedidos desde el estado de pedidos.
 * Utiliza createSelector para seleccionar la propiedad 'loading' del estado de pedidos y acceder a la propiedad 'list' que indica si la lista de pedidos está siendo cargada.
 */
export const selectIsLoadingList = createSelector(
  selectOrdersLoading,
  (loading) => loading.list,
);

/**
 * Selector para obtener el estado de carga del detalle de un pedido desde el estado de pedidos.
 * Utiliza createSelector para seleccionar la propiedad 'loading' del estado de pedidos y acceder a la propiedad 'detail' que indica si el detalle de un pedido está siendo cargado.
 * También incluye un selector para el estado de carga de acciones relacionadas con pedidos, accediendo a la propiedad 'action' del estado de carga.
 * Esto permite a los componentes diferenciar entre la carga de la lista de pedidos, la carga del detalle de un pedido específico y la carga de acciones relacionadas con pedidos, como la creación o actualización de pedidos.
 */
export const selectIsLoadingDetail = createSelector(
  selectOrdersLoading,
  (loading) => loading.detail,
);

/**
 * Selector para obtener el estado de carga de acciones relacionadas con pedidos desde el estado de pedidos.
 * Utiliza createSelector para seleccionar la propiedad 'loading' del estado de pedidos y acceder a la propiedad 'action' que indica si una acción relacionada con pedidos está siendo procesada.
 * Esto permite a los componentes diferenciar entre la carga de la lista de pedidos, la carga del detalle de un pedido específico y la carga de acciones relacionadas con pedidos, como la creación o actualización de pedidos.
 */
export const selectIsLoadingAction = createSelector(
  selectOrdersLoading,
  (loading) => loading.action,
);

/**
 * Selector para determinar si hay filtros activos aplicados a la lista de pedidos.
 * Utiliza createSelector para seleccionar los filtros activos desde el estado de pedidos y evaluar si alguno de los filtros está activo.
 * Retorna true si hay al menos un filtro activo, o false si no hay filtros activos.
 * Esto permite a los componentes mostrar indicadores visuales o realizar acciones específicas cuando hay filtros aplicados a la lista de pedidos.
 */
export const selectHasActiveFilters = createSelector(
  selectActiveFilters,
  (filters) =>
    Boolean(
      (filters.status && filters.status.length > 0) ||
        filters.searchTerm ||
        filters.customerId ||
        (filters.dateRange &&
          (filters.dateRange.from || filters.dateRange.to)) ||
        typeof filters.minTotal === 'number',
    ),
);

// --- SELECTORES DERIVADOS ---

/**
 * Selector para obtener la lista de pedidos filtrados según los filtros activos aplicados.
 * Utiliza createSelector para combinar la lista completa de pedidos y los filtros activos, y aplicar la lógica de filtrado en función de los criterios definidos en los filtros.
 * Retorna una nueva lista de pedidos que cumplen con los criterios de filtrado, como el estado del pedido, el término de búsqueda, el ID del cliente, el rango de fechas y el total mínimo.
 * Esto permite a los componentes obtener una lista de pedidos que se ajusta a los filtros aplicados por el usuario, sin necesidad de realizar la lógica de filtrado en los componentes mismos.
 * @returns Order[] - Una lista de pedidos que cumplen con los criterios de filtrado definidos en los filtros activos.
 */
export const selectFilteredOrders = createSelector(
  selectAllOrders,
  selectActiveFilters,
  (orders, filters) => {
    let filtered = [...orders];
    if (filters.status && filters.status.length) {
      filtered = filtered.filter((o) => filters.status!.includes(o.status));
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(term) ||
          o.customer.name.toLowerCase().includes(term) ||
          (o.customer.email && o.customer.email.toLowerCase().includes(term)),
      );
    }
    if (filters.customerId) {
      filtered = filtered.filter((o) => o.customer.id === filters.customerId);
    }
    if (filters.dateRange) {
      const { from, to } = filters.dateRange;
      filtered = filtered.filter((order) => {
        const date = new Date(order.createdAt);
        return (!from || date >= from) && (!to || date <= to);
      });
    }
    if (typeof filters.minTotal === 'number') {
      filtered = filtered.filter((o) => o.total >= filters.minTotal!);
    }
    return filtered;
  },
);

/**
 * Selector para obtener la información completa de paginación.
 * Devuelve el objeto Pagination según el modelo definido en el ejercicio, calculando
 * totalItems y totalPages a partir de los pedidos filtrados (no los guarda en el state para evitar desincronización).
 */
export const selectPagination = createSelector(
  selectOrdersState,
  selectFilteredOrders,
  (state, filteredOrders): Pagination => {
    const totalItems = filteredOrders.length;
    const totalPages = Math.max(
      1,
      Math.ceil(totalItems / state.pagination.pageSize),
    );
    return {
      page: state.pagination.page,
      pageSize: state.pagination.pageSize,
      totalItems,
      totalPages,
    };
  },
);

/**
 * Selector para obtener la lista de pedidos filtrados y paginados según los filtros activos aplicados y la configuración de paginación actual.
 * Utiliza createSelector para combinar la lista de pedidos filtrados y la información de paginación, y aplicar la lógica de paginación en función de la página actual y el tamaño de página definidos en la configuración de paginación.
 * Retorna una nueva lista de pedidos que cumplen con los criterios de filtrado y que corresponden a la página actual definida en la configuración de paginación.
 * Esto permite a los componentes obtener una lista de pedidos que se ajusta a los filtros aplicados por el usuario y que está paginada según la configuración actual, sin necesidad de realizar la lógica de filtrado y paginación en los componentes mismos.
 * @returns Order[] - Una lista de pedidos que cumplen con los criterios de filtrado definidos en los filtros activos y que corresponden a la página actual definida en la configuración de paginación.
 */
export const selectPagedFilteredOrders = createSelector(
  selectFilteredOrders,
  selectPagination,
  (filteredOrders, pagination) => {
    const start = (pagination.page - 1) * pagination.pageSize;
    return filteredOrders.slice(start, start + pagination.pageSize);
  },
);

/**
 * Selector para obtener un Map que agrupa los pedidos filtrados por su estado.
 * Utiliza createSelector para combinar la lista de pedidos filtrados y aplicar la lógica de agrupación
 * en función del estado de cada pedido.
 * Retorna un Map donde las claves son los estados de los pedidos (OrderStatus) y los valores son
 * arrays de pedidos que corresponden a cada estado.
 * @returns Map<OrderStatus, Order[]> - Un Map que agrupa los pedidos filtrados por su estado.
 */
export const selectOrdersByStatus = createSelector(
  selectFilteredOrders,
  (orders): Map<OrderStatus, Order[]> => {
    const map = new Map<OrderStatus, Order[]>();
    for (const order of orders) {
      const arr = map.get(order.status) ?? [];
      arr.push(order);
      map.set(order.status, arr);
    }
    return map;
  },
);

/**
 * Selector para calcular el total de ingresos a partir de la lista de pedidos filtrados.
 * Utiliza createSelector para combinar la lista de pedidos filtrados y aplicar la lógica de cálculo del total de ingresos sumando el total de cada pedido.
 * Retorna un número que representa el total de ingresos calculado a partir de los pedidos filtrados.
 * Esto permite a los componentes obtener una métrica clave, como el total de ingresos, basada en los pedidos que cumplen con los filtros aplicados por el usuario, sin necesidad de realizar la lógica de cálculo en los componentes mismos.
 * @returns number - El total de ingresos calculado a partir de los pedidos filtrados.
 */
export const selectTotalRevenue = createSelector(
  selectFilteredOrders,
  (orders) => orders.reduce((sum, o) => sum + o.total, 0),
);

/**
 * Selector para obtener el total de páginas disponibles.
 * Delega en selectPagination, que ya calcula totalPages a partir de los pedidos filtrados
 * y el pageSize. Evita duplicar la lógica de cálculo.
 */
export const selectTotalPages = createSelector(
  selectPagination,
  (pagination) => pagination.totalPages,
);

/**
 * Selector factory para obtener un pedido específico por su ID.
 * Retorna un selector parametrizado que busca en la lista de pedidos el que coincida con el ID dado.
 * Útil para operaciones que necesitan leer el estado actual de un pedido antes de modificarlo
 * (por ejemplo, optimistic updates con rollback).
 * @param id - El ID del pedido a buscar.
 * @returns Un selector que emite el pedido encontrado o undefined si no existe.
 */
export const selectOrderById = (id: string) =>
  createSelector(selectAllOrders, (orders) => orders.find((o) => o.id === id));
