# Guía Maestra UI y Estilos

## 1. Propósito y alcance

Este documento es la **fuente única de verdad** para decisiones de UI y estilos del frontend.

**Alcance obligatorio:**
- Define qué componentes compartidos usar y cómo usarlos.
- Define reglas visuales (tokens) y estructurales (layout + composición interna).
- Define cuándo crear componentes reutilizables nuevos en `shared/ui`.
- Define límites formales para evitar inconsistencias.

**Fuera de alcance:**
- Reglas de infraestructura, despliegue o rutas funcionales de negocio.
- Implementación de lógica de backend.

---

## 2. Principios de diseño y consistencia visual

1. **Consistencia primero**
   - Si existe un componente equivalente en `shared/ui`, entonces úsalo.
   - Si no existe, evalúa creación reusable (ver sección 7).

2. **Separación de responsabilidades**
   - Si la necesidad es de layout global, entonces resuélvela en el contenedor de página.
   - Si la necesidad es visual/funcional local, entonces resuélvela dentro del componente reutilizable.

3. **Norma de no ruptura de tokens**
   - Si un valor visual puede mapearse a token oficial, entonces usa token.
   - Si no existe token, entonces propón token nuevo antes de hardcodear.

4. **Composición sobre duplicación**
   - Si una vista requiere patrones repetidos (tabla, formulario, modal), entonces compón con componentes existentes.
   - Si una vista copia markup/SCSS de otra para lograr lo mismo, entonces se considera incumplimiento.

5. **Prescripción sobre preferencia personal**
   - Si una decisión está definida en este documento, entonces prevalece sobre estilo individual.

6. **Evolución segura de componentes existentes**
   - Se permite modificar estilos, estructura y diseño de componentes existentes **solo** si la variación queda controlada por `@Input`.
   - Si se agrega una nueva variante visual (`size`, `density`, `mode`, `variant`, `layout`, etc.), entonces debe existir un valor por defecto que conserve el comportamiento actual.
   - Ninguna variante nueva debe romper implementaciones ya existentes; la compatibilidad hacia atrás es obligatoria.
   - Se permite variar todos los aspectos visuales necesarios (tamaño, color, disposición, estructura interna, espaciado, bordes, tipografía, estados), siempre bajo variantes explícitas por `@Input` y sin efectos colaterales globales.

---

## 3. Design tokens oficiales

### 3.1 Paleta de colores

| Uso | Token recomendado | Valor |
|---|---|---|
| Primario de marca | `--color-primary` | `#D4AF37` |
| Fondo base oscuro | `--color-surface-dark` | `#1a1a1a` |
| Texto principal | `--color-text-primary` | `#ffffff` |
| Texto secundario | `--color-text-secondary` | `#999999` |
| Error/acción destructiva | `--color-danger` | `#EF4444` |
| Éxito | `--color-success` | `#10B981` |
| Advertencia | `--color-warning` | `#FBBF24` |
| Borde estándar | `--color-border-primary` | `#D4AF37` |

**Reglas:**
- Si un botón es primario, entonces usa color primario por defecto.
- Si una acción es destructiva, entonces usa `--color-danger`.
- Si un texto es auxiliar, entonces usa `--color-text-secondary`.
- No usar colores hex nuevos sin token aprobado.

### 3.2 Tipografías

- Familia: la definida globalmente por la app (sin redefinir por componente).
- Título de sección: `2rem`, peso `100`, color texto principal.
- Texto base: `1rem`, color texto principal.
- Texto auxiliar/advertencia: `0.875rem` a `1rem`, color secundario o warning según contexto.

**Reglas:**
- Si es título de página/sección, entonces usa jerarquía de título estándar.
- Si es label o helper, entonces usa tamaño menor al texto base.
- No definir `font-family` a nivel de componente salvo casos excepcionales aprobados.

### 3.3 Spacing

| Elemento | Valor |
|---|---|
| Padding contenedor de página | `1.5rem` |
| Gap vertical de bloques principales | `1rem` |
| Gap zona de acciones | `0.75rem` |
| Separación footer de formularios/modales | `0.75rem` a `1rem` |

