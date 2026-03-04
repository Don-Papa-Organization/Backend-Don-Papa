# Módulo de Estadísticas (Analytics)

Este módulo proporciona un dashboard completo de análisis y estadísticas para administradores del sistema. Integra datos de ventas, inventario, usuarios y ocupación del restaurante.

## Características

- **Dashboard Centralizado**: Vista unificada de todas las métricas clave
- **Filtros Dinámicos**: Filtrar por rango de fechas y límite de registros
- **Estado Gestionado**: Arquitectura Facade con gestión de estado centralizada
- **Manejo de Errores**: Errores por endpoint sin cascadas
- **Exportación**: Descargar datos en PDF y JSON
- **Control de Acceso**: Solo administradores pueden acceder

## Estructura de Carpetas

```
src/app/
├── domain/statistics/
│   ├── dtos/
│   │   ├── analytics.dto.ts      # Interfaces de transferencia de datos
│   │   └── index.ts              # Barrel export
│   └── models/
│       └── index.ts              # Modelos de negocio
├── features/admin/pages/statistics/
│   ├── components/               # Componentes específicos (futuro)
│   ├── services/
│   │   ├── statistics.facade.ts  # Lógica centralizada
│   │   └── statistics.guard.ts   # Guard de autorización
│   ├── statistics.component.ts   # Componente principal
│   ├── statistics.component.html # Template
│   ├── statistics.component.scss # Estilos
│   ├── statistics.module.ts      # Módulo
│   ├── statistics-routing.module.ts # Rutas
│   └── index.ts                  # Barrel export
├── services/apis/
│   └── statistics.api.ts         # Llamadas HTTP
└── shared/
    ├── ui/
    │   ├── ui-chart/             # Wrapper para gráficos
    │   ├── metric-card/          # Tarjeta de métrica
    │   └── data-table/           # Tabla de datos
    └── pipes/
        └── format-table-value.pipe.ts # Pipe de formato
```

## DTOs Principales

### AnalyticsFilterDto
```typescript
interface AnalyticsFilterDto {
  startDate: string;  // YYYY-MM-DD
  endDate: string;    // YYYY-MM-DD
  limit?: number;     // Para top 10 products
}
```

### DashboardStateDto
Contiene todo el estado del dashboard:
- `salesSummary`: Resumen de ventas
- `salesTimeline`: Timeline de ventas diarias
- `topProducts`: Top 10 productos
- `deadStock`: Productos sin movimiento
- `categoryStock`: Inventario por categoría
- `userGrowth`: Crecimiento de usuarios
- `frequentUsers`: Usuarios frecuentes
- `occupancy`: Datos de ocupación (horas pico, no-show)
- `promotions`: Efectividad de promociones
- `loadingState`: Estados de carga por sección
- `errorState`: Errores por sección
- `filters`: Filtros actuales

## Servicios

### StatisticsFacade
Orquesta la carga de datos y maneja el estado centralizado.

**Métodos principales:**
- `loadDashboard(filters)`: Carga todos los endpoints en paralelo
- `loadSection(section, filters)`: Carga una sección específica
- `getDashboardState()`: Observable del estado
- `downloadPDF(filters)`: Descargar PDF
- `downloadJSON(filters)`: Descargar JSON
- `reset()`: Reiniciar estado

**Ejemplo de uso:**
```typescript
export class StatisticsComponent implements OnInit {
  dashboardState$ = this.facade.getDashboardState();

  constructor(private facade: StatisticsFacade) {}

  ngOnInit() {
    const filters: AnalyticsFilterDto = {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      limit: 10
    };
    this.facade.loadDashboard(filters).subscribe();
  }
}
```

### StatisticsApi
Servicio HTTP que comunica con el microservicio MS6.

**Métodos:**
- `getSalesSummary(filters)`
- `getSalesTimeline(filters)`
- `getTopProducts(filters)`
- `getDeadStock(filters)`
- `getInventoryByCategory(filters)`
- `getUserGrowth(filters)`
- `getFrequentUsers(filters)`
- `getPeakHours(filters)`
- `getNoShowRate(filters)`
- `getPromotionEffectiveness(filters)`
- `exportPDF(filters)`
- `exportJSON(filters)`

### StatisticsGuard
Guard que verifica:
1. Usuario está autenticado
2. Usuario tiene rol de administrador

