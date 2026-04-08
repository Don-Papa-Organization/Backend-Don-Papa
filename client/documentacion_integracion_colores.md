# Integracion de Colores por Variables y Documentacion de Componentes

Fecha: 2026-04-01

## Objetivo
Estandarizar los estilos para que los colores no queden hardcodeados y se consuman desde variables/tokens del sistema, con trazabilidad por modulo y guia de uso de componentes.

## Alcance auditado
- src/app/shared
- src/app/features/admin
- src/app/features/auth
- src/app/features/catalog
- src/app/features/client
- src/app/features/employee

Incluye:
- shared/ui
- estilos de esquema de modulo (layout y paginas fuera de shared/ui)

## Fuente de tokens oficial
- src/app/styles/_variables.scss
- src/app/styles/_colors-common.scss
- src/app/styles/_colors-admin.scss
- src/app/styles/_colors-client.scss
- src/app/styles/_colors-employee.scss

## Estado actual (evidencia de auditoria)
### Metricas SCSS por segmento
- shared-ui: 35 archivos, 416 colores hardcodeados, 27 usos de CSS vars, 266 usos de SCSS vars.
- shared-no-ui: 2 archivos, 19 colores hardcodeados, 0 usos de CSS vars, 0 usos de SCSS vars.
- admin: 43 archivos, 79 colores hardcodeados, 136 usos de CSS vars, 0 usos de SCSS vars.
- auth: 6 archivos, 16 colores hardcodeados, 0 usos de CSS vars, 0 usos de SCSS vars.
- catalog: 1 archivo, 8 colores hardcodeados, 0 usos de CSS vars, 0 usos de SCSS vars.
- client: 31 archivos, 424 colores hardcodeados, 1 uso de CSS vars, 472 usos de SCSS vars.
- employee: 14 archivos, 279 colores hardcodeados, 3 usos de CSS vars, 250 usos de SCSS vars.

### Top archivos prioritarios por modulo (hardcoded)
#### admin
- 11 | src/app/features/admin/pages/reports/main-reports/main-reports.scss
- 11 | src/app/features/admin/pages/users/main/main.scss
- 9  | src/app/features/admin/pages/orders/components/agregar-order-form/agregar-order-form.scss
- 8  | src/app/features/admin/pages/orders/main-orders/main-orders.scss
- 8  | src/app/features/admin/pages/tables-reserves/main-tables-reserves/main-tables-reserves.scss

#### auth
- 4 | src/app/features/auth/verify-email/verify-email.scss
- 4 | src/app/features/auth/profile/profile.scss
- 3 | src/app/features/auth/forgot-password/forgot-password.scss
- 3 | src/app/features/auth/register/register.scss
- 1 | src/app/features/auth/login/login.scss

#### catalog
- 8 | src/app/features/catalog/catalog.scss

#### client
- 76 | src/app/features/client/pages/reservas/components/reservas-disponibilidad/reservas-disponibilidad.page.scss
- 61 | src/app/features/client/pages/catalogo/components/catalog-mesas/catalog-mesas.page.scss
- 33 | src/app/features/client/pages/catalogo/components/hero/hero-section.component.scss
- 33 | src/app/features/client/pages/catalogo/components/product-detail-modal/product-detail-modal.component.scss
- 19 | src/app/features/client/pages/catalogo/components/catalog-marketplace/catalog-marketplace.page.scss

#### employee
- 53 | src/app/features/employee/main-layout/main-layout.scss
- 51 | src/app/features/employee/pages/pedidos-web/pedidos-web-page.component.scss
- 36 | src/app/features/employee/pages/orders/pos-floor-plan/pos-floor-plan.scss
- 34 | src/app/features/employee/main-layout/components/web-orders-badge/web-orders-badge.component.scss
- 27 | src/app/features/employee/pages/events-promotions/events-page/events-page.scss

#### shared/ui
- 34 | src/app/shared/ui/ui-pos-floor-mesa/ui-pos-floor-mesa.scss
- 31 | src/app/shared/ui/reservation-modal/reservation-modal.component.scss
- 27 | src/app/shared/ui/order-item/order-item.component.scss
- 26 | src/app/shared/ui/mesas-grid/mesas-grid.component.scss
- 22 | src/app/shared/ui/ui-tabla/ui-tabla.scss

#### shared (no ui)
- 10 | src/app/shared/layout/header/header.scss
- 9  | src/app/shared/layout/sidebar/sidebar.scss

## Casos de uso y descripcion por modulo

## 1) shared/ui
### Rol del modulo
Contiene los bloques reutilizables de UI consumidos por admin, auth, client, employee y catalog.

### Componentes clave y uso
- ui-button: CTA en formularios/modales CRUD.
- ui-input: captura de datos base en formularios.
- app-ui-modal: capas de alta/edicion/confirmacion.
- app-ui-form: estructura estandar para formularios.
- app-ui-tabla: listados operativos con acciones.
- app-ui-tabs: navegacion interna por secciones.
- app-ui-pos-floor-mesa: visualizacion/estado de mesa en POS employee.

### Reglas de integracion de color
- Prohibido usar hex/rgba directos para estados base del sistema cuando exista token equivalente.
- Estados semanticos deben mapear a tokens de common o al set de tema del modulo.
- Componentes reutilizables deben exponer variantes por input cuando requieran color especial por contexto.