**Reglas:**
- Si el contenedor principal requiere padding, entonces usa `1.5rem`.
- No usar `2rem` como padding base de página.

### 3.4 Radios, bordes y sombras

- Radio base de contenedor: `5px` a `8px`.
- Borde de header de sección: `1px solid #D4AF37`.
- Borde de botón secundario/outline: color del estado (`primary` o `danger`).
- Sombras: usar únicamente las definidas en el sistema global.

**Reglas:**
- Si no hay token/sombra oficial, entonces no agregar sombra local ad hoc.

### 3.5 Tamaños base y alturas estándar

| Elemento | Recomendación |
|---|---|
| Ancho máximo formulario modal | `500px` a `1000px` según densidad |
| Alto máximo formulario/modal | `50vh` a `85vh` |
| Alto contenedor preview documento | `70vh` |
| Ancho mínimo tabla | `725px` (o mayor por columnas) |

**Reglas:**
- Si el contenido excede alto visible, entonces habilitar scroll interno en modal/form.
- Si la tabla pierde legibilidad por columnas, entonces aumentar `minWidth`.

---

## 4. Reglas de layout (macroestructura)

### 4.1 Contenedor de página

- Estructura base: columna, ancho completo, `gap: 1rem`, `padding: 1.5rem`.
- No asignar color de fondo local si el layout padre ya define superficie.

**Decisión:**
- Si la vista es de gestión/listado, entonces usar esta macroestructura sin variaciones.

### 4.2 Header de sección

- Debe incluir título + zona de acciones.
- Debe incluir `padding-bottom: 1rem` y borde inferior de marca.

**Decisión:**
- Si la sección tiene acciones globales (crear/recargar/exportar), entonces ubícalas en el header.

### 4.3 Zona de acciones

- Usar botones iconográficos compartidos para acciones rápidas.
- Mantener `gap: 0.75rem`.

**Decisión:**
- Si una acción es recurrente de cabecera, entonces usar botón de ícono.
- Si una acción requiere confirmación fuerte, entonces dispara modal de confirmación.

### 4.4 Zona de filtros

- Debe vivir entre header y contenido principal.
- Debe usar componentes compartidos (`ui-input`, `ui-combobox`, `ui-checkbox`, `ui-button`).

**Decisión:**
- Si hay más de 3 filtros, entonces agrupar en bloque de formulario compacto.

### 4.5 Zona de tabla/listado

- Toda tabla debe ir envuelta en contenedor `table-content`.
- Si hay acciones por fila, entonces incluir columna `Acciones` y configurar acciones explícitas.

**Decisión:**
- Si el listado solo es lectura, entonces omitir acciones.
- Si hay CRUD, entonces gestionar edición/creación en formularios o modales, no inline en celdas.

### 4.6 Modales y capas de gestión

- Usar modal compartido para altas/ediciones/confirmaciones/previsualización.
- Usar formulario compartido dentro de modal cuando aplique.
- Modal debe cerrar por control estándar de cierre del propio modal.

**Decisión:**
- Si la operación es destructiva, entonces modal de confirmación con acción principal en rojo.
- Si el contenido es extenso, entonces scroll interno obligatorio.

### 4.7 Reglas responsive mínimas

- Mantener legibilidad por encima de compacidad.
- Permitir scroll horizontal en tablas cuando el ancho mínimo lo requiera.
- Evitar romper jerarquía visual del header y acciones.

**Decisión:**
- Si el viewport no soporta tabla completa, entonces conservar estructura y habilitar overflow, no eliminar columnas críticas.

---

## 5. Catálogo de componentes reutilizables (`shared/ui`)

> Regla general de plasticidad: usar `@Input` para personalizar **contenido y variantes permitidas**, no para redefinir diseño global.

### 5.1 `ui-button`
- **Propósito:** acción principal/secundaria en formularios y modales.
- **Cuándo usarlo:** acciones de confirmar, guardar, ejecutar.
- **Cuándo NO usarlo:** navegación estructural principal.
- **Inputs clave:** `texto`, `tipo`, `disabled`, `customWidth`, `noBackgroundColor`, `backgroundColor`.
- **Outputs:** `accion`.
- **Límites:** no parametrizar tipografía global ni sombras no tokenizadas.
- **Medidas internas:** altura/padding según estilo base del sistema; radio entre `5px` y `8px`.

