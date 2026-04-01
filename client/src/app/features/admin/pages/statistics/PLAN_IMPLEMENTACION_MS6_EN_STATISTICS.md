# Plan detallado para implementar MS6 en admin/pages/statistics

## 1. Objetivo funcional

Implementar un dashboard de analitica administrativa en `admin/pages/statistics` que consuma el microservicio MS6 y presente:
- KPIs ejecutivos (cards)
- Graficas de tendencia
- Tablas resumidas para accion operativa

El enfoque es **frontend simple, util y mantenible**, con componentes de UI reutilizables en `shared/ui` y configuracion por `@Input()`.

## 2. Alcance tecnico

- Integrar endpoints de analytics ya expuestos por gateway/reportes.
- Estandarizar contratos de datos en DTOs + types.
- Consumir desde `StatisticsFacade` (sin migrar a NgRx para este modulo).
- Reusar y ampliar componentes de `shared/ui`.
- Crear componentes de apoyo para graficas y cards dentro de `shared/ui`.
- Mantener guards/rutas de admin funcionando para rol administrador.

## 3. Endpoints a implementar en frontend

- `GET /reports/analytics/sales/summary`
- `GET /reports/analytics/sales/timeline`
- `GET /reports/analytics/sales/weekly`
- `GET /reports/analytics/products/top`
- `GET /reports/analytics/products/dead-stock`
- `GET /reports/analytics/inventory/by-category`
- `GET /reports/analytics/users/growth`
- `GET /reports/analytics/users/frequent`
- `GET /reports/analytics/occupancy/peak-hours`
- `GET /reports/analytics/occupancy/no-show`
- `GET /reports/analytics/promotions/effectiveness`
- `GET /reports/export/pdf`
- `GET /reports/export/data`

## 4. Fases de implementacion

### Fase 0 - Preparacion

1. Confirmar que `StatisticsModule` declara todos los componentes usados en templates.
2. Validar que `SharedModule` exporta los componentes UI necesarios (cards, tabla, chart shell, botones).
3. Definir periodo por defecto (ultimos 30 dias).
4. Confirmar estrategia de refresco automatico (20s actual).

### Fase 1 - Contratos de datos

1. En `src/app/domain/statistics/dtos/analytics.dto.ts`:
   - Definir DTOs para respuestas compactas del backend:
     - `SalesTimelineResponseDto`
     - `WeeklySalesResponseDto`
     - `DeadStockResponseDto`
     - `CategoryStockResponseDto`
     - `FrequentUsersResponseDto`
     - `PromotionEffectivenessResponseDto` (con `topPromociones`)
2. En `src/app/types/`:
   - Crear tipos auxiliares de visualizacion (ej. `StatisticsChartSeries`).
3. Criterio de salida:
   - Ningun componente consume `any` para estadisticas principales.

### Fase 2 - API client

1. Actualizar `src/app/config/api.config.ts`:
   - Agregar `salesWeekly`, `inventoryLowStock`, `inventoryStock`.
2. Actualizar `src/app/services/apis/statistics.api.ts`:
   - Ajustar genericos de respuesta segun nuevos DTOs.
   - Exponer metodos para endpoints nuevos.
3. Criterio de salida:
   - Cada endpoint tiene un metodo typed y reutilizable.

### Fase 3 - Orquestacion de estado (Facade)

1. Extender `DashboardStateDto` y `StatisticsFacade` con:
   - `weeklySales`
   - `loadingState.weeklySales`
   - `errorState.weeklySales`
2. Cargar en paralelo con `forkJoin` y manejo de error por seccion.
3. Agregar normalizadores de respuesta para variaciones de payload (`data`, `puntos`, `serie`, `categorias`).
4. Criterio de salida:
   - Si falla una seccion, el resto del dashboard se muestra.

### Fase 4 - Integracion en admin/pages/statistics

1. `main-statistics.ts`:
   - Construir view-models de tabla y metricas.
   - Construir serie semanal para grafica de ventas.
2. `main-statistics.html`:
   - Pasar inputs al `sales-section` para grafica semanal.
   - Mantener filtro/descargas/refresh.
3. `sales-section`:
   - Incluir `app-statistics-chart` con `@Input() labels`, `@Input() data`.
