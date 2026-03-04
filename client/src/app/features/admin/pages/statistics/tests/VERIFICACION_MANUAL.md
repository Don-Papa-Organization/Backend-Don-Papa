# Plan de Verificación Manual - Módulo de Estadísticas

## Objetivo
Validar el comportamiento del módulo en condiciones reales de uso, cubriendo casos no automatizables.

---

## 1. Exportación PDF

### Pasos
1. Navegar a `/admin/statistics`
2. Seleccionar rango de fechas específico:
   - **Fecha Inicio**: `01/02/2026`
   - **Fecha Fin**: `27/02/2026`
3. Hacer clic en botón **"Exportar PDF"** (ubicado en el header de `statistics-filters`)
4. Esperar descarga del archivo

### Validaciones
- [ ] El archivo se descarga automáticamente
- [ ] El nombre del archivo contiene el rango de fechas (ej. `dashboard_2026-02-01_2026-02-27.pdf`)
- [ ] El PDF contiene todas las secciones:
  - [ ] Métricas de Ventas (Total, Pedidos, Ticket Promedio)
  - [ ] Gráfico de Timeline de Ventas
  - [ ] Top 10 Productos
  - [ ] Stock Muerto
  - [ ] Métricas de Usuarios (Crecimiento)
  - [ ] Horas Pico de Ocupación
  - [ ] Efectividad de Promociones
  - [ ] Usuarios Frecuentes
- [ ] Los datos del PDF coinciden con los mostrados en pantalla
- [ ] El formato del PDF es legible y profesional

### Casos de Error
- [ ] Si el servidor falla, se muestra notificación de error
- [ ] Si el rango de fechas es inválido (fecha fin < fecha inicio), se muestra mensaje de validación

---

## 2. Responsividad - Diseño Móvil

### Dispositivos a Probar
- **Móvil**: `375px × 667px` (iPhone SE)
- **Tablet**: `768px × 1024px` (iPad)
- **Desktop**: `1920px × 1080px`

### Pasos
1. Abrir Chrome DevTools (F12)
2. Activar modo responsive (`Ctrl + Shift + M`)
3. Navegar a `/admin/statistics`
4. Cambiar tamaño de viewport a cada resolución

### Validaciones - Móvil (375px)
- [ ] Las **secciones se apilan verticalmente** (no horizontal)
- [ ] Los **filtros de fecha** se adaptan (selectors en bloque)
- [ ] Las **tarjetas de métricas** (`metric-card`) ocupan 100% de ancho
- [ ] Las **tablas** tienen scroll horizontal si exceden el ancho
- [ ] Los **gráficos** se redimensionan correctamente
- [ ] El **botón de exportar PDF** es accesible (no cortado)
- [ ] No hay overflow horizontal en ninguna sección

### Validaciones - Tablet (768px)
- [ ] Las secciones usan grid de **2 columnas** (si aplica)
- [ ] Las métricas se muestran en grid de 2×2
- [ ] Los gráficos mantienen aspect ratio correcto

### Validaciones - Desktop (1920px)
- [ ] Las secciones usan grid de **3-4 columnas** (según diseño)
- [ ] Máximo ancho de contenedor: `1400px` (según `guia_DeEstilos.md`)
- [ ] El dashboard está centrado horizontalmente

---

## 3. Estados de Carga y Error

### Estado de Carga (Loading)
#### Pasos
1. Abrir Network Tab en DevTools
2. Activar throttling de red: **Slow 3G**
3. Navegar a `/admin/statistics`
4. Observar comportamiento durante carga

#### Validaciones
- [ ] Se muestra indicador de carga (spinner) en cada sección
- [ ] Los componentes no muestran datos incorrectos durante carga
- [ ] El layout no "salta" cuando los datos llegan (usar skeleton screens si aplica)

### Estado de Error (Fallo de Endpoint)
#### Pasos
1. Simular fallo de MS6 (detener servicio o usar Mock Interceptor)
2. Navegar a `/admin/statistics`
3. Observar comportamiento

#### Validaciones
- [ ] Se muestra mensaje de error específico en la sección fallida
- [ ] El resto del dashboard sigue operativo
- [ ] Hay un botón de **"Reintentar"** en la sección fallida
- [ ] El error no rompe la aplicación (no hay console errors críticos)

---

## 4. Persistencia de Filtros

### Pasos
1. Navegar a `/admin/statistics`
2. Cambiar filtros de fecha:
   - **Fecha Inicio**: `15/02/2026`
   - **Fecha Fin**: `20/02/2026`
