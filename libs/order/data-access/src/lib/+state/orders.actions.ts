import { createAction, props } from '@ngrx/store';
import { Order } from '../models/order.model';
import { OrderFilters } from '../models/order-filters.model';
import { CreateOrderDto } from '../models/create-order.dto';
import { OrderError } from '../models/order-error.model';

/**
 * Orders Actions
 * Definimos las acciones para la gestión de pedidos en la aplicación.
 * Incluye acciones para cargar pedidos, crear nuevos pedidos, actualizar filtros y seleccionar un pedido.
 * Cada acción tiene una versión de éxito y fracaso para manejar los resultados de las operaciones asíncronas.
 * @version 1.0.0
 * @author Arlez Camilo Ceron Herrera
 */

/**
 * Acción para iniciar la carga de pedidos desde la API.
 * Acepta un objeto de filtros opcional que, si se proporciona, se aplicará a los filtros activos
 * antes de iniciar la carga (útil para cargar la lista ya filtrada desde una URL, un deep link, etc.).
 */
export const loadOrders = createAction(
  '[Orders API] Load Orders',
  props<{ filters?: OrderFilters }>(),
);

/**
 * Acción para indicar que la carga de pedidos fue exitosa.
 * Se emite con la lista de pedidos obtenida de la API.
 */
export const loadOrdersSuccess = createAction(
  '[Orders API] Load Orders Success',
  props<{ orders: Order[] }>(),
);

/**
 * Acción para indicar que la carga de pedidos falló.
 * Se emite con un mensaje de error.
 */
export const loadOrdersFailure = createAction(
  '[Orders API] Load Orders Failure',
  props<{ error: OrderError }>(),
);

/**
 * Acción para cargar un pedido específico por su ID.
 * Se emite con el ID del pedido a cargar.
 */
export const loadOrderById = createAction(
  '[Orders API] Load Order By Id',
  props<{ id: string }>(),
);

/**
 * Acción para indicar que la carga de un pedido específico fue exitosa.
 * Se emite con el pedido obtenido.
 */
export const loadOrderByIdSuccess = createAction(
  '[Orders API] Load Order By Id Success',
  props<{ order: Order }>(),
);

/**
 * Acción para indicar que la carga de un pedido específico falló.
 * Se emite con un mensaje de error.
 */
export const loadOrderByIdFailure = createAction(
  '[Orders API] Load Order By Id Failure',
  props<{ error: OrderError }>(),
);

/**
 * Acción para crear un nuevo pedido.
 * Se emite con los datos del pedido a crear.
 */
export const createOrder = createAction(
  '[Orders] Create Order',
  props<{ order: CreateOrderDto }>(),
);

/**
 * Acción para indicar que la creación de un pedido fue exitosa.
 * Se emite con el pedido creado, incluyendo su ID generado.
 */
export const createOrderSuccess = createAction(
  '[Orders API] Create Order Success',
  props<{ order: Order }>(),
);

/**
 * Acción para indicar que la creación de un pedido falló.
 * Se emite con un mensaje de error.
 */
export const createOrderFailure = createAction(
  '[Orders API] Create Order Failure',
  props<{ error: OrderError }>(),
);

/**
 * Acción para actualizar los filtros de búsqueda de pedidos.
 * Se emite con los filtros actualizados, que pueden ser parciales.
 */
export const updateFilters = createAction(
  '[Orders] Update Filters',
  props<{ filters: Partial<OrderFilters> }>(),
);

/**
 * Acción para limpiar los filtros de búsqueda de pedidos.
 * No se emite con ningún payload, ya que simplemente restablece los filtros a su estado inicial.
 */
export const clearFilters = createAction('[Orders] Clear Filters');

/**
 * Acción para seleccionar un pedido específico.
 * Se emite con el ID del pedido seleccionado, o null para deseleccionar.
 */
export const selectOrder = createAction(
  '[Orders] Select Order',
  props<{ order: Order | null }>(),
);

/**
 * Acción para actualizar el estado de un pedido específico.
 * Se emite con el ID del pedido y el nuevo estado.
 */
export const updateOrderStatus = createAction(
  '[Orders API] Update Order Status',
  props<{ id: string; status: Order['status'] }>(),
);

/**
 * Acción para indicar que la actualización del estado de un pedido fue exitosa.
 * Se emite con el pedido actualizado, incluyendo su nuevo estado.
 */
export const updateOrderStatusSuccess = createAction(
  '[Orders API] Update Order Status Success',
  props<{ order: Order }>(),
);

/**
 * Acción para indicar que la actualización del estado de un pedido falló.
 * Se emite con el ID del pedido, el estado anterior (para revertir cambios si es necesario) y un mensaje de error.
 */
export const updateOrderStatusFailure = createAction(
  '[Orders API] Update Order Status Failure',
  props<{
    id: string;
    prevStatus: Order['status'] | undefined;
    error: OrderError;
  }>(),
);

/**
 * Acción para realizar una actualización masiva del estado de varios pedidos.
 * Se emite con los IDs de los pedidos a actualizar y el nuevo estado a aplicar.
 */
export const bulkUpdateStatus = createAction(
  '[Orders API] Bulk Update Status',
  props<{ ids: string[]; status: Order['status'] }>(),
);

/**
 * Acción para indicar que la actualización masiva del estado de pedidos fue exitosa.
 * Se emite con la lista de pedidos actualizados, incluyendo sus nuevos estados.
 */
export const bulkUpdateStatusSuccess = createAction(
  '[Orders API] Bulk Update Status Success',
  props<{ orders: Order[] }>(),
);

/**
 * Acción para indicar que la actualización masiva del estado de pedidos falló.
 * Se emite con los IDs de los pedidos que se intentaron actualizar y un mensaje de error.
 */
export const bulkUpdateStatusFailure = createAction(
  '[Orders API] Bulk Update Status Failure',
  props<{
    ids: string[];
    prevStatuses: Record<string, Order['status']>;
    error: OrderError;
  }>(),
);

/**
 * Acción para cambiar la página actual en la paginación de la lista de pedidos.
 * Se emite con el número de página al que se desea cambiar.
 */
export const changePage = createAction(
  '[Orders] Change Page',
  props<{ page: number }>(),
);

/**
 * Acción para aplicar el optimistic update del estado de un pedido.
 * Se dispara desde el effect DESPUÉS de capturar el prevStatus del store,
 * para garantizar que el rollback en caso de error tenga el valor correcto.
 */
export const applyOptimisticStatus = createAction(
  '[Orders] Apply Optimistic Status',
  props<{ id: string; status: Order['status']; prevStatus: Order['status'] }>(),
);

/**
 * Acción para aplicar el optimistic update masivo de estados.
 * Se dispara desde el effect DESPUÉS de capturar los prevStatuses de cada pedido del store,
 * para garantizar que el rollback en caso de error pueda revertir cada pedido a su estado original.
 */
export const applyOptimisticBulkStatus = createAction(
  '[Orders] Apply Optimistic Bulk Status',
  props<{
    ids: string[];
    status: Order['status'];
    prevStatuses: Record<string, Order['status']>;
  }>(),
);

/**
 * Acción para limpiar el error actual del estado de pedidos.
 * Se despacha automáticamente desde un effect 3 segundos después de cualquier
 * action de failure, para que el mensaje de error desaparezca de la UI sin
 * requerir interacción del usuario.
 */
export const clearError = createAction('[Orders] Clear Error');
