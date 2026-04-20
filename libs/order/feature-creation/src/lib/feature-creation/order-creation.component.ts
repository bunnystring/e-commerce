import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { OrdersFacade } from '@e-commerce/order/data-access';
import {
  filter,
  pairwise,
  take,
  withLatestFrom,
  takeUntil,
} from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'lib-order-creation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-creation.component.html',
  styleUrl: './order-creation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderCreationComponent implements OnInit {
  private fb = inject(FormBuilder);
  public facade = inject(OrdersFacade);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  orderForm: FormGroup;

  constructor() {
    this.orderForm = this.fb.group({
      customerId: ['CUST-' + Date.now(), Validators.required],
      customerName: ['', Validators.required],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerPhone: ['', Validators.required],
      items: this.fb.array([this.createItem()]),
    });
  }

  /**
   * Metodo para navegar a la lista de pedidos después de crear un pedido exitosamente. Se suscribe a los cambios en el estado de carga y error del facade, y navega a la ruta '/orders' cuando se detecta que la acción de creación ha terminado sin errores.
   * Utiliza operadores de RxJS como pairwise, filter, withLatestFrom y takeUntil para gestionar la suscripción y evitar fugas de memoria.
   */
  ngOnInit() {
    this.facade.isLoadingAction$
      .pipe(
        pairwise(),
        filter(([prev, curr]) => prev && !curr),
        withLatestFrom(this.facade.error$),
        filter(([, error]) => !error),
        take(1),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.router.navigate(['/orders']));
  }

  /**
   * Metodo para limpiar la suscripción al observable isLoadingAction$ del facade cuando el componente se destruye. Esto es importante para evitar fugas de memoria y asegurar que no se sigan recibiendo actualizaciones después de que el componente haya sido destruido.
   * Utiliza el Subject destroy$ para emitir un valor y completar la suscripción, lo que garantiza que cualquier suscripción que utilice takeUntil(this.destroy$) se limpiará correctamente.
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Getter para acceder al FormArray de items en el formulario. Esto facilita la manipulación de los items en el formulario, como agregar o eliminar productos, y calcular totales. El FormArray permite manejar una lista dinámica de controles de formulario, lo que es ideal para la funcionalidad de agregar múltiples productos a un pedido.
   * @returns FormArray - El FormArray que contiene los controles de los items del pedido.
   */
  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  /**
   * Metodo para crear un nuevo FormGroup que representa un item del pedido. Cada item incluye campos para el ID del producto, nombre del producto, cantidad y precio unitario, con validaciones apropiadas para cada campo. Este método se utiliza para inicializar el formulario con un item por defecto y para agregar nuevos items al pedido.
   * @returns FormGroup - El FormGroup que representa un item del pedido.
   */
  createItem(): FormGroup {
    return this.fb.group({
      productId: ['PROD-' + Date.now(), Validators.required],
      productName: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
    });
  }

  /**
   * Metodo para agregar un nuevo item al pedido. Este método utiliza el método createItem() para crear un nuevo FormGroup para el item y lo agrega al FormArray de items en el formulario. Esto permite a los usuarios agregar múltiples productos a su pedido de manera dinámica.
   * No se permiten agregar items si el formulario actual no es válido, lo que asegura que los datos ingresados sean correctos antes de permitir la adición de nuevos items.
   */
  addItem() {
    this.items.push(this.createItem());
  }

  /**
   *
   * Metodo para eliminar un item del pedido. Este método elimina un FormGroup del FormArray de items en el formulario, permitiendo a los usuarios eliminar productos de su pedido de manera dinámica.
   * No se permite eliminar el último item del pedido, asegurando que siempre haya al menos un item en el formulario.
   * @param index - El índice del item a eliminar en el FormArray.
   */
  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  /**
   * Metodo para calcular el total de un item específico en el pedido. Este método toma el índice del item en el FormArray, accede a los valores de cantidad y precio unitario del item, y calcula el total multiplicando la cantidad por el precio unitario. Esto se utiliza para mostrar el total de cada item en la interfaz de usuario.
   * @param index - El índice del item en el FormArray.
   * @returns El total del item.
   */
  getItemTotal(index: number): number {
    const item = this.items.at(index).value;
    return item.quantity * item.unitPrice;
  }

  /**
   * Metodo para calcular el total general del pedido. Este método recorre todos los items en el FormArray, calcula el total de cada item utilizando la cantidad y el precio unitario, y suma estos totales para obtener el total general del pedido. Esto se utiliza para mostrar el total general en la interfaz de usuario.
   * @returns El total general del pedido.
   */
  getGrandTotal(): number {
    return this.items.controls.reduce((sum, item) => {
      const value = item.value;
      return sum + value.quantity * value.unitPrice;
    }, 0);
  }

  /**
   * Metodo para manejar la acción de envío del formulario. Este método verifica si el formulario es válido y, si lo es, llama al método createOrder del facade para crear un nuevo pedido con los datos del formulario. Si el formulario no es válido, se marca como tocado para mostrar los errores de validación en la interfaz de usuario. Esto asegura que los usuarios reciban retroalimentación inmediata sobre cualquier error en el formulario antes de intentar enviar los datos.
   * Si la creación del pedido es exitosa, el componente navegará automáticamente a la lista de pedidos gracias a la suscripción configurada en ngOnInit().
   * Si hay un error durante la creación del pedido, el componente no navegará y se mostrará el error en la interfaz de usuario, permitiendo a los usuarios corregir cualquier problema antes de intentar enviar nuevamente.
   */
  onSubmit() {
    if (this.orderForm.valid) {
      this.facade.createOrder(this.orderForm.value);
    } else {
      this.markFormGroupTouched(this.orderForm);
    }
  }

  /**
   * Metodo para manejar la acción de cancelación del formulario. Este método navega a la ruta '/orders', que se asume que es la lista de pedidos, permitiendo a los usuarios salir del proceso de creación de un pedido sin guardar ningún cambio. Esto proporciona una forma fácil para que los usuarios abandonen el formulario si deciden no crear un nuevo pedido o si accidentalmente accedieron a la página de creación.
   * Al navegar a la lista de pedidos, el componente de creación se destruirá, lo que también limpiará cualquier suscripción activa gracias al método ngOnDestroy(), asegurando que no haya fugas de memoria.
   * Este método no realiza ninguna validación ni guarda ningún dato, simplemente redirige al usuario a la lista de pedidos.
   */
  onCancel() {
    this.router.navigate(['/orders']);
  }

  /**
   * Metodo recursivo para marcar todos los controles de un FormGroup o FormArray como tocados. Esto se utiliza para mostrar los errores de validación en la interfaz de usuario cuando el formulario no es válido.
   * @param formGroup - El FormGroup o FormArray a marcar como tocado.
   */
  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
