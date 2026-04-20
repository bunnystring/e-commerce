import { Pipe, PipeTransform } from '@angular/core';
import { inject } from '@angular/core';
import { OrderStatus } from '@e-commerce/order/data-access';

// Abstracción para servicio de traducción
export abstract class OrderStatusI18n {
  abstract get(key: string): string;
}

// Dummy para uso y test locales
export class DummyOrderStatusI18n implements OrderStatusI18n {
  private translations: Record<string, string> = {
    [OrderStatus.DRAFT]: 'Borrador',
    [OrderStatus.PENDING]: 'Pendiente',
    [OrderStatus.CONFIRMED]: 'Confirmado',
    [OrderStatus.PROCESSING]: 'Procesando',
    [OrderStatus.SHIPPED]: 'Enviado',
    [OrderStatus.DELIVERED]: 'Entregado',
    [OrderStatus.CANCELLED]: 'Cancelado',
    [OrderStatus.REFUNDED]: 'Reembolsado',
  };
  get(key: string): string {
    return this.translations[key] ?? key;
  }
}

const STATUS_CONFIG: Record<OrderStatus, { short: string; color: string }> = {
  [OrderStatus.DRAFT]:      { short: 'DRF',  color: '#bdbdbd' },
  [OrderStatus.PENDING]:    { short: 'PEN',  color: '#FFC107' },
  [OrderStatus.CONFIRMED]:  { short: 'CNF',  color: '#1976D2' },
  [OrderStatus.PROCESSING]: { short: 'PRC',  color: '#9C27B0' },
  [OrderStatus.SHIPPED]:    { short: 'SHP',  color: '#2196F3' },
  [OrderStatus.DELIVERED]:  { short: 'DLV',  color: '#4CAF50' },
  [OrderStatus.CANCELLED]:  { short: 'CNL',  color: '#F44336' },
  [OrderStatus.REFUNDED]:   { short: 'REF',  color: '#8BC34A' },
};


@Pipe({
  name: 'orderStatus',
  standalone: true,
})
export class OrderStatusPipe implements PipeTransform {

  // Inyección del servicio de traducción
  private i18n = inject(OrderStatusI18n);

  /**
   *
   * @param value Valor del enum OrderStatus.
   * @param mode 'label' (por defecto), 'short', 'color'
   * @returns Label traducida, short code o color según mode.
   */
  transform(
    value: OrderStatus | null | undefined,
    mode: 'label' | 'short' | 'color' = 'label'
  ): string {
    if (!value || !STATUS_CONFIG[value]) return '';
    switch (mode) {
      case 'label': return this.i18n.get(value);
      case 'short': return STATUS_CONFIG[value].short;
      case 'color': return STATUS_CONFIG[value].color;
      default: return '';
    }
  }
}
