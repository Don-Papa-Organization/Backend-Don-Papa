# Auditoria de diseno y uso de componentes

Fecha: 2026-03-31

## Resumen

- Componentes en shared/ui detectados: 35
- Componentes shared/ui con uso en plantillas: 26
- Componentes shared/ui sin uso detectado: 9
- Matriz completa exportada en: src/app/shared/ui/_usage-report.csv

## Top componentes mas usados

- ui-button: 57 archivos
- ui-input: 35 archivos
- app-ui-modal: 35 archivos
- app-ui-form: 29 archivos
- app-ui-helper-text: 26 archivos
- app-ui-combobox: 17 archivos
- app-ui-tabla: 14 archivos
- app-ui-only-icon-button: 13 archivos
- app-ui-tabs: 9 archivos
- app-ui-admin-filter-panel: 5 archivos
- app-ui-checkbox: 5 archivos
- app-ui-icon-button: 4 archivos
- app-ui-product-card: 3 archivos
- app-ui-toast: 3 archivos
- app-ui-reservation-modal: 2 archivos

## Componentes sin uso detectado

- app-data-table (src\app\shared\ui\data-table\data-table.component.ts)
- app-metric-card (src\app\shared\ui\metric-card\metric-card.component.ts)
- app-ui-button-grid (src\app\shared\ui\ui-button-grid\ui-button-grid.ts)
- app-ui-chart (src\app\shared\ui\ui-chart\ui-chart.component.ts)
- app-ui-mesas-grid (src\app\shared\ui\mesas-grid\mesas-grid.component.ts)
- app-ui-pos-table-card (src\app\shared\ui\ui-pos-table-card\ui-pos-table-card.ts)
- app-ui-pos-topbar (src\app\shared\ui\ui-pos-topbar\ui-pos-topbar.ts)
- app-ui-quantity-controls (src\app\shared\ui\ui-quantity-controls\ui-quantity-controls.component.ts)
- ui-breadcrumbs (src\app\shared\ui\ui-breadcrumbs\ui-breadcrumbs.ts)

## Mapa de escenarios de botones

- CTA de formularios y modales CRUD: predominan ui-button dentro de app-ui-modal + app-ui-form en admin y auth.
- Acciones destructivas: ui-button con noBackgroundColor=true y backgroundColor=#EF4444 en eliminar/cancelar.
- Navegacion y atajos en header: app-ui-icon-button y app-ui-only-icon-button en layouts admin/client/employee.
- Tabla y grillas: acciones por fila combinan app-ui-tabla con icon-only buttons o acciones custom.
- Flujo cliente premium: ui-button con visualTheme=client-premium en catalogo, pedidos, perfil y reservas.
- POS empleado: ui-button compacto y componentes especializados (app-ui-pos-qty-stepper, app-ui-pos-floor-mesa).
- Boton nativo HTML aun presente en varios modulos (statistics, pedidos-web, reservas, eventos, catalogo), fuera de shared/ui.

## Shared UI por selector