4. `misc-metrics-section`:
   - Alinear columnas de usuarios frecuentes al nuevo formato temporal.
5. Criterio de salida:
   - Dashboard usable para decisiones diarias sin ruido de datos.

### Fase 5 - Shared UI (solo @Input())

> Regla: en componentes de presentacion reutilizables, la configuracion entra por `@Input()`; eventos hacia arriba solo donde sea estrictamente necesario.

1. Crear `shared/ui/ui-kpi-card`:
   - Inputs:
     - `title: string`
     - `value: string | number`
     - `subtitle?: string`
     - `trendLabel?: string`
     - `trendValue?: string | number`
     - `state: 'ok' | 'warning' | 'danger' | 'info'`
2. Crear `shared/ui/ui-analytics-panel`:
   - Inputs:
     - `title`
     - `loading`
     - `error`
     - `empty`
     - `emptyMessage`
3. Mejorar `shared/ui/ui-chart` para estandarizar chart wrapper:
   - Inputs:
     - `chartType`
     - `labels`
     - `datasets`
     - `height`
     - `loading`, `hasError`, `isEmpty`
     - `legendPosition`
4. Mejorar `shared/ui/ui-tabla` para casos de analytics:
   - Inputs:
     - `compact`
     - `stickyHeader`
     - `maxHeight`
5. Criterio de salida:
   - `admin/pages/statistics` consume UI compartida sin logica duplicada de presentacion.

### Fase 6 - Refactor gradual de secciones

1. Reemplazar bloques internos por shared/ui:
   - `statistics-metrics-grid` usa `ui-kpi-card`.
   - Secciones de tabla usan `ui-analytics-panel + ui-tabla`.
   - Graficas usan `ui-chart` como wrapper unico.
2. Mantener componentes actuales como adaptadores delgados.
3. Criterio de salida:
   - Menos CSS/HTML duplicado en `statistics/components`.

### Fase 7 - Rutas y guard

1. Verificar `statistics-routing-module.ts`:
   - path vacio a `MainStatistics`.
2. Verificar `statistics.guard.ts`:
   - admin autenticado entra.
   - no autenticado -> login.
   - no admin -> home.
3. Criterio de salida:
   - acceso restringido correctamente.

### Fase 8 - Pruebas y validacion

1. Unit tests facade:
   - mapping de respuestas nuevas.
   - tolerancia a errores parciales.
2. Unit tests componentes:
   - render con arrays vacios.
   - render con loading y error.
3. Prueba manual E2E:
   - cambiar rango de fechas.
   - validar cards, grafica semanal, tablas.
   - export PDF/JSON.
4. Criterio de salida:
   - sin errores TS, sin regresion visual grave.

## 5. Checklist operativo (paso a paso)

1. Actualizar DTOs en domain/statistics.
2. Crear types auxiliares en `src/app/types`.
3. Actualizar API endpoints/config.
4. Actualizar StatisticsApi.
5. Actualizar StatisticsFacade (estado + normalizadores + carga paralela).
6. Actualizar MainStatistics (view-models de UI).
7. Integrar grafica semanal en SalesSection.
8. Corregir columnas de tablas segun contrato nuevo.
9. Declarar componentes faltantes en StatisticsModule.
10. Crear `ui-kpi-card` en shared/ui.
11. Mejorar `ui-chart` para datasets configurables por input.
12. Migrar sections a shared/ui gradualmente.
13. Ejecutar test/diagnostico TS.
14. Ajustar estilos responsive.
15. Validar en entorno admin real.

## 6. Convenciones de implementacion

- Componentes de presentacion: inputs explicitos y tipados.
- Sin logica de negocio en shared/ui.
- Mapeos de contrato backend en facade, no en templates.
- No introducir NgRx nuevo para este modulo mientras facade cubra el caso.

## 7. Entregables esperados

- Front conectado a nuevas rutas de analytics.
- Dashboard de statistics con:
  - cards de KPI
  - grafica de ventas semanales
  - tablas operativas
- Shared UI extendida con componentes reutilizables via `@Input()`.
- Documento de arquitectura ligera de flujo:
  - API -> Facade -> Componentes de pagina -> Shared/UI.
