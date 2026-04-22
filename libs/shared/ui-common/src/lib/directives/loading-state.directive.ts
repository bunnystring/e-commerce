import {
  AfterViewInit,
  Directive,
  ElementRef,
  Renderer2,
  effect,
  inject,
  input,
} from '@angular/core';

/**
 * LoadingStateDirective
 * Muestra un spinner y deshabilita el botón cuando appLoadingState=true.
 * Restaura el texto original cuando appLoadingState=false.
 *
 * Uso:
 *   <button [appLoadingState]="isSubmitting" originalText="Guardar">
 *     Guardar
 *   </button>
 *
 * @author Arlez Camilo Ceron Herrera
 */
@Directive({
  selector: '[appLoadingState]',
  standalone: true,
})
export class LoadingStateDirective implements AfterViewInit {
  // Input principal que controla el estado de carga. Cuando es true, el botón muestra un spinner y se deshabilita.
  readonly loading = input.required<boolean>({ alias: 'appLoadingState' });
  readonly originalText = input<string | undefined>(undefined);
  readonly loadingText = input<string | undefined>(undefined);

  // ElementRef y Renderer2 para manipular el DOM del host de manera segura.
  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private renderer = inject(Renderer2);

  // Variables para almacenar el texto original del host y controlar cuándo la vista está lista.
  private capturedText = '';
  private viewReady = false;


  constructor() {

    /**
     * Efecto reactivo que se ejecuta cada vez que cambia el valor de `loading`.
     * Si la vista aún no está lista, no hace nada. Una vez que la vista está lista,
     * aplica el estado de carga al host (mostrar spinner y deshabilitar) o restaurar el estado normal.
     */
    effect(() => {
      const isLoading = this.loading();
      if (!this.viewReady) return;
      this.applyState(isLoading);
    });
  }

  /**
   * Después de que la vista está inicializada, capturamos el texto original del host
   * para poder restaurarlo luego. Luego aplicamos el estado inicial basado en el valor de loading.
   * Es importante esperar a AfterViewInit para asegurar que el contenido del host ya está renderizado
   * y podemos capturar su texto correctamente.
   */
  ngAfterViewInit(): void {
    this.capturedText = (this.el.nativeElement.textContent ?? '').trim();
    this.viewReady = true;
    this.applyState(this.loading());
  }

  /**
   * Aplica el estado de carga al host. Si isLoading es true, deshabilita el botón, agrega atributos ARIA,
   * añade una clase CSS para estilos, y reemplaza el contenido con un spinner y texto de carga.
   * Si isLoading es false, restaura el estado normal del botón y su texto original.
   * @param host El elemento host al que se aplica la directiva.
   * @param isLoading Indica si el estado de carga está activo.
   */
  private applyState(isLoading: boolean): void {
    const host = this.el.nativeElement;

    if (isLoading) {
      this.renderer.setProperty(host, 'disabled', true);
      this.renderer.setAttribute(host, 'aria-busy', 'true');
      this.renderer.addClass(host, 'is-loading');
      this.renderSpinner(host);
    } else {
      this.renderer.setProperty(host, 'disabled', false);
      this.renderer.removeAttribute(host, 'aria-busy');
      this.renderer.removeClass(host, 'is-loading');
      this.restoreText(host);
    }
  }

  /**
   * Reemplaza el contenido del host con un spinner CSS y un texto de carga opcional.
   * El spinner es un elemento <span> con estilos para mostrar una animación de giro.
   * Si se proporciona loadingText, se muestra a la derecha del spinner.
   * @param host El elemento host al que se aplica la directiva.
   */
  private renderSpinner(host: HTMLElement): void {
    while (host.firstChild) {
      this.renderer.removeChild(host, host.firstChild);
    }

    const spinner = this.renderer.createElement('span');
    this.renderer.addClass(spinner, 'app-loading-spinner');
    this.renderer.setAttribute(spinner, 'aria-hidden', 'true');
    this.renderer.setStyle(spinner, 'display', 'inline-block');
    this.renderer.setStyle(spinner, 'width', '1em');
    this.renderer.setStyle(spinner, 'height', '1em');
    this.renderer.setStyle(spinner, 'border', '2px solid currentColor');
    this.renderer.setStyle(spinner, 'border-right-color', 'transparent');
    this.renderer.setStyle(spinner, 'border-radius', '50%');
    this.renderer.setStyle(spinner, 'animation', 'app-spin 0.7s linear infinite');
    this.renderer.setStyle(spinner, 'vertical-align', 'middle');
    this.renderer.setStyle(
      spinner,
      'margin-right',
      this.loadingText() ? '0.5em' : '0',
    );

    this.renderer.appendChild(host, spinner);

    const label = this.loadingText();
    if (label) {
      const textNode = this.renderer.createText(label);
      this.renderer.appendChild(host, textNode);
    }

    this.ensureKeyframes();
  }

  /**
   * Restaura el contenido original del host. Si se proporcionó un originalText, se usa ese valor.
   * De lo contrario, se usa el texto capturado inicialmente al cargar la vista. Si no hay texto para mostrar, no hace nada.
   * @param host El elemento host al que se aplica la directiva.
   * @returns
   */
  private restoreText(host: HTMLElement): void {
    const textToShow = this.originalText() ?? this.capturedText ?? '';

    if (!textToShow) return;

    while (host.firstChild) {
      this.renderer.removeChild(host, host.firstChild);
    }

    const textNode = this.renderer.createText(textToShow);
    this.renderer.appendChild(host, textNode);
  }

  /**
   * Asegura que las keyframes para la animación del spinner estén definidas en el documento.
   * Si ya existen, no hace nada. Si no existen, crea un elemento <style> con las keyframes necesarias
   * para la animación de giro del spinner y lo añade al <head> del documento.
   * @returns
   */
  private ensureKeyframes(): void {
    const STYLE_ID = 'app-loading-state-keyframes';
    if (document.getElementById(STYLE_ID)) return;

    const style = this.renderer.createElement('style');
    this.renderer.setAttribute(style, 'id', STYLE_ID);
    const css = this.renderer.createText(
      '@keyframes app-spin { to { transform: rotate(360deg); } }',
    );
    this.renderer.appendChild(style, css);
    this.renderer.appendChild(document.head, style);
  }
}