- app-agent-panel -> usado en 1 archivos. Ejemplos: src\app\features\admin\main-layout\main-layout.html
- app-data-table -> sin uso detectado
- app-metric-card -> sin uso detectado
- app-ui-admin-filter-panel -> usado en 5 archivos. Ejemplos: src\app\features\admin\pages\events-promotions\main-events-promotions\main-events-promotions.html; src\app\features\admin\pages\inventory\main-inventory\main-inventory.html; src\app\features\admin\pages\orders\main-orders\main-orders.html
- app-ui-button-grid -> sin uso detectado
- app-ui-cart-item -> usado en 1 archivos. Ejemplos: src\app\features\client\pages\pedidos\components\orders\cart\orders-cart.page.html
- app-ui-cart-removal-modal -> usado en 1 archivos. Ejemplos: src\app\features\client\pages\pedidos\components\orders\cart\orders-cart.page.html
- app-ui-chart -> sin uso detectado
- app-ui-checkbox -> usado en 5 archivos. Ejemplos: src\app\features\admin\pages\events-promotions\components\editar-promotion-form\editar-promotion-form.html; src\app\features\admin\pages\inventory\components\agregar-form\agregar-form.html; src\app\features\admin\pages\inventory\components\editar-form\editar-form.html
- app-ui-combobox -> usado en 17 archivos. Ejemplos: src\app\features\admin\pages\events-promotions\components\agregar-producto-form\agregar-producto-form.html; src\app\features\admin\pages\events-promotions\components\agregar-promocion-dia-evento-form\agregar-promocion-dia-evento-form.html; src\app\features\admin\pages\events-promotions\components\agregar-promotion-form\agregar-promotion-form.html
- app-ui-date-time-picker -> usado en 1 archivos. Ejemplos: src\app\features\client\pages\reservas\components\reservas-disponibilidad\reservas-disponibilidad.page.html
- app-ui-empty-cart -> usado en 1 archivos. Ejemplos: src\app\features\client\pages\pedidos\components\orders\cart\orders-cart.page.html
- app-ui-form -> usado en 29 archivos. Ejemplos: src\app\features\admin\pages\events-promotions\components\agregar-dia-evento-form\agregar-dia-evento-form.html; src\app\features\admin\pages\events-promotions\components\agregar-event-form\agregar-event-form.html; src\app\features\admin\pages\events-promotions\components\agregar-producto-form\agregar-producto-form.html
- app-ui-helper-text -> usado en 26 archivos. Ejemplos: src\app\features\admin\pages\events-promotions\components\agregar-dia-evento-form\agregar-dia-evento-form.html; src\app\features\admin\pages\events-promotions\components\agregar-event-form\agregar-event-form.html; src\app\features\admin\pages\events-promotions\components\agregar-producto-form\agregar-producto-form.html
- app-ui-icon-button -> usado en 4 archivos. Ejemplos: src\app\features\admin\main-layout\main-layout.html; src\app\features\client\main-layout\main-layout.html; src\app\features\employee\main-layout\main-layout.html
- app-ui-image-upload -> usado en 2 archivos. Ejemplos: src\app\features\admin\pages\inventory\components\agregar-form\agregar-form.html; src\app\features\admin\pages\inventory\components\editar-form\editar-form.html
- app-ui-mesas-grid -> sin uso detectado
- app-ui-modal -> usado en 35 archivos. Ejemplos: src\app\features\admin\pages\events-promotions\components\agregar-dia-evento-form\agregar-dia-evento-form.html; src\app\features\admin\pages\events-promotions\components\agregar-event-form\agregar-event-form.html; src\app\features\admin\pages\events-promotions\components\agregar-producto-form\agregar-producto-form.html
- app-ui-only-icon-button -> usado en 13 archivos. Ejemplos: src\app\features\admin\pages\events-promotions\main-events-promotions\main-events-promotions.html; src\app\features\admin\pages\inventory\components\agregar-form\agregar-form.html; src\app\features\admin\pages\inventory\components\editar-form\editar-form.html
- app-ui-order-item -> usado en 1 archivos. Ejemplos: src\app\features\client\pages\pedidos\components\orders\list\orders-consolidated.page.html
- app-ui-payment-summary -> usado en 2 archivos. Ejemplos: src\app\features\admin\pages\orders\components\registrar-pago-form\registrar-pago-form.html; src\app\features\employee\pages\orders\components\registrar-pago-form\registrar-pago-form.html
- app-ui-pos-floor-mesa -> usado en 1 archivos. Ejemplos: src\app\features\employee\pages\orders\pos-floor-plan\pos-floor-plan.html
- app-ui-pos-inline-feedback -> usado en 1 archivos. Ejemplos: src\app\features\employee\pages\orders\table-sale\table-sale.html
- app-ui-pos-qty-stepper -> usado en 1 archivos. Ejemplos: src\app\features\employee\pages\orders\components\table-sale-order-lines\table-sale-order-lines.html
- app-ui-pos-table-card -> sin uso detectado
- app-ui-pos-topbar -> sin uso detectado
- app-ui-product-card -> usado en 3 archivos. Ejemplos: src\app\features\catalog\catalog.html; src\app\features\client\pages\catalogo\components\catalog-marketplace\catalog-marketplace.page.html; src\app\features\client\pages\catalogo\components\featured-products-row\featured-products-row.component.html
- app-ui-quantity-controls -> sin uso detectado
- app-ui-reservation-modal -> usado en 2 archivos. Ejemplos: src\app\features\client\pages\catalogo\components\catalog-mesas\catalog-mesas.page.html; src\app\features\client\pages\reservas\components\reservas-disponibilidad\reservas-disponibilidad.page.html
- app-ui-tabla -> usado en 14 archivos. Ejemplos: src\app\features\admin\pages\events-promotions\components\days-section\days-section.html; src\app\features\admin\pages\events-promotions\components\products-section\products-section.html; src\app\features\admin\pages\events-promotions\main-events-promotions\main-events-promotions.html
- app-ui-tabs -> usado en 9 archivos. Ejemplos: src\app\features\admin\pages\events-promotions\main-events-promotions\main-events-promotions.html; src\app\features\admin\pages\orders\main-orders\main-orders.html; src\app\features\admin\pages\statistics\main-statistics\main-statistics.html
- app-ui-toast -> usado en 3 archivos. Ejemplos: src\app\features\client\pages\catalogo\components\catalog-mesas\catalog-mesas.page.html; src\app\features\client\pages\pedidos\components\payments\register\register-payment.page.html; src\app\features\client\pages\reservas\components\reserve-table\reserve-table.page.html
- ui-breadcrumbs -> sin uso detectado
- ui-button -> usado en 57 archivos. Ejemplos: src\app\features\admin\pages\events-promotions\components\agregar-dia-evento-form\agregar-dia-evento-form.html; src\app\features\admin\pages\events-promotions\components\agregar-event-form\agregar-event-form.html; src\app\features\admin\pages\events-promotions\components\agregar-producto-form\agregar-producto-form.html
- ui-input -> usado en 35 archivos. Ejemplos: src\app\features\admin\pages\events-promotions\components\agregar-dia-evento-form\agregar-dia-evento-form.html; src\app\features\admin\pages\events-promotions\components\agregar-event-form\agregar-event-form.html; src\app\features\admin\pages\events-promotions\components\agregar-producto-form\agregar-producto-form.html
