import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, distinctUntilChanged } from 'rxjs';
import { PermissionsService } from './permissions.service';


/**
 * HasPermissionDirective
 * Directiva estructural que muestra u oculta un elemento del DOM según los permisos
 * del usuario actual. Soporta un permiso individual o un array de permisos (evaluados con OR).
 * Acepta además una cláusula `else` con un TemplateRef alternativo cuando no hay acceso.
 *
 * Reacciona automáticamente a dos fuentes de cambio:
 *   1. Cambios en el Input (permisos requeridos del host).
 *   2. Cambios en los permisos del usuario (vía PermissionsService.permissions$).
 *
 * Sintaxis soportada:
 *   <button *appHasPermission="'orders:update'">Editar</button>
 *   <button *appHasPermission="['orders:delete', 'admin']; else noAccess">Eliminar</button>
 *   <ng-template #noAccess>Sin permisos</ng-template>
 *
 * @version 1.0.0
 * @author Arlez Camilo Ceron Herrera
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  
  // TemplateRef y ViewContainerRef para manipular la vista del host de manera estructural.
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly permissionsService = inject(PermissionsService);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Stream interno con los permisos requeridos del host.
   * Se actualiza cada vez que cambia el Input `appHasPermission`.
   * Usamos un BehaviorSubject para poder combinarlo reactivamente con los permisos del usuario.
   */
  private readonly required$ = new BehaviorSubject<string[]>([]);

  /**
   * TemplateRef alternativo que se renderiza cuando el usuario NO tiene los permisos requeridos.
   * Se recibe vía la cláusula `else` del microsyntax:
   *   *appHasPermission="'x'; else noAccess"
   * Angular mapea automáticamente el input `appHasPermissionElse` al identificador que sigue al `else`.
   */
  private elseTemplateRef: TemplateRef<unknown> | null = null;

  /**
   * Input principal. Acepta un permiso (string) o varios permisos (string[]).
   * Los arrays se evalúan con lógica OR: el usuario necesita tener al menos uno.
   */
  @Input({ required: true }) set appHasPermission(value: string | string[] | null | undefined) {
    const normalized = value == null ? [] : Array.isArray(value) ? value : [value];
    this.required$.next(normalized);
  }

  /**
   * Input para el template alternativo (else).
   */
  @Input() set appHasPermissionElse(ref: TemplateRef<unknown> | null) {
    this.elseTemplateRef = ref;
    // Forzamos una re-evaluación emitiendo el valor actual del required$.
    // Esto asegura que si el else cambia en vivo, la vista se re-renderiza correctamente.
    this.required$.next(this.required$.value);
  }

  constructor() {
    combineLatest([this.required$, this.permissionsService.permissions$])
      .pipe(
        distinctUntilChanged(
          ([prevReq, prevPerms], [currReq, currPerms]) =>
            this.arraysEqual(prevReq, currReq) && this.setsEqual(prevPerms, currPerms),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(([required, userPermissions]) => {
        const hasAccess = this.checkAccess(required, userPermissions);
        this.render(hasAccess);
      });
  }

  /**
   * Evalúa si el usuario tiene al menos uno de los permisos requeridos (OR).
   * Si no hay permisos requeridos, se considera acceso libre.
   */
  private checkAccess(required: string[], userPermissions: Set<string>): boolean {
    if (required.length === 0) return true;
    return required.some((perm) => userPermissions.has(perm));
  }

  /**
   * Renderiza el template principal o el else, limpiando primero el ViewContainer
   * para evitar duplicación de vistas.
   */
  private render(hasAccess: boolean): void {
    this.viewContainer.clear();
    if (hasAccess) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else if (this.elseTemplateRef) {
      this.viewContainer.createEmbeddedView(this.elseTemplateRef);
    }
  }

  /**
   * Compara dos arrays de strings para determinar si son iguales (mismo orden y mismos elementos).
   * @param a Primer array a comparar.
   * @param b Segundo array a comparar.
   * @returns true si ambos arrays son iguales, false en caso contrario.
   */
  private arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => val === b[idx]);
  }

  /**
   * Compara dos sets de strings para determinar si son iguales (mismo tamaño y mismos elementos).
   * @param a Primer conjunto a comparar.
   * @param b Segundo conjunto a comparar.
   * @returns true si ambos conjuntos son iguales, false en caso contrario.
   */
  private setsEqual(a: Set<string>, b: Set<string>): boolean {
    if (a.size !== b.size) return false;
    for (const val of a) {
      if (!b.has(val)) return false;
    }
    return true;
  }
}