3. Aplicar filtros (se carga dashboard con nuevo rango)
4. Navegar a otro módulo: `/admin/inventory`
5. Regresar a `/admin/statistics`

### Validaciones
- [ ] Los filtros de fecha **persisten** (muestran `15/02/2026` - `20/02/2026`)
- [ ] Los datos del dashboard corresponden al rango persistido
- [ ] No se dispara recarga innecesaria al volver al módulo

---

## 5. Estado Vacío - Arrays Vacíos

### Configuración
Para este test, modificar temporalmente el backend para devolver arrays vacíos:
```typescript
// En ms6-report-service/src/controllers/analyticsController.ts
// Modificar respuestas para retornar arrays vacíos
salesTimeline: [],
topProducts: [],
promotionEffectiveness: []
```

### Pasos
1. Navegar a `/admin/statistics` con backend modificado
2. Observar cada sección

### Validaciones
- [ ] **Sales Timeline**: Muestra mensaje *"Sin datos en este periodo"*
- [ ] **Top Products**: Muestra mensaje *"No hay productos vendidos en este rango"*
- [ ] **Dead Stock**: Muestra mensaje *"No se detectó stock sin movimiento"*
- [ ] **Horas Pico**: Muestra mensaje *"No hay datos de ocupación"*
- [ ] **Promociones**: Muestra mensaje *"No hay eventos o promociones en este periodo"*
- [ ] **Usuarios Frecuentes**: Muestra mensaje *"No hay usuarios frecuentes en este periodo"*
- [ ] Los mensajes están **centrados y estilizados** (no solo texto plano)
- [ ] No hay errores en consola

---

## 6. Interactividad de Gráficos (Chart.js)

### Pasos
1. Navegar a `/admin/statistics`
2. Localizar gráfico de **Sales Timeline** (línea temporal)
3. Interactuar con el gráfico

### Validaciones
- [ ] Al pasar el mouse sobre puntos, se muestra **tooltip** con datos exactos
- [ ] El tooltip muestra:
  - [ ] Fecha formateada
  - [ ] Total de ventas en formato moneda (₡)
  - [ ] Cantidad de pedidos
- [ ] La leyenda del gráfico es visible y correcta
- [ ] Los colores del gráfico siguen la paleta de `guia_DeEstilos.md`
- [ ] El gráfico es responsive (se redimensiona con la ventana)

---

## 7. Accesibilidad (A11y)

### Herramientas
- **Lighthouse** (Chrome DevTools)
- **axe DevTools** (extensión)

### Pasos
1. Navegar a `/admin/statistics`
2. Ejecutar Lighthouse audit (categoría Accessibility)
3. Ejecutar axe scan

### Validaciones
- [ ] Score de Lighthouse ≥ 90
- [ ] No hay errores críticos en axe
- [ ] Todos los botones tienen `aria-label` descriptivo
- [ ] Las tablas tienen headers (`<th>`) correctos
- [ ] Los gráficos tienen `aria-label` para lectores de pantalla
- [ ] La navegación por teclado funciona correctamente (Tab para moverse)

---

## 8. Performance

### Pasos
1. Abrir Performance Tab en DevTools
2. Navegar a `/admin/statistics`
3. Grabar performance durante carga inicial

### Validaciones
- [ ] **Time to Interactive (TTI)**: < 3 segundos
- [ ] **First Contentful Paint (FCP)**: < 1.5 segundos
- [ ] No hay memory leaks (observar memory usage durante 2 min)
- [ ] El dashboard no causa lag al hacer scroll

---

## Registro de Resultados

| Test | Estado | Fecha | Observaciones |
|------|--------|-------|---------------|
| Exportación PDF | ⬜ Pendiente | - | - |
| Responsividad Móvil | ⬜ Pendiente | - | - |
| Responsividad Tablet | ⬜ Pendiente | - | - |
| Responsividad Desktop | ⬜ Pendiente | - | - |
| Estado de Carga | ⬜ Pendiente | - | - |
| Estado de Error | ⬜ Pendiente | - | - |
| Persistencia de Filtros | ⬜ Pendiente | - | - |
| Estado Vacío | ⬜ Pendiente | - | - |
| Interactividad Gráficos | ⬜ Pendiente | - | - |
| Accesibilidad (Lighthouse) | ⬜ Pendiente | - | - |
| Performance | ⬜ Pendiente | - | - |

---

## Notas

- Completar todos los tests antes de marcar el módulo como **Production Ready**
- Documentar cualquier bug encontrado en GitHub Issues
- Si algún test falla, crear task de corrección antes de deployment