### 5.2 `ui-input`
- **Propósito:** entrada estándar de texto/fecha/número/email/password.
- **Cuándo usarlo:** cualquier captura simple de dato.
- **Cuándo NO usarlo:** selección compleja o búsqueda en catálogo (usar combobox).
- **Inputs clave:** `tituloInput`, `placeholder`, `tipo`, `min`, value binding.
- **Outputs:** cambio de valor.
- **Límites:** placeholder breve y directo; sin prefijos tipo “Ej:”.
- **Medidas internas:** ritmo vertical homogéneo con `app-ui-helper-text`.

### 5.3 `app-ui-tabla`
- **Propósito:** visualización tabular con acciones por fila.
- **Cuándo usarlo:** listados de gestión con estructura de columnas.
- **Cuándo NO usarlo:** cards visuales de catálogo (usar card).
- **Inputs clave:** `theadData`, `tbodyData`, `acciones`, `minWidth`.
- **Inputs opcionales avanzados:** `columnasConfig`.
   - Tipos soportados por columna: `text`, `image`, `actions`, `badge`, `stepper`, `toggle`.
   - `badge`: permite mapear valor a etiqueta/estilo (`badgeMap`).
   - `stepper`: permite incrementar/disminuir valores numéricos por fila (`min`, `max`, `step`, `disabled`).
   - `toggle`: permite alternar valores booleanos `true/false` por fila.
- **Outputs:** eventos de acciones por fila.
- **Outputs opcionales avanzados:** `stepperChange`, `toggleChange`.
- **Límites:** si hay acciones, debe existir columna `Acciones`.
- **Medidas internas:** `minWidth` base `725px`; wrapper `table-content` obligatorio.

**Compatibilidad obligatoria:**
- Si una tabla no define `columnasConfig`, entonces el comportamiento previo debe mantenerse sin cambios.
- Las variaciones avanzadas en celdas deben ser opt-in por columna, nunca forzadas globalmente.

### 5.4 `app-ui-tabs`
- **Propósito:** navegación entre vistas hermanas.
- **Cuándo usarlo:** cuando existen 2+ sub-vistas equivalentes.
- **Cuándo NO usarlo:** para navegación global de aplicación.
- **Inputs clave:** `tabItems`, `tabActiva`.
- **Outputs:** `tabChange`.
- **Límites:** etiquetas cortas y semánticas; no mezclar tabs con breadcrumbs para la misma jerarquía.

### 5.5 `app-ui-modal`
- **Propósito:** capa de gestión temporal y enfocada.
- **Cuándo usarlo:** CRUD, confirmaciones, previews.
- **Cuándo NO usarlo:** navegación persistente o contenido principal de página.
- **Inputs clave:** `titulo`, `mostrar`.
- **Outputs:** `cerrar`.
- **Límites:** no duplicar mecanismos de cierre contradictorios.
- **Medidas internas:** altura máxima recomendada hasta `85vh` con overflow.

### 5.6 `app-ui-combobox`
- **Propósito:** selección con búsqueda y filtrado.
- **Cuándo usarlo:** catálogos medianos/grandes o selección por texto.
- **Cuándo NO usarlo:** opciones binarias (usar checkbox) o pocas opciones estáticas simples.
- **Inputs clave:** `tituloInput`, `options`, `selectedOption`, `isDisabled`.
- **Outputs:** `selectedOptionChange` / `selectionChange`.
- **Límites:** no usar para listas extensas sin paginación/filtro.
- **Medidas internas:** dropdown ajustable por variable de altura máxima.

### 5.7 `app-ui-checkbox`
- **Propósito:** booleanos y consentimientos.
- **Cuándo usarlo:** toggles de opción sí/no.
- **Cuándo NO usarlo:** selección de una sola opción entre múltiples (usar combobox/radio según disponibilidad).
- **Inputs clave:** `label`, `name`, `checked`.
- **Outputs:** `checkedChange`.

