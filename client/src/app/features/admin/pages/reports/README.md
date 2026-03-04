# Módulo de Reportes

## Descripción

Módulo administrativo para consultar y generar reportes del sistema Don Papa. Proporciona acceso a bitácora de incidencias y reportes de ventas.

## Rutas Implementadas

Todas las rutas según `MapeoDeRutasPorRol.md`:

### GET Endpoints
- **getBitacoraByEmployee**: `GET /reports/bitacora/employee/:id` - Obtiene bitácora de un empleado específico
- **searchBitacora**: `GET /reports/bitacora` - Busca incidencias con filtros (fecha inicio, fecha fin, empleado)
- **getSalesHistory**: `GET /reports/sales/history` - Obtiene historial de ventas con filtros opcionales
- **getSaleDetail**: `GET /reports/sales/:id/detail` - Obtiene detalles completos de una venta
- **getSalesReportByDates**: `GET /reports/sales/by-dates` - Genera reporte de ventas por rango de fechas

### POST Endpoints (Disponibles en facade)
- **registerIncident**: `POST /reports/bitacora/incidents` - Registra un nuevo incidente
- **registerComment**: `POST /reports/bitacora/comments` - Añade comentario a incidente

## Estructura de Archivos

```
reports/
├── main-reports/
│   ├── main-reports.ts          # Componente principal orquestador
│   ├── main-reports.html         # Template con tabs y tablas
│   └── main-reports.scss         # Estilos personalizados
├── services/
│   └── reports.facade.ts         # Capa de fachada (mapea API → componente)
├── reports-module.ts             # Declaración del módulo
├── reports-routing-module.ts     # Configuración de rutas
└── README.md                      # Este archivo
```

## Componentes

### MainReports
Componente orchestrador que maneja:
- **Tabs**: "Bitácora de Incidencias" | "Reporte de Ventas"
- **Filtros**: Dinámicos por pestaña
- **Tablas**: Datos con acciones (ver detalles)
- **Modales**: Visualización de detalles de registros

## Servicios

### ReportsFacade
Capa intermedia entre componentes y API que:
- Encapsula llamadas HTTP del `ReportsApi`
- Mapea respuestas `ApiResponse<T>` a datos puros
- Maneja errores con fallbacks seguros
- Registra logs en consola para debugging

### ReportsApi
Servicio HTTP que comunica con backend:
- Inyecta `HttpClient`
- Usa `buildApiUrl` con `API_ENDPOINTS`
- Retorna `Observable<ApiResponse<T>>`

## Patrones Arquitectónicos

Sigue la guía de infraestructura:
- **API Layer**: Comunicación HTTP directa
- **Facade Layer**: Transformación de datos
- **Component Layer**: Lógica de presentación

Ejemplo flujo:
```
Component.ngOnInit()
  ↓ this.facade.searchBitacora()
    ↓ ReportsFacade.searchBitacora()
      ↓ ReportsApi.searchBitacora()
        ↓ HttpClient.get()
          ↓ Backend
        ↑ ApiResponse<BitacoraSearchDataDto>
      ↑ map(response.data)
      ↑ catchError → of(null)
    ↑ Observable<BitacoraSearchDataDto | null>
  ↓ subscribe({ next: (data) => ... })
```

## Modelos de Datos

### BitácorViewModel
```typescript
{
  "ID": number;
  "Empleado": string;
  "Descripción": string;
  "Fecha": string;
  "Tipo": string;
}
```

### VentaViewModel
```typescript
{
  "ID": number;
  "Pedido": string;
  "Monto": string;
  "Fecha": string;
  "Cliente": string;
  "Estado": string;
}
```

## Estados del Componente

- `tabActiva`: Pestaña seleccionada (bitacora|ventas)
- `cargandoBitacora`: Indicador de carga bitácora
- `cargandoVentas`: Indicador de carga ventas
- `bitacoraItems`: Datos de bitácora procesados
- `ventasItems`: Datos de ventas procesados
- `mostrarModalDetalleBitacora`: Control modal bitácora
- `mostrarModalDetalleVenta`: Control modal ventas
- `registroSeleccionado`: Registro actualmente mostrado en modal

## Acciones de Tabla

Cada tabla dispone de:
- **Eye Icon** (👁️): Ver detalles del registro
  - Abre modal con información completa
  - Para ventas, carga detalles adicionales vía `getSaleDetail()`

## Filtros

### Bitácora
- ID Empleado (opcional)
- Fecha Inicio (opcional)
- Fecha Fin (opcional)

### Ventas
- Fecha Inicio (opcional)
- Fecha Fin (opcional)

Botones:
- **Buscar/Generar Reporte**: Aplica filtros y recarga datos
- **Limpiar Filtros**: Reinicia valores y recarga sin filtros

## Estilos

Sigue guía_DeEstilos.md:
- Color principal: `#d4af37` (dorado)
- Encabezados: Bordes dorados 3px
- Tablas: Hover effects con fondo #fafafa
- Modales: Overlay semi-transparente
- Responsive: Mobile-first con breakpoint 768px

## Validaciones

- Datos nulos retornan arrays vacíos en vistas
- Errores muestran fallback y logs en consola
- Formateo de fechas: `toLocaleDateString('es-ES')`
- Moneda: Prefijo `$` en montos

## Testing

### Endpoints disponibles para testeo
1. Bitácora por empleado: GET /reports/bitacora/employee/1
2. Búsqueda bitácora: GET /reports/bitacora?fechaInicio=2024-01-01
3. Historial ventas: GET /reports/sales/history
4. Detalle venta: GET /reports/sales/1/detail
5. Reporte fechas: GET /reports/sales/by-dates?fechaInicio=2024-01-01&fechaFin=2024-12-31

### Data esperada
Tablas esperan arrays de objetos con propiedades coincidentes a `theadData`:
```typescript
bitacoraItems = [
  {
    "ID": 1,
    "Empleado": "Juan Pérez",
    "Descripción": "Login exitoso",
    "Fecha": "23/1/2024",
    "Tipo": "Acceso"
  }
]
```

## Future Enhancements

- [ ] Exportar reportes a PDF/Excel
- [ ] Gráficos de tendencias de ventas
- [ ] Filtros avanzados con DateRangePicker
- [ ] Paginación de tablas grandes
- [ ] Búsqueda full-text en bitácora
- [ ] Compartir reportes por email

## Dependencias

- @angular/core, @angular/common
- @angular/forms (para formularios de filtro)
- rxjs (Observable, of, map, catchError)
- UI Components: app-ui-tabs, app-ui-tabla, app-ui-modal

## Autor

Implementado siguiendo MapeoDeRutasPorRol.md y guías de infraestructura/estilos del proyecto.