## Endpoints MS6 Integrados

Todos los endpoints están configurados en `api.config.ts`:

```
GET  /analytics/sales/summary           → SalesSummaryResponseDto
GET  /analytics/sales/timeline          → SalesTimelineItemDto[]
GET  /analytics/products/top            → TopProductDto[]
GET  /analytics/products/dead-stock     → DeadStockDto[]
GET  /analytics/inventory/by-category   → CategoryStockDto[]
GET  /analytics/users/growth            → UserGrowthResponseDto
GET  /analytics/users/frequent          → FrequentUserDto[]
GET  /analytics/occupancy/peak-hours    → OccupancyResponseDto
GET  /analytics/occupancy/no-show       → OccupancyResponseDto
GET  /analytics/promotions/effectiveness → PromotionEffectivenessResponseDto
GET  /export/pdf                        → Blob (PDF)
GET  /export/data                       → JSON
```

## Manejo de Errores

Cada endpoint tiene su propio manejo de errores:

```typescript
private loadSalesData(filters: AnalyticsFilterDto) {
  return this.api.getSalesSummary(filters).pipe(
    tap(response => this.setSalesSummary(response.data)),
    catchError(error => {
      const message = this.getErrorMessage(error);
      this.setError('salesSummary', message);
      return of(null);  // Continúa sin fallar
    })
  );
}
```

Esto permite que si un endpoint falla, los demás sigan cargándose normalmente.

## Uso en el Template

### Acceso a estado
```html
<div *ngIf="dashboardState$ | async as state">
  <!-- Acceder a datos -->
  <p>Total Ventas: {{ state.salesSummary?.totalVentas | currency }}</p>
  
  <!-- Mostrar loading -->
  <div *ngIf="state.loadingState['salesSummary']">Cargando...</div>
  
  <!-- Mostrar error -->
  <div *ngIf="state.errorState['salesSummary']">
    {{ state.errorState['salesSummary'] }}
  </div>
</div>
```

### Componentes Reutilizables

**MetricCard:**
```html
<app-metric-card
  label="Total de Ventas"
  [value]="state.salesSummary?.totalVentas | currency"
  [isLoading]="state.loadingState['salesSummary']"
/>
```

**DataTable:**
```html
<app-data-table
  [columns]="['nombre', 'cantidad', 'fecha']"
  [data]="state.topProducts"
  [isLoading]="state.loadingState['topProducts']"
  [hasError]="!!state.errorState['topProducts']"
/>
```

## Próximos Pasos

1. **Instalación de dependencias**
   ```bash
   npm install chart.js ng2-charts
   ```

2. **Integración con Rutas Principales**
   - Agregar lazy loading en `pages-routing.module.ts`
   ```typescript
   {
     path: 'statistics',
     loadChildren: () => import('./statistics/statistics.module').then(m => m.StatisticsModule),
     canActivate: [StatisticsGuard]
   }
   ```

3. **Crear Componentes de Gráficos**
   - SalesChartComponent (timeline)
   - CategoryChartComponent (pie chart)
   - GrowthChartComponent (line chart)
   - etc.

4. **Implementar Filtros Avanzados**
   - Guardar preferencias en localStorage
   - Filtros por categoría
   - Exportación con filtros aplicados

## Configuración en Environment

El módulo usa la URL base del API Gateway desde `environment.ts`:

```typescript
// environment.ts
export const environment = {
  apiGatewayUrl: 'http://localhost:3000/api',  // Gateway URL
  // ...
};
```

## Testing

Crear tests para:
- `statistics.facade.spec.ts` - Tests de lógica
- `statistics.api.spec.ts` - Tests de HTTP
- `statistics.guard.spec.ts` - Tests de seguridad
- `statistics.component.spec.ts` - Tests de presentación

## Performance

- **Lazy Loading**: El módulo se carga bajo demanda
- **forkJoin**: Todos los endpoints se cargan en paralelo
- **Error Handling**: Fallos no bloquean otros datos
- **Pipes Puros**: Los pipes de formato son puros para optimizar CD
- **OnPush**: Usar ChangeDetectionStrategy.OnPush en componentes

## Seguridad

- **Guard**: Solo administradores pueden acceder
- **JWT**: Tokens incluidos en headers por HttpInterceptor
- **CORS**: Configurado en el API Gateway
- **Rate Limiting**: Implementado en MS6
