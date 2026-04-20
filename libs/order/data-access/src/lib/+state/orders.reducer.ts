import { createReducer, on } from '@ngrx/store';
import { Order } from '../models/order.model';
import { OrderFilters } from '../models/order-filters.model';
import * as OrdersActions from './orders.actions';
import { Pagination } from '../models/pagination.model';
import { OrderError } from '../models/order-error.model';

/**
 * Orders State
 * Definimos la estructura del estado para la gestión de pedidos en la aplicación.
 * Incluye la lista de pedidos, el ID del pedido seleccionado, los filtros aplicados, el estado de carga y cualquier error.
 * El estado inicial se establece con valores predeterminados para cada propiedad.
 */
export interface OrdersState {
  orders: Order[];
  selectedOrder: Order | null;
  filters: OrderFilters;
  pagination: Pagination;
  stats: { totalOrders: number; totalRevenue: number };
  loading: { list: boolean; detail: boolean; action: boolean };
  error: OrderError | null;
}

/**
 * Estado inicial para la gestión de pedidos.
 * Comienza con una lista vacía de pedidos, sin pedido seleccionado, sin filtros aplicados, no cargando y sin errores.
 */
export const initialState: OrdersState = {
  orders: [],
  selectedOrder: null,
  filters: {},
  pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
  stats: { totalOrders: 0, totalRevenue: 0 },
  loading: { list: false, detail: false, action: false },
  error: null,
};

/**
 * Orders Reducer
 * Definimos el reductor para manejar las acciones relacionadas con los pedidos.
 * Cada acción actualiza el estado de manera inmutable, asegurando que se mantenga la integridad del estado.
 * El reductor responde a acciones de carga de pedidos, creación de pedidos, actualización de filtros y selección de pedidos.
 * @version 1.0.0
 * @author Arlez Camilo Ceron Herrera
 */