## 2) shared/layout (no ui)
### Rol del modulo
Header y sidebar globales. Define identidad visual transversal.

### Uso funcional
- Header: atajos globales y accion de cierre de sesion.
- Sidebar: navegacion por rol.

### Integracion requerida
- Migrar colores hardcodeados de header/sidebar a --dp-color-common-* o tokens globales.
- Evitar sombras y bordes no tokenizados para mantener consistencia entre roles.

## 3) admin
### Rol del modulo
Gestion operativa y backoffice (inventario, ordenes, usuarios, reportes, reservas, estadisticas).

### Uso de componentes shared/ui
- Alta densidad de ui-button, ui-input, app-ui-modal, app-ui-form, app-ui-tabla, app-ui-tabs.

### Casos de uso de color
- Estados CRUD (guardar, editar, eliminar).
- Jerarquia de tablas/headers/filtros.
- Indicadores de error y confirmacion.

### Integracion requerida
- Sustituir hardcoded en paginas top de reporte/usuarios/ordenes por tokens common/admin.
- Consolidar colores de tablas y formularios al sistema de variables oficial.

## 4) auth
### Rol del modulo
Flujos de acceso y recuperacion de credenciales.

### Uso funcional
- login, register, forgot/reset, verify-email, profile.

### Integracion requerida
- Normalizar todos los colores a tokens de superficie, texto y estado.
- Evitar excepciones visuales por pantalla (homologar branding).

## 5) catalog
### Rol del modulo
Vista de catalogo general reutilizable.

### Integracion requerida
- Migrar catalog.scss completo a tokens (es un archivo unico, impacto acotado y rapido).

## 6) client
### Rol del modulo
Experiencia de cliente final (catalogo, pedidos, reservas, perfil, eventos).

### Uso de componentes shared/ui
- app-ui-product-card, ui-button, ui-input, app-ui-modal, app-ui-tabs, ui-toast, componentes de reserva.

### Casos de uso de color
- Cards de producto y estados de disponibilidad.
- Flujos de reserva (disponible/no disponible/confirmado).
- Resaltado comercial en catalogo y promociones.

### Integracion requerida
- Prioridad maxima por volumen de hardcoded (reservas-disponibilidad y catalog-mesas).
- Unificar variantes premium/client con tokens client/common y eliminar hex directos.

## 7) employee
### Rol del modulo
Operacion POS y flujo operativo interno (ordenes, pedidos web, caja, eventos, perfil).

### Uso de componentes shared/ui
- app-ui-pos-floor-mesa, app-ui-pos-qty-stepper, ui-button, app-ui-payment-summary.

### Casos de uso de color
- Estados de mesa y resaltado operativo.
- Señales de urgencia/estado en pedidos web.
- Jerarquia visual en layout de operacion.

### Integracion requerida
- Reducir hardcoded en main-layout, pedidos-web y pos-floor-plan.
- Mantener semantica de estado (disponible/ocupada/otro) pero por tokens/variables, no hex directos.

## Mapeo recomendado de hardcoded -> tokens
- #D4AF37 y variantes doradas -> --dp-color-common-029 / --color-gold.
- #EF4444 / #F44336 y variantes rojas -> --dp-color-common-031 o --dp-color-common-032.
- #22C55E / #10B981 y variantes verdes -> --dp-color-common-008 / --dp-color-employee-004.
- #2B1D13 / #1A120B (fondos oscuros) -> --dp-color-employee-009 / --dp-color-common-005.
- Blancos y opacidades -> --dp-color-common-045 y familia --dp-color-common-11x/12x.

## Politica de implementacion (obligatoria)
1. No introducir nuevos colores hardcodeados en SCSS de modulos.
2. Si no existe token, agregarlo en src/app/styles y documentarlo antes de usarlo.
3. Priorizar migracion por impacto visual y frecuencia de uso.
4. En shared/ui, usar variables para que el cambio propague a todos los modulos.

## Plan de ejecucion recomendado
### Fase 1 (alto impacto, corto plazo)
- shared/ui top 5 archivos con mas hardcoded.
- employee POS (main-layout, pedidos-web, pos-floor-plan).
- client reservas-disponibilidad + catalog-mesas.

### Fase 2
- admin reportes/usuarios/ordenes.
- auth completo.
- catalog completo.

### Fase 3
- hardening: eliminar hardcoded residuales y ajustar contraste/AA.

## Definicion de terminado
- 0 hardcoded de color en features/* y shared/* (excepto archivos de inventario de paleta o generados).
- Todos los colores consumidos via tokens CSS vars o variables SCSS oficiales.
- Documentacion actualizada al cerrar cada fase.

## Comando sugerido de control
Usar busqueda regex para detectar hardcoded en SCSS:
- patron: #[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(

## Notas
- Este documento cubre integracion + descripcion de uso por modulo y componentes.
- Se recomienda versionarlo junto con cada lote de migracion para mantener trazabilidad.

## Resultado de implementacion (2026-04-01)
- Se genero `src/app/styles/_colors-hardcoded.scss` con tokens para colores que no estaban en los sets existentes.
- Se actualizaron referencias de color en `features/*` y `shared/*` para consumir `var(--token)`.
- Se agrego la carga global del archivo en `src/styles.scss` mediante `@use './app/styles/colors-hardcoded';`.
- Verificacion posterior: `remainingHardcoded=0` en SCSS de `src/app/features` y `src/app/shared`.
