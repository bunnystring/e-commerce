import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * PermissionsService
 * Servicio centralizado para el manejo de permisos del usuario actual.
 * Expone un Observable con el Set de permisos activos y métodos para consultarlos.
 * La directiva `appHasPermission` y cualquier guard o componente pueden suscribirse
 * para reaccionar automáticamente a cambios de permisos (por ejemplo, al hacer login,
 * al cambiar de rol o al refrescar la sesión).
 * @version 1.0.0
 * @author Arlez Camilo Ceron Herrera
 */
@Injectable({ providedIn: 'root' })
export class PermissionsService {

  /**
   * Fuente interna mutable con el conjunto de permisos activos.
   * Se usa un Set para garantizar unicidad y hacer lookups O(1) con has().
   */
  private readonly permissionsSubject = new BehaviorSubject<Set<string>>(new Set());

    /**
   * Observable público con los permisos activos.
   * La directiva HasPermission y otros consumidores se suscriben para reaccionar
   * automáticamente cuando el conjunto de permisos cambia.
   */
  readonly permissions$: Observable<Set<string>> = this.permissionsSubject.asObservable();


   /**
   * Reemplaza el conjunto completo de permisos del usuario.
   * Se llama típicamente al hacer login, al recibir el perfil del usuario,
   * o al cambiar de rol (útil en demos de la directiva).
   * @param permissions - Array de strings con los permisos que tendrá el usuario.
   */
  setPermissions(permissions: string[]): void {
    this.permissionsSubject.next(new Set(permissions));
  }

  /**
   * Limpia todos los permisos. Útil al cerrar sesión.
   */
  clearPermissions(): void {
    this.permissionsSubject.next(new Set());
  }

  /**
   * Consulta síncrona: ¿el usuario tiene al menos uno de los permisos requeridos?
   * @param required - Permiso individual o array de permisos. Si es array, se evalúa con OR.
   * @returns true si el usuario tiene alguno de los permisos requeridos.
   */
  hasAny(required: string | string[]): boolean {
    const list = Array.isArray(required) ? required : [required];
    if (list.length === 0) return true; // sin requerimientos → acceso libre
    const current = this.permissionsSubject.value;
    return list.some((perm) => current.has(perm));
  }
}