### 5.8 `app-ui-icon-button` y `app-ui-only-icon-button`
- **Propósito:** acciones de acceso rápido en barras/headers.
- **Cuándo usarlo:** recargar, agregar, abrir gestión específica.
- **Cuándo NO usarlo:** acciones primarias críticas sin contexto textual cuando el ícono no es autoexplicativo.
- **Inputs clave:** `urlIcono`, `texto`, variantes visuales.
- **Outputs:** `action`.
- **Límites:** usar solo iconografía oficial del proyecto.

### 5.9 `app-ui-image-upload`
- **Propósito:** carga y preview de imágenes.
- **Cuándo usarlo:** formularios con imagen de entidad.
- **Cuándo NO usarlo:** carga de documentos no imagen.
- **Inputs clave:** identificador de entidad, URL actual.
- **Outputs:** archivo seleccionado / imagen subida.
- **Límites:** validar tipo de archivo en el componente.

### 5.10 `ui-breadcrumbs`
- **Propósito:** jerarquía de navegación contextual.
- **Cuándo usarlo:** rutas multinivel.
- **Cuándo NO usarlo:** vistas de un solo nivel.

### 5.11 `app-ui-button-grid`
- **Propósito:** accesos visuales en rejilla.
- **Cuándo usarlo:** paneles de acceso a secciones.
- **Cuándo NO usarlo:** listas transaccionales o formularios.

### 5.12 `app-ui-helper-text`
- **Propósito:** mensajes de validación y apoyo contextual.
- **Cuándo usarlo:** debajo de control asociado.
- **Cuándo NO usarlo:** mensajes globales de página sin relación a un campo.

### 5.13 `app-ui-form`
- **Propósito:** contenedor estandarizado de formularios.
- **Cuándo usarlo:** formularios en modal o bloque de captura.
- **Cuándo NO usarlo:** para layout general de página.
- **Inputs clave:** `titulo`, `subtitulo`, `maxWidth`, `maxHeight`, `showFooter`.
- **Outputs:** `formSubmit`.
- **Límites:** no anidar una etiqueta `<form>` adicional dentro.

### 5.14 `app-ui-product-card`
- **Propósito:** presentación visual de ítems en formato tarjeta.
- **Cuándo usarlo:** catálogos o vitrinas.
- **Cuándo NO usarlo:** operaciones tabulares de administración intensiva.

### 5.15 `app-ui-pos-topbar` (POS)
- **Propósito:** barra de encabezado fija para modo POS con controles rápidos.
- **Cuándo usarlo:** raíz de layout en rutas `/employee/orders*`.
- **Cuándo NO usarlo:** en vistas no-POS.
- **Inputs clave:** `autoPrint: boolean`, `sidebarOpen: boolean`.
- **Outputs:** `recargar`, `autoPrintChange`, `logout`, `toggleSidebar`.
- **Estructura de zonas:** izquierda (hamburguesa + brand) | centro (`ng-content select="[center]"`) | derecha (autoimpresión + logout).
- **Zona central:** proyección de contenido opcional vía `<div center>` en el consumidor (p.ej. título de sección + botón actualizar desde `main-layout.html`).
- **Altura fija:** `80px`.
- **Límites:** no agregar más de 5 controles en derecha; zona central solo para acciones POS de contexto global.
- **Soft-reload:** el layout usa `PosPreferencesService.triggerReload()` para soft-reload; `main-orders` suscribe a `reload$` y llama `cargarMesas()`.