export const ordersReducer = createReducer(
  initialState,

  /**
   * Manejo de la acción loadOrders para iniciar la carga de pedidos.
   * Actualiza el estado para indicar que se está cargando la lista de pedidos y limpia cualquier error previo.
   */
  on(OrdersActions.loadOrders, (state) => ({
    ...state,
    loading: { ...state.loading, list: true },
    error: null,
  })),

  /**
   * Manejo de la acción loadOrdersSuccess para indicar que la carga de pedidos fue exitosa.
   * Actualiza el estado con la lista de pedidos obtenida y establece el estado de carga de la lista en false.
   * También se podrían actualizar las estadísticas y la paginación si se incluyen en el payload de la acción.
   */
  on(OrdersActions.loadOrdersSuccess, (state, { orders }) => ({
    ...state,
    orders,
    loading: { ...state.loading, list: false }
  })),

  /**
   * Manejo de la acción loadOrdersFailure para indicar que la carga de pedidos falló.
   * Actualiza el estado para establecer el error recibido y establece el estado de carga de la lista en false.
   */
  on(OrdersActions.loadOrdersFailure, (state, { error }) => ({
    ...state,
    loading: { ...state.loading, list: false },
    error,
  })),

  /**
   * Manejo de la acción loadOrderById para iniciar la carga de un pedido específico por su ID.
   * Actualiza el estado para indicar que se está cargando el detalle del pedido y limpia cualquier error previo.
   */
  on(OrdersActions.loadOrderById, (state) => ({
    ...state,
    loading: { ...state.loading, detail: true },
    error: null,
  })),

  /**
   * Manejo de la acción loadOrderByIdSuccess para indicar que la carga de un pedido específico fue exitosa.
   * Actualiza el estado con el pedido obtenido y establece el estado de carga del detalle en false.
   */
  on(OrdersActions.loadOrderByIdSuccess, (state, { order }) => ({
    ...state,
    selectedOrder: order,
    loading: { ...state.loading, detail: false },
  })),

  /**
   * Manejo de la acción loadOrderByIdFailure para indicar que la carga de un pedido específico falló.
   * Actualiza el estado para establecer el error recibido y establece el estado de carga del detalle en false.
   */
  on(OrdersActions.loadOrderByIdFailure, (state, { error }) => ({
    ...state,
    loading: { ...state.loading, detail: false },
    error,
  })),

  /**
   * Manejo de la acción createOrder para iniciar la creación de un nuevo pedido.
   * Actualiza el estado para indicar que se está procesando una acción relacionada con pedidos y limpia cualquier error previo.
   */
  on(OrdersActions.createOrder, (state) => ({
    ...state,
    loading: { ...state.loading, action: true },
  })),

  /**
   * Manejo de la acción createOrderSuccess para indicar que la creación de un pedido fue exitosa.
   * Actualiza el estado agregando el nuevo pedido a la lista de pedidos y establece el estado de carga de acciones en false.
   * Esto permite que la nueva orden aparezca inmediatamente en la lista sin necesidad de recargar toda la lista de pedidos.
   */
  on(OrdersActions.createOrderSuccess, (state, { order }) => ({
    ...state,
    orders: [order, ...state.orders],
    loading: { ...state.loading, action: false },
  })),

  /**
   * Manejo de la acción createOrderFailure para indicar que la creación de un pedido falló.
   * Actualiza el estado para establecer el error recibido y establece el estado de carga de acciones en false.
   * Esto permite a los componentes mostrar un mensaje de error adecuado al usuario cuando la creación de un pedido no se pudo completar.
   */
  on(OrdersActions.createOrderFailure, (state, { error }) => ({
    ...state,
    loading: { ...state.loading, action: false },
    error,
  })),

  /**
   * Manejo de la acción updateFilters para actualizar los filtros aplicados a la lista de pedidos.
   * Actualiza el estado combinando los filtros existentes con los nuevos filtros proporcionados en la acción.
   * También restablece la página de paginación a 1 para mostrar los resultados filtrados desde el inicio.
   * Esto permite a los componentes actualizar los filtros de búsqueda y ver los resultados filtrados sin necesidad de recargar toda la lista de pedidos.
   */
  on(OrdersActions.updateFilters, (state, { filters }) => ({
    ...state,
    filters: { ...state.filters, ...filters },
    pagination: { ...state.pagination, page: 1 },
  })),

  /**
   * Manejo de la acción clearFilters para limpiar los filtros aplicados a la lista de pedidos.
   * Actualiza el estado restableciendo los filtros a un objeto vacío y restablece la página de paginación a 1.
   * Esto permite a los componentes eliminar todos los filtros aplicados y mostrar la lista completa de pedidos sin necesidad de recargar toda la lista.
   */
  on(OrdersActions.clearFilters, (state) => ({
    ...state,
    filters: {},
    pagination: { ...state.pagination, page: 1 },
  })),

  /**
   * Manejo de la acción changePage para cambiar la página actual en la paginación de la lista de pedidos.
   * Actualiza el estado estableciendo la página actual en la configuración de paginación según el número de página proporcionado en la acción.
   * Esto permite a los componentes cambiar la página de resultados mostrada sin necesidad de recargar toda la lista de pedidos, simplemente actualizando la página actual en el estado.
   * @param page - El número de página a cambiar, proporcionado en la acción changePage.
   */
  on(OrdersActions.changePage, (state, { page }) => ({
    ...state,
    pagination: { ...state.pagination, page },
  })),

  /**
   * Manejo de la acción selectOrder para seleccionar un pedido específico.
   * Actualiza el estado estableciendo el pedido seleccionado en la propiedad selectedOrder del estado.
   * Esto permite a los componentes mostrar los detalles del pedido seleccionado o realizar acciones específicas basadas en el pedido seleccionado sin necesidad de recargar toda la lista de pedidos.
   * @param order - El pedido a seleccionar, proporcionado en la acción selectOrder. Si se pasa null, se deseleccionará cualquier pedido seleccionado.
   */
  on(OrdersActions.selectOrder, (state, { order }) => ({
    ...state,
    selectedOrder: order,
  })),

  /**
   * Manejo de la acción updateOrderStatus para actualizar el estado de un pedido específico.
   * Actualiza el estado de manera optimista, cambiando el estado del pedido en la lista de pedidos antes de que se confirme la actualización en el backend.
   * Si la actualización es exitosa, se actualiza el pedido con los datos confirmados desde el backend. Si falla, se revierte el cambio al estado anterior y se establece el error.
   * Esto permite a los componentes mostrar una respuesta inmediata al usuario al cambiar el estado de un pedido, mejorando la experiencia del usuario, mientras que también maneja correctamente los casos de error para mantener la integridad del estado.
   * @param id - El ID del pedido a actualizar, proporcionado en la acción updateOrderStatus.
   * @param status - El nuevo estado a aplicar al pedido, proporcionado en la acción updateOrderStatus.
   */
  on(OrdersActions.updateOrderStatus, (state, { id, status }) => ({
    ...state,
    orders: state.orders.map(order =>
      order.id === id ? { ...order, status } : order
    ),
    loading: { ...state.loading, action: true },
    error: null,
  })),

  /**
   * Manejo de la acción updateOrderStatusSuccess para indicar que la actualización del estado de un pedido fue exitosa.
   * Actualiza el estado con el pedido actualizado confirmado desde el backend, asegurando que se reflejen los datos correctos del pedido después de la actualización.
   * También establece el estado de carga de acciones en false para indicar que la operación de actualización ha finalizado.
   * Esto permite a los componentes mostrar el estado actualizado del pedido después de una actualización exitosa, mejorando la experiencia del usuario al ver los cambios reflejados inmediatamente.
   * @param order - El pedido actualizado confirmado desde el backend, proporcionado en la acción updateOrderStatusSuccess.
   */
  on(OrdersActions.updateOrderStatusSuccess, (state, { order }) => ({
    ...state,
    orders: state.orders.map(o => (o.id === order.id ? order : o)),
    selectedOrder: state.selectedOrder?.id === order.id ? order : state.selectedOrder,
    loading: { ...state.loading, action: false },
  })),

  /**
   * Manejo de la acción updateOrderStatusFailure para indicar que la actualización del estado de un pedido falló.
   * Revertimos el cambio optimista al estado anterior del pedido utilizando el prevStatus proporcionado en la acción, y establecemos el error recibido.
   * También establece el estado de carga de acciones en false para indicar que la operación de actualización ha finalizado, incluso si fue con error.
   * Esto permite a los componentes manejar correctamente los casos de error al actualizar el estado de un pedido, asegurando que se mantenga la integridad del estado y que se muestre un mensaje de error adecuado al usuario.
   * @param id - El ID del pedido cuya actualización falló, proporcionado en la acción updateOrderStatusFailure.
   * @param prevStatus - El estado anterior del pedido antes de la actualización, proporcionado en la acción updateOrderStatusFailure, utilizado para revertir el cambio optimista.
   * @param error - El error recibido al intentar actualizar el estado del pedido, proporcionado en la acción updateOrderStatusFailure.
   */
  on(OrdersActions.updateOrderStatusFailure, (state, { id, prevStatus, error }) => ({
    ...state,
    orders: state.orders.map(order =>
      order.id === id ? { ...order, status: prevStatus } : order
    ),
    loading: { ...state.loading, action: false },
    error,
  })),

  /**
   * Manejo de la acción bulkUpdateStatus para realizar una actualización masiva del estado de varios pedidos.
   * Actualiza el estado de manera optimista, cambiando el estado de los pedidos seleccionados en la lista de pedidos antes de que se confirme la actualización en el backend.
   * Si la actualización es exitosa, se actualizan los pedidos con los datos confirmados desde el backend. Si falla, se revierte el cambio a los estados anteriores y se establece el error.
   * Esto permite a los componentes mostrar una respuesta inmediata al usuario al cambiar el estado de varios pedidos, mejorando la experiencia del usuario, mientras que también maneja correctamente los casos de error para mantener la integridad del estado.
   * @param ids - Los IDs de los pedidos a actualizar, proporcionados en la acción bulkUpdateStatus.
   * @param status - El nuevo estado a aplicar a los pedidos seleccionados, proporcionado en la acción bulkUpdateStatus.
   */
  on(OrdersActions.bulkUpdateStatus, (state, { ids, status }) => ({
    ...state,
    orders: state.orders.map(order =>
      ids.includes(order.id) ? { ...order, status } : order
    ),
    loading: { ...state.loading, action: true },
    error: null,
  })),

  /**
   * Manejo de la acción bulkUpdateStatusSuccess para indicar que la actualización masiva del estado de pedidos fue exitosa.
   * Actualiza el estado con la lista de pedidos actualizados confirmados desde el backend, asegurando que se reflejen los datos correctos de los pedidos después de la actualización masiva.
   * También establece el estado de carga de acciones en false para indicar que la operación de actualización masiva ha finalizado.
   * Esto permite a los componentes mostrar el estado actualizado de los pedidos después de una actualización masiva exitosa, mejorando la experiencia del usuario al ver los cambios reflejados inmediatamente.
   * @param orders - La lista de pedidos actualizados confirmados desde el backend, proporcionada en la acción bulkUpdateStatusSuccess.
   */
  on(OrdersActions.bulkUpdateStatusSuccess, (state, { orders }) => ({
    ...state,
    orders: state.orders.map(order => {
      const updated = orders.find(u => u.id === order.id);
      return updated ? updated : order;
    }),
    loading: { ...state.loading, action: false },
  })),

  /**
   * Manejo de la acción bulkUpdateStatusFailure para indicar que la actualización masiva del estado de pedidos falló.
   * Revertimos el cambio optimista a los estados anteriores de los pedidos utilizando los IDs proporcionados en la acción para identificar los pedidos afectados, y establecemos el error recibido.
   * También establece el estado de carga de acciones en false para indicar que la operación de actualización masiva ha finalizado, incluso si fue con error.
   * Esto permite a los componentes manejar correctamente los casos de error al realizar una actualización masiva del estado de pedidos, asegurando que se mantenga la integridad del estado y que se muestre un mensaje de error adecuado al usuario.
   * @param ids - Los IDs de los pedidos cuya actualización masiva falló, proporcionados en la acción bulkUpdateStatusFailure, utilizados para revertir el cambio optimista.
   * @param error - El error recibido al intentar realizar la actualización masiva del estado de pedidos, proporcionado en la acción bulkUpdateStatusFailure.
   */
  on(OrdersActions.bulkUpdateStatusFailure, (state, { ids, error }) => ({
    ...state,
    loading: { ...state.loading, action: false },
    error,
  }))
);
