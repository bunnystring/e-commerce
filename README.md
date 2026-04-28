# E-commerce Orders — Prueba Técnica

Aplicación de gestión de pedidos construida con **Angular 18+**, **NgRx** y **Signals**, organizada como **Nx monorepo** con librerías por feature. La idea fue demostrar un patrón híbrido moderno: NgRx como fuente de verdad para el estado, y Signals como capa de consumo en componentes con OnPush.

---

## Cómo correr el proyecto

### Prerrequisitos
- Node.js 18+
- npm o pnpm
- Nx CLI instalado globalmente (opcional): `npm i -g nx`

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npx nx serve <storefront>
```

La app estará disponible en `http://localhost:4200`.

### Build de producción
```bash
npx nx build <storefront> --configuration=production
```

### Tests
```bash
# Todos los tests
npx nx run-many --target=test --all

# Tests de una librería específica
npx nx test order-data-access
```

### Linter
```bash
npx nx run-many --target=lint --all
```

---

## Estructura de carpetas

apps/
└── <app-shell>/                    # Shell principal de la aplicación
libs/
├── order/
│   ├── data-access/                # Estado NgRx + Facade + servicios
│   │   └── src/lib/
│   │       ├── +state/
│   │       │   ├── orders.actions.ts
│   │       │   ├── orders.reducer.ts
│   │       │   ├── orders.effects.ts
│   │       │   ├── orders.selectors.ts
│   │       │   └── orders.facade.ts
│   │       ├── models/             # Order, OrderFilters, OrderError, etc.
│   │       └── services/           # MockOrdersService
│   │
│   ├── feature-list/               # OrderListComponent (lista + filtros)
│   ├── feature-creation/           # OrderCreationComponent (formulario)
│   └── ui-components/              # OrderStatusPipe y componentes presentacionales
│
├── shared-permissions/             # PermissionsService + HasPermissionDirective
└── shared-ui-common/               # LoadingStateDirective y utilidades de UI


**Convenciones:**
- `data-access` → estado, servicios y modelos. No tiene UI.
- `feature-*` → componentes "smart" que orquestan vistas (consumen el facade).
- `ui-components` / `shared-ui-*` → componentes "dumb", pipes y directivas reutilizables sin lógica de negocio.

---

## Diagrama de flujo de datos

Ejemplo: usuario navega a `/orders` y la lista se renderiza.

┌─────────────────┐
│   Usuario navega│
│    a /orders    │
└────────┬────────┘
│
▼
┌──────────────────────────┐
│ Angular lazy-loads       │
│ feature-list             │
└────────┬─────────────────┘
│
▼
┌──────────────────────────┐
│ OrderListComponent       │
│ (Standalone + OnPush)    │
└────────┬─────────────────┘
│ ngOnInit()
▼
┌──────────────────────────┐
│ OrdersFacade             │
│ .loadOrders()            │
└────────┬─────────────────┘
│ store.dispatch
▼
┌──────────────────────────┐
│ OrdersActions.loadOrders │
└────────┬─────────────────┘
│
▼
┌──────────────────────────────┐
│ OrdersEffects.loadOrders$    │
│  - intercepta la acción      │
│  - llama MockOrdersService   │
│  - emite Success/Failure     │
└────────┬─────────────────────┘
│
▼
┌──────────────────────────┐
│ Reducer actualiza        │
│ OrdersState (inmutable)  │
└────────┬─────────────────┘
│
▼
┌──────────────────────────┐
│ Selectores memoizados    │
│ recalculan derivados     │
│ (filteredOrders, etc.)   │
└────────┬─────────────────┘
│
▼
┌──────────────────────────┐
│ Facade expone via        │
│ store.selectSignal(...)  │
└────────┬─────────────────┘
│
▼
┌──────────────────────────┐
│ Componente lee la signal │
│ → UI se re-renderiza     │
│   gracias a OnPush       │
└──────────────────────────┘

---

## Decisiones arquitectónicas

### 1. Patrón híbrido NgRx + Signals

NgRx sigue siendo la fuente de verdad: acciones, effects, reducers y selectores no cambian. Lo que cambia es **cómo se consumen los selectores**: en lugar de exponerlos como `Observable` y convertir en cada componente con `toSignal`, el `OrdersFacade` los expone directamente como signals usando `store.selectSignal(...)`.

```ts
// En el facade
orders = this.store.selectSignal(OrdersSelectors.selectPagedFilteredOrders);

// En el componente
orders = this.facade.orders;  
```

**Ventajas:**
- Un solo punto de conversión observable → signal.
- Los componentes son más limpios
- Mantenemos toda la robustez de NgRx (devtools).