### 5.16 `app-ui-pos-table-card` (POS)
- **Propósito:** tarjeta visual de mesa con estado y tiempo ocupada.
- **Cuándo usarlo:** grilla de mesas en `/employee/orders` (main-orders).
- **Cuándo NO usarlo:** listados administrativos de mesas.
- **Inputs clave:** `numeroMesa: number`, `estadoVisual: 'disponible' | 'ocupada'`, `tipoMesa: 'salon' | 'barra' | 'vip'`, `tiempoOcupada: string`, `density: 'default' | 'compact'`.
- **Outputs:** `abrir` (al hacer click).
- **Imagen:** asset tipo-específico (fallback gradient genérico si no existe).
- **Estado color:** verde (#4CAF50) para disponible, rojo (#DD3C51) para ocupada.
- **Default compatible:** `density='default'` mantiene comportamiento actual.
- **Medidas internas:** `minWidth: 140px`, `maxWidth: 200px`, padding `0.75rem`, radio `8px`.

### 5.17 `app-ui-pos-qty-stepper` (POS)
- **Propósito:** control inline de cantidad (incrementar/decrementar) para líneas de pedido.
- **Cuándo usarlo:** tabla de líneas en `/employee/orders/table/:idMesa`.
- **Cuándo NO usarlo:** para cantidades en formularios genéricos; usar input + validación.
- **Inputs clave:** `cantidad: number`, `disabled: boolean`, `size: 'default' | 'compact'`, `tone: 'neutral' | 'primary'`.
- **Outputs:** `incrementar`, `decrementar` (emitir sin parámetros; padre maneja lógica con id producto).
- **Botones:** 3 botones (−  qty  +), cada uno `24x24px` mínimo.
- **Default compatible:** `size='default'`, `tone='neutral'`.
- **Límites:** no incluir spinner; solo botones + display qty. Decrementar a 0 elimina línea (responsabilidad del padre).

### 5.18 `app-ui-pos-inline-feedback` (POS)
- **Propósito:** feedback operativo inmediato y consistente para acciones críticas de caja.
- **Cuándo usarlo:** panel derecho POS para confirmar operaciones (crear pedido, agregar/quitar producto, pago, recibo).
- **Cuándo NO usarlo:** reemplazar validación de campo (usar `app-ui-helper-text`) o alertas de seguridad global.
- **Inputs clave:** `visible: boolean`, `message: string`, `type: 'success' | 'error' | 'warning' | 'info'`, `density: 'default' | 'compact'`, `dismissible: boolean`.
- **Outputs:** `dismiss`.
- **Default compatible:** `density='default'`, `dismissible=true`.
- **Límites:** mensaje corto (máx. 120 caracteres), una sola línea operacional por evento.

---

## 6. Matriz de decisión de componentes

- Si necesitas **acción primaria** → usa `ui-button`.
- Si necesitas **acción rápida de header** → usa `app-ui-only-icon-button`.
- Si necesitas **entrada simple de dato** → usa `ui-input`.
- Si necesitas **selección con búsqueda** → usa `app-ui-combobox`.
- Si necesitas **booleano** → usa `app-ui-checkbox`.
- Si necesitas **validación de campo** → usa `app-ui-helper-text`.
- Si necesitas **listado estructurado** → usa `app-ui-tabla`.
- Si necesitas **vistas hermanas conmutables** → usa `app-ui-tabs`.
- Si necesitas **gestión temporal enfocada** → usa `app-ui-modal`.
- Si necesitas **estructura de captura estandarizada** → usa `app-ui-form`.
- Si necesitas **subida de imagen** → usa `app-ui-image-upload`.
- Si necesitas **navegación jerárquica contextual** → usa `ui-breadcrumbs`.
- Si necesitas **accesos visuales tipo dashboard** → usa `app-ui-button-grid`.
- Si necesitas **feedback operativo POS** → usa `app-ui-pos-inline-feedback`.
- Si no existe componente para el caso N y se repetirá en 2+ contextos → crear componente nuevo en `shared/ui` (ver sección 7).

---

## 7. Guía para crear nuevos componentes reutilizables en `shared/ui`

### 7.1 Criterios para decidir creación

**Crear componente nuevo solo si:**
- El patrón se repite o se repetirá en al menos 2 contextos funcionales.
- Requiere API parametrizable clara (`@Input`/`@Output`).
- Aporta consistencia visual y reduce duplicación de markup/estilos.

**No crear componente nuevo si:**
- Es un caso único o temporal.
- Puede resolverse componiendo 2 o más componentes ya existentes.
- La variación es solo de contenido textual, no de estructura/comportamiento.

### 7.2 Checklist de API mínima

- `@Input` para datos de presentación y variantes permitidas.
- `@Output` para eventos de interacción relevantes.
- Estado interno mínimo y encapsulado.
- Sin dependencias de negocio específicas dentro del componente UI.
- Documentar Inputs/Outputs con contrato de uso.
- Si se modifica un componente existente, conservar API previa y comportamiento por defecto.
- Toda nueva variante visual debe activarse por `@Input` (no por cambios implícitos que afecten consumidores actuales).

### 7.3 Convención de nombres

- Nombre semántico por responsabilidad visual/funcional.
- Sufijos consistentes (`-button`, `-form`, `-modal`, `-card`, etc.).
- Selector y archivo alineados con convención existente del proyecto.

### 7.4 Consistencia visual obligatoria

- Tokens de color, spacing, borde y tipografía obligatorios.
- Respeto de jerarquía visual de títulos, acciones y contenido.
- No introducir paletas o radios nuevos sin aprobación.

### 7.5 Plantilla estructural base (TS/HTML/SCSS)

- TS: Inputs/Outputs explícitos + estado local mínimo.
- HTML: estructura semántica, slots de contenido claros.
- SCSS: estilos internos del componente, sin forzar posicionamiento global.

### 7.6 Qué no hacer (anti-patrones)

- No acoplar componente UI a una entidad concreta de negocio.
- No incluir llamadas de infraestructura/red dentro del componente presentacional.
- No exponer 20+ Inputs para cubrir casos extremos; dividir en subcomponentes.

---

## 8. Límites formales de estructura de componentes

### 8.1 Composición interna estándar

- Raíz del componente con una responsabilidad visual clara.
- Secciones internas previsibles: header (opcional), contenido, footer/acciones (si aplica).
- Eventos salientes estables y documentados.

### 8.2 Medidas mínimas/máximas recomendadas

- Padding interno estándar: `0.75rem` a `1.5rem`.
- Gap interno estándar: `0.5rem` a `1rem`.
- Radio estándar: `5px` a `8px`.
- Formularios en modal: `maxWidth` entre `500px` y `1000px`; `maxHeight` entre `50vh` y `85vh`.
- Preview de documento: altura objetivo `70vh`.

### 8.3 Reglas de variantes (densidad, tamaño, modo)

- Si se requiere variante visual, entonces exponer `@Input` de variante (`size`, `density`, `mode`) con valores acotados.
- Si una variante cambia semántica del componente, entonces crear componente separado.
- Variantes permitidas no deben romper tokens oficiales.

---

## 9. Anti-patrones y errores frecuentes

- Duplicar estilos inline en lugar de centralizar en componente.
- Saltar componentes compartidos para crear HTML ad hoc equivalente.
- Inconsistencia de nombres o contratos de `@Input`/`@Output` para la misma responsabilidad.
- Hardcodear colores, radios o sombras fuera de tokens.
- Introducir layouts globales dentro de un componente micro.
- Anidar formularios redundantes dentro de contenedores de formulario.
- Omitir wrapper de tabla cuando el patrón exige contenedor de listado.

---

## 10. Checklist final de cumplimiento para PR/documentación

Marcar cada ítem como **Cumple / No cumple** antes de aprobar:

1. Se reutilizan componentes de `shared/ui` cuando existen.
2. No hay hardcode de colores/tipografías/espaciados fuera de tokens.
3. El layout respeta macroestructura (contenedor, header, acciones, contenido, capas).
4. Las tablas/listados siguen reglas de acciones y estructura.
5. Los formularios respetan límites de composición y validación.
6. Los modales respetan comportamiento y límites de altura/scroll.
7. La plasticidad por `@Input` está acotada y no rompe consistencia global.
8. Los `@Output` representan eventos de UI, no lógica de negocio acoplada.
9. Si se creó componente nuevo, se justificó con criterios de reutilización.
10. Se documentaron límites, variantes y anti-patrones del componente nuevo.
11. No hay referencia normativa duplicada fuera de este documento.
12. La guía se puede aplicar como manual de decisión sin inspección de código.
