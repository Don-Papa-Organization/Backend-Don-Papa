# Manual de Estilos: Módulo Admin

Este manual establece las directrices de diseño y desarrollo para el módulo de administración, garantizando una experiencia de usuario coherente y un código mantenible. Se basa en los componentes compartidos (`shared`) y en los patrones reales implementados en `users`, `inventory` y `orders`.

---

## 1. Principios de Diseño y Estructura

La interfaz administrativa debe priorizar la **claridad**, la **jerarquía de información** y la **facilidad de gestión**.

### Estructura de Página (Layout)
Toda página de administración debe seguir este esquema jerárquico:
1. **Header de Sección**: Título claro + acciones globales (Agregar, Recargar).
2. **Navegación (opcional)**: Componente `app-ui-tabs` para páginas con múltiples vistas.
3. **Contenido Principal**: Tabla (`ui-tabla`) para visualización masiva de datos.
4. **Capas de Gestión**: Modales (`ui-modal`) y formularios (`ui-form`) para CRUD.

> [!NOTE]
> **Justificación**: Separar la visualización (tabla) de la gestión (modales) reduce la carga cognitiva. El usuario se enfoca en una operación a la vez sin perder el contexto de la lista.

### Contenedor Base
```scss
.inventory-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  padding: 1.5rem;
  color: #ffffff;
}

.users-page {
  min-width: 785px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  color: #ffffff;
}
```

### Header Estandarizado
```scss
.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #D4AF37;

  h1 {
    font-size: 2rem;
    font-weight: 100;
    color: #ffffff;
    margin: 0;
  }

  .acciones-header {
    display: flex;
    gap: 0.75rem;
  }
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #D4AF37;

  h1 {
    font-size: 2rem;
    font-weight: 100;
    color: #ffffff;
    margin: 0;
  }

  .acciones-header {
    display: flex;
    gap: 0.75rem;
  }
}
```

---

## 2. Guía de Componentes

### Tabs (`app-ui-tabs`)
**Componente reutilizable para navegación entre vistas (usado en users para empleados, usuarios y clientes).**

Propiedades:
- `@Input() tabItems: TabItem[]` - Array de tabs con `id` y `label`
- `@Input() tabActiva: string` - ID del tab activo
- `@Output() tabChange` - Emite el ID del tab seleccionado

**Uso en HTML:**
```html
<app-ui-tabs
  [tabItems]="tabs"
  [tabActiva]="tabActiva"
  (tabChange)="cambiarTab($event)"
></app-ui-tabs>
```

**En TypeScript:**
```typescript
tabs: TabItem[] = [
  { id: 'empleados', label: 'Empleados' },
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'clientes', label: 'Clientes' }
];

cambiarTab(tabId: string): void {
  this.tabActiva = tabId;
}
```

**Nota**: No todos los módulos requieren tabs. Úsalos solo cuando haya múltiples vistas de datos.

---

### Componentes Encapsulados para Tabs Complejos

**Para tabs con lógica compleja (ej: Orders con pedidos y pagos), crear componentes separados que encapsulen toda la funcionalidad del tab.**

**Patrón implementado en Orders Module:**

```typescript
// main-orders.ts (Componente orquestador)
@ViewChild(PaymentsSectionComponent) paymentsSection!: PaymentsSectionComponent;

tabs: TabItem[] = [
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'pagos', label: 'Pagos' }
];

cambiarTab(tabId: string): void {
  this.tabActiva = tabId;
  if (this.tabActiva === 'pagos') {
    this.cargarSeccionPagos();
  }
}

// Delegación a componente hijo via @ViewChild
onAbrirModalMetodosPago(): void {
  if (this.paymentsSection) {
    this.paymentsSection.onAbrirModalMetodosPago();
  }
}
```

**HTML del componente encapsulado:**
```html
<!-- main-orders.html -->
<div *ngIf="tabActiva === 'pedidos'">
  <!-- Contenido de pedidos inline -->
  <app-ui-tabla [theadData]="columnas" [tbodyData]="pedidos"></app-ui-tabla>
</div>

<!-- TAB PAGOS - Componente completamente encapsulado -->
<app-payments-section
  *ngIf="tabActiva === 'pagos'"
  [cargandoPagos]="cargandoPagos"
  [pagosPendientes]="pagosPendientes"
  [pagosTodos]="pagosTodos"
  [metodosPago]="metodosPago"
  [metodosPagoOptions]="metodosPagoOptions"
  (recargarSeccion)="cargarSeccionPagos()"
></app-payments-section>
```

**Ventajas del patrón**:
- Separación clara de responsabilidades
- Reducción de código en el componente principal
- Facilita el testing individual de cada sección
- Permite reutilización en otros contextos

**Cuándo usar**:
- Tabs con >5 modales diferentes
- Tabs con lógica de negocio compleja (múltiples tablas, formularios anidados)
- Tabs que podrían ser reutilizados en otros módulos

---

### Gestión de Recursos con Combobox (Patrón Inventory/Orders)

**Para gestionar recursos auxiliares (categorías, métodos de pago, etc.) usa modales con combobox en lugar de tablas.**

**Estructura:**
```html
<app-ui-modal titulo="Gestionar Métodos de Pago" [mostrar]="mostrar" (cerrar)="onCerrar()">
  <app-ui-form maxHeight="50vh" maxWidth="600px">
    <app-ui-combobox
      tituloInput="Seleccionar Método"
      [options]="metodosPagoOptions"
      [(selectedOption)]="metodoPagoSeleccionadoId"
    ></app-ui-combobox>

    <ui-input
      tituloInput="Nuevo Nombre (Opcional)"
      [(ngModel)]="metodoPagoNombreEditado"
      name="metodoPagoNombreEditado"
    ></ui-input>

    <div footer style="display: flex; gap: 10px; justify-content: flex-end;">
      <ui-button
        texto="Eliminar"
        [noBackgroundColor]="true"
        [backgroundColor]="'#EF4444'"
        (accion)="eliminar()"
        [disabled]="!metodoPagoSeleccionadoId || !!metodoPagoNombreEditado"
      ></ui-button>
      <ui-button
        texto="Actualizar"
        [noBackgroundColor]="true"
        (accion)="actualizar()"
        [disabled]="!metodoPagoSeleccionadoId || !metodoPagoNombreEditado"
      ></ui-button>
    </div>
  </app-ui-form>
</app-ui-modal>
```

**Lógica en TypeScript:**
```typescript
metodoPagoSeleccionadoId: string | number | null = null;
metodoPagoNombreEditado = '';

private getMetodoPagoSeleccionado(): PaymentMethodViewModel | null {
  if (this.metodoPagoSeleccionadoId === null) return null;
  return this.metodosPago.find(m => m.idMetodoPago === this.metodoPagoSeleccionadoId) ?? null;
}

actualizar(): void {
  const metodo = this.getMetodoPagoSeleccionado();
  if (!metodo || !this.metodoPagoNombreEditado) return;
  
  const dto = { nombre: this.metodoPagoNombreEditado };
  this.facade.updatePaymentMethod(metodo.idMetodoPago, dto).subscribe({
    next: () => {
      this.cerrarModal();
      this.recargar.emit();
    }
  });
}
```

**Ventajas**:
- Interfaz más limpia sin tablas anidadas
- Menos clics para editar/eliminar
- Validación de campos mutuamente excluyentes (editar O eliminar)
- Patrón consistente con inventory

---

### Botones (`ui-button`, `app-ui-only-icon-button`)
**Usa siempre `ui-button` para acciones en formularios y `app-ui-only-icon-button` para acciones rápidas en headers.**

**Botones Condicionales en Headers (Patrón Orders):**
```html
<div class="acciones-header">
  <app-ui-only-icon-button
    urlIcono="icons/reload.svg"
    (action)="onRecargar()"
  ></app-ui-only-icon-button>

  <ng-container *ngIf="tabActiva === 'pedidos'">
    <app-ui-only-icon-button
      texto="Agregar Pedido"
      urlIcono="icons/agregar.svg"
      [showTextStyle]="true"
      (action)="onAgregar()"
    ></app-ui-only-icon-button>
  </ng-container>

  <ng-container *ngIf="tabActiva === 'pagos'">
    <app-ui-only-icon-button
      texto="Métodos de Pago"
      urlIcono="icons/agregar.svg"
      [showTextStyle]="true"
      (action)="onAgregarMetodoPago()"
    ></app-ui-only-icon-button>

    <app-ui-only-icon-button
      texto="Métodos de Pago"
      urlIcono="icons/editar.svg"
      [showTextStyle]="true"
      (action)="onAbrirModalMetodosPago()"
    ></app-ui-only-icon-button>
  </ng-container>
</div>
```

Propiedades estándar de `ui-button`:
- `texto` - Texto del botón
- `backgroundColor` - Color del botón (ej: `#D4AF37` para primario, `#EF4444` para eliminar)
- `noBackgroundColor` - Si es `true`, muestra solo borde sin fondo
- `(accion)` - Evento al hacer click

**Botones en Formularios:**
```html
<div footer class="form-footer">
  <ui-button
    texto="Guardar"
    [noBackgroundColor]="true"
    backgroundColor="#D4AF37"
    (accion)="onGuardar()"
  ></ui-button>
</div>
```

**Botones de Eliminación:**
```html
<ui-button
  texto="Eliminar Producto"
  [noBackgroundColor]="true"
  backgroundColor="#EF4444"
  (accion)="confirmarEliminacion()"
></ui-button>
```

**Icon-Buttons en Headers:**
```html
<app-ui-only-icon-button
  texto="Producto"
  urlIcono="icons/agregar.svg"
  [showTextStyle]="true"
  (action)="onAgregar()"
></app-ui-only-icon-button>

<app-ui-only-icon-button
  urlIcono="icons/reload.svg"
  (action)="cargarDatos()"
></app-ui-only-icon-button>
```

---

### Formularios (`app-ui-form`, `ui-input`, `app-ui-combobox`, `app-ui-helper-text`, `app-ui-image-upload`)
Los formularios deben ser compactos, contenidos en modales y usar validaciones con `app-ui-helper-text`.

**Estructura Base:**
```html
<app-ui-modal titulo="Agregar Nuevo Elemento" [mostrar]="mostrar" (cerrar)="onCerrar()">
  <app-ui-form maxHeight="50vh" maxWidth="1000px">
    <!-- Inputs básicos -->
    <ui-input
      tituloInput="Nombre"
      tipo="text"
      placeholder="Juan Pérez"
      [(ngModel)]="elemento.nombre"
      name="nombre"
      required
      #nombreModel="ngModel"
    ></ui-input>

    <!-- Combobox para selecciones -->
    <app-ui-combobox
      tituloInput="Categoría"
      [options]="categoriasOptions"
      [(selectedOption)]="elemento.idCategoria"
    ></app-ui-combobox>

    <!-- Carga de imagen (solo si es necesario) -->
    <app-ui-image-upload
      (archivoSeleccionado)="onArchivoSeleccionado($event)"
    ></app-ui-image-upload>

    <!-- Footer con botones -->
    <div footer class="form-footer">
      <ui-button
        texto="Guardar"
        [noBackgroundColor]="true"
        backgroundColor="#D4AF37"
        (accion)="onGuardar()"
      ></ui-button>
    </div>

    <!-- Validaciones con helper-text -->
    @if (nombreModel.invalid && nombreModel.touched) {
      <app-ui-helper-text>
        <ng-container *ngIf="nombreModel.errors?.['required']">El nombre es obligatorio.</ng-container>
      </app-ui-helper-text>
    }
  </app-ui-form>
</app-ui-modal>
```

**Componentes Disponibles:**

| Componente | Uso | Propiedades |
|-----------|-----|-------------|
| `ui-input` | Campos de texto, email, número | `tituloInput`, `tipo`, `placeholder`, `[(ngModel)]`, `required` |
| `app-ui-combobox` | Selecciones de opciones | `tituloInput`, `[options]`, `[(selectedOption)]` |
| `app-ui-image-upload` | Carga de imágenes | `(archivoSeleccionado)` |
| `app-ui-helper-text` | Mensajes de validación | Contenido en `<ng-container>` |

**Validación de Campos:**
- Usa `app-ui-helper-text` para mostrar errores debajo de inputs
- Los errores se muestran cuando el campo es `invalid` Y `touched`
- Usa sintaxis de control flow `@if` para condiciones
- NO usar arrays de errores globales en el formulario

**Placeholders Minimalistas:**
```html
<!-- ✅ Correcto -->
<ui-input placeholder="Juan Pérez"></ui-input>
<ui-input placeholder="12345678"></ui-input>
<ui-input placeholder="empleado@donpapa.com"></ui-input>

<!-- ❌ Incorrecto -->
<ui-input placeholder="Ej: Juan Pérez"></ui-input>
<ui-input placeholder="Ej: empleado@donpapa.com"></ui-input>
```

**Estilos para Footer:**
```scss
.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

app-ui-helper-text {
  margin: 0;
}
```

---

### Tablas de Datos (`app-ui-tabla`)
El componente central para mostrar listados de datos. Las tablas no son editables; los clics van a formularios en modales.

**Propiedades:**
- `theadData: string[]` - Nombres de columnas
- `tbodyData: any[]` - Array de registros
- `acciones: AccionTabla[]` - Array de acciones configurables (editar, eliminar, etc.)

**Interfaz AccionTabla:**
```typescript
export interface AccionTabla {
  urlIcono: string;
  accion: (registro: any) => void;
}
```

**Uso en Inventory:**
```html
<app-ui-tabla
  [theadData]="columnas"
  [tbodyData]="productosTableData"
  [acciones]="acciones"
></app-ui-tabla>
```

**En TypeScript:**
```typescript
acciones: AccionTabla[] = [
  {
    urlIcono: "icons/editar.svg",
    accion: (registro: any) => this.onEditar(registro)
  },
  {
    urlIcono: "icons/eliminar.svg",
    accion: (registro: any) => this.onEliminar(registro)
  }
];

onEditar(registro: any): void {
  this.registroSeleccionado = registro;
  this.mostrarModalEditar = true;
}

onEliminar(registro: any): void {
  this.registroSeleccionado = registro;
  this.mostrarModalEliminar = true;
}
```

**Uso con Tabs (Users):**
```html
@if (tabActiva === 'empleados') {
  <app-ui-tabla
    [theadData]="columnasEmpleados"
    [tbodyData]="empleados"
    [acciones]="accionesEmpleados"
  ></app-ui-tabla>
}

@if (tabActiva === 'usuarios') {
  <app-ui-tabla
    [theadData]="columnasUsuarios"
    [tbodyData]="usuarios"
    [acciones]="accionesUsuarios"
  ></app-ui-tabla>
}
```

**Configuración de Acciones Múltiples:**
```typescript
accionesEmpleados: AccionTabla[] = [
  {
    urlIcono: "icons/editar.svg",
    accion: (registro: any) => this.onActualizarEmpleado(registro)
  },
  {
    urlIcono: "icons/eliminar.svg",
    accion: (registro: any) => this.onEliminarEmpleado(registro)
  }
];

accionesUsuarios: AccionTabla[] = [
  {
    urlIcono: "icons/eye.svg",
    accion: (registro: any) => this.onVerDetalleUsuario(registro)
  }
];
```

> [!NOTE]
> **Ventaja del nuevo sistema**: Las acciones se configuran en el componente TypeScript, permitiendo personalización total (1, 2 o N acciones) sin necesidad de modificar el componente ui-tabla.

**Acciones Especiales en Tablas (Patrón Orders):**
```typescript
// Acción para descargar/previsualizar documentos
accionesTodosLosPagos: AccionTabla[] = [
  {
    urlIcono: "icons/download.svg",
    accion: (registro: PaymentViewModel) => this.onDescargarRecibo(registro)
  }
];

// Handler con prevualización
onDescargarRecibo(registro: PaymentViewModel): void {
  this.reciboSeleccionado = registro;
  this.mostrarModalPreviewRecibo = true;
  
  // Cargar PDF con SafeResourceUrl
  this.facade.getPaymentReceipt(registro.idPago).subscribe({
    next: (arrayBuffer: ArrayBuffer) => {
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      this.reciboURL = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  });
}
```

---

### Modales Avanzados

**Modales con Scroll (contenido extenso):**

El componente `ui-modal` tiene configurado por defecto:
```scss
// ui-modal.component.scss
max-height: 85vh;
overflow-y: auto;
```

Esto permite que modales con contenido extenso (formularios largos, listas de datos) sean scrolleables automáticamente sin necesidad de configuración adicional.

**Modales para Previsualización de Documentos (Patrón Orders):**

Para mostrar PDFs u otros documentos en modal con opción de descarga:

```html
<!-- Modal de Previsualización -->
<app-ui-modal
  titulo="Recibo de Pago - Pedido #{{ reciboSeleccionado?.idPedido }}"
  [mostrar]="mostrarModalPreviewRecibo"
  (cerrar)="onCerrarModalPreviewRecibo()"
>
  <div class="pdf-preview-container">
    <iframe
      *ngIf="reciboURL"
      [src]="reciboURL"
      class="pdf-viewer"
    ></iframe>
    <p *ngIf="!reciboURL" class="loading-message">Cargando recibo...</p>
  </div>

  <div footer class="form-footer">
    <ui-button
      texto="Descargar PDF"
      [noBackgroundColor]="true"
      backgroundColor="#D4AF37"
      (accion)="onDescargarReciboDirecto()"
      [disabled]="!reciboSeleccionado"
    ></ui-button>
  </div>
</app-ui-modal>
```

**Estilos para previsualización:**
```scss
.pdf-preview-container {
  width: 100%;
  height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.pdf-viewer {
  width: 100%;
  height: 100%;
  border: none;
}

.loading-message {
  color: #666;
  font-size: 1rem;
}
```

**TypeScript para manejo de documentos:**
```typescript
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export class PaymentsSectionComponent {
  reciboURL: SafeResourceUrl | null = null;
  reciboSeleccionado: PaymentViewModel | null = null;
  mostrarModalPreviewRecibo = false;

  constructor(private sanitizer: DomSanitizer, private facade: OrdersFacade) {}

  onDescargarRecibo(registro: PaymentViewModel): void {
    this.reciboSeleccionado = registro;
    this.mostrarModalPreviewRecibo = true;

    this.facade.getPaymentReceipt(registro.idPago).subscribe({
      next: (arrayBuffer: ArrayBuffer) => {
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        // IMPORTANTE: Usar DomSanitizer para evitar errores de seguridad
        this.reciboURL = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      },
      error: (err) => {
        console.error('Error al cargar recibo:', err);
        alert('No se pudo cargar el recibo');
        this.onCerrarModalPreviewRecibo();
      }
    });
  }

  onDescargarReciboDirecto(): void {
    if (!this.reciboSeleccionado) return;

    this.facade.getPaymentReceipt(this.reciboSeleccionado.idPago).subscribe({
      next: (arrayBuffer: ArrayBuffer) => {
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo_${this.reciboSeleccionado!.idPago}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  onCerrarModalPreviewRecibo(): void {
    this.mostrarModalPreviewRecibo = false;
    this.reciboSeleccionado = null;
    if (this.reciboURL) {
      // Liberar memoria
      const url = (this.reciboURL as any).changingThisBreaksApplicationSecurity;
      if (url) URL.revokeObjectURL(url);
      this.reciboURL = null;
    }
  }
}
```

**Requisitos en el Facade:**
```typescript
getPaymentReceipt(paymentId: string | number): Observable<ArrayBuffer> {
  return this.api.getPaymentReceipt(paymentId);
}

// En el servicio API
getPaymentReceipt(paymentId: string | number): Observable<ArrayBuffer> {
  return this.http.get(`${this.baseUrl}/payments/${paymentId}/receipt`, {
    responseType: 'arraybuffer'
  });
}
```

**Ventajas del patrón de previsualización:**
- Usuario ve el documento antes de descargar
- Ahorro de ancho de banda (descarga opcional)
- Mejor experiencia de usuario (no abre PDFs en nuevas pestañas)
- Manejo seguro de archivos binarios con DomSanitizer

---

## 3. Patrón de Modales Estandarizado

### Flujo Principal: Tabla → Componente Específico
El flujo elimina modales innecesarios de "detalle":

1. **Click en tabla (editar)** → Abre **componente de actualizar específico** (en modal)
2. **Click en tabla (eliminar)** → Abre **modal de confirmación inline**

**Ejemplo en Inventory:**
```html
<!-- TABLA PRINCIPAL -->
<app-ui-tabla
  [theadData]="columnas"
  [tbodyData]="productosTableData"
  [acciones]="acciones"
></app-ui-tabla>

<!-- COMPONENTE AGREGAR (con su propio modal interno) -->
<app-agregar-form
  [mostrar]="mostrarModalAgregar"
  [categoriasOptions]="categoriasOptions"
  (cerrar)="cerrarModalAgregar()"
  (productoCreado)="onProductoCreado($event)"
></app-agregar-form>

<!-- COMPONENTE EDITAR (con su propio modal interno) -->
<app-editar-form
  [mostrar]="mostrarModalEditar"
  [categoriasOptions]="categoriasOptions"
  [registroSeleccionado]="registroSeleccionado"
  (cerrar)="cerrarModalEditar()"
  (productoActualizado)="onProductoActualizado($event)"
></app-editar-form>

<!-- MODAL DE CONFIRMACIÓN (inline en main) -->
@if (mostrarModalEliminar) {
  <app-ui-modal
    titulo="¿Desea eliminar producto?"
    [mostrar]="mostrarModalEliminar"
    (cerrar)="cerrarModalEliminar()"
  >
    <ui-button
      texto="Eliminar Producto"
      [noBackgroundColor]="true"
      backgroundColor="#EF4444"
      (accion)="eliminarProducto()"
    ></ui-button>
  </app-ui-modal>
}
```

**Ejemplo en Users:**
```html
<!-- TABLA -->
@if (tabActiva === 'empleados') {
  <app-ui-tabla
    [theadData]="columnasEmpleados"
    [tbodyData]="empleados"
    [acciones]="accionesEmpleados"
  ></app-ui-tabla>
}

<!-- COMPONENTES FORMULARIO (con modales internos) -->
<app-agregar-employee-form
  [mostrar]="mostrarModalAgregarEmpleado"
  (cerrar)="cerrarModalAgregarEmpleado()"
  (empleadoCreado)="onEmpleadoCreado($event)"
></app-agregar-employee-form>

<app-actualizar-employee-form
  [mostrar]="mostrarModalActualizarEmpleado"
  [empleado]="empleadoSeleccionado"
  (cerrar)="cerrarModalActualizarEmpleado()"
  (empleadoActualizado)="onEmpleadoActualizado($event)"
></app-actualizar-employee-form>

<!-- MODAL CONFIRMACIÓN ELIMINAR (inline) -->
@if (mostrarModalEliminarEmpleado) {
  <app-ui-modal
    [mostrar]="mostrarModalEliminarEmpleado"
    titulo="¿Desea eliminar empleado?"
    (cerrar)="cerrarModalEliminarEmpleado()"
  >
    <div class="contenido-eliminacion">
      <p>¿Estás seguro de que deseas eliminar a <strong>{{ empleadoSeleccionado?.nombre }}</strong>?</p>
      <p class="advertencia">Esta acción desactivará el empleado en el sistema.</p>
      
      <div class="acciones-eliminacion">
        <ui-button
          texto="Eliminar Empleado"
          [noBackgroundColor]="true"
          backgroundColor="#EF4444"
          (accion)="confirmarEliminacionEmpleado()"
        ></ui-button>
      </div>
    </div>
  </app-ui-modal>
}
```

### Estructura de Componentes Formulario

Los componentes `agregar-*-form` y `actualizar-*-form` **tienen su propio modal interno** usando `app-ui-modal`.

**Componente Agregar (agregar-employee-form.ts):**
```typescript
@Component({
  selector: 'app-agregar-employee-form',
  templateUrl: './agregar-employee-form.html',
  styleUrl: './agregar-employee-form.scss'
})
export class AgregarEmployeeForm {
  @Input() mostrar = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() empleadoCreado = new EventEmitter<CreateEmployeeRequestDto>();

  empleadoNuevo = {
    nombre: '',
    documento: '',
    correo: '',
    telefono: '',
    cargo: '',
    contrasena: '',
    confirmarContrasena: ''
  };

  onGuardar(): void {
    const dto: CreateEmployeeRequestDto = {
      nombre: this.empleadoNuevo.nombre.trim(),
      documento: this.empleadoNuevo.documento.trim(),
      correo: this.empleadoNuevo.correo.trim(),
      telefono: this.empleadoNuevo.telefono.trim(),
      cargo: this.empleadoNuevo.cargo.trim(),
      contrasena: this.empleadoNuevo.contrasena
    };
    this.empleadoCreado.emit(dto);
    this.resetForm();
  }

  onCerrar(): void {
    this.resetForm();
    this.cerrar.emit();
  }

  private resetForm(): void {
    this.empleadoNuevo = { /* reset */ };
  }
}
```

**Template del Componente (agregar-employee-form.html):**
```html
<app-ui-modal
  [mostrar]="mostrar"
  titulo="Agregar Nuevo Empleado"
  (cerrar)="onCerrar()"
>
  <app-ui-form maxHeight="50vh" maxWidth="1000px">
    <ui-input
      tituloInput="Nombre Completo"
      tipo="text"
      placeholder="Juan Pérez"
      [(ngModel)]="empleadoNuevo.nombre"
      name="nombre"
      required
      #nombreModel="ngModel"
    ></ui-input>

    <!-- Más inputs... -->

    <div footer class="form-footer">
      <ui-button
        texto="Guardar Empleado"
        [noBackgroundColor]="true"
        backgroundColor="#D4AF37"
        (accion)="onGuardar()"
      ></ui-button>
    </div>

    <app-ui-helper-text *ngIf="nombreModel.invalid && nombreModel.touched">
      <ng-container *ngIf="nombreModel.errors?.['required']">El nombre es obligatorio.</ng-container>
    </app-ui-helper-text>
  </app-ui-form>
</app-ui-modal>
```

### Modal de Confirmación (Eliminar)
Modal simple inline en el componente main. **No es un componente separado**.

```html
@if (mostrarModalEliminar) {
  <app-ui-modal
    [mostrar]="mostrarModalEliminar"
    titulo="¿Desea eliminar empleado?"
    (cerrar)="cerrarModalEliminar()"
  >
    <div class="contenido-eliminacion">
      <p>¿Estás seguro de que deseas eliminar a <strong>{{ empleadoSeleccionado?.nombre }}</strong>?</p>
      <p class="advertencia">Esta acción desactivará el registro en el sistema.</p>
      
      <div class="acciones-eliminacion">
        <ui-button
          texto="Eliminar"
          [noBackgroundColor]="true"
          backgroundColor="#EF4444"
          (accion)="confirmarEliminacion()"
        ></ui-button>
      </div>
    </div>
  </app-ui-modal>
}
```

**Estilos para contenido eliminación:**
```scss
.contenido-eliminacion {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;

  p {
    margin: 0;
    color: #ffffff;

    &.advertencia {
      font-size: 1rem;
      color: #999;
    }
  }

  strong {
    color: #D4AF37;
  }
}

.acciones-eliminacion {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-start;
  margin-top: 1rem;
}
```

---

## 4. Comunicación entre Componentes

### Patrón @Input/@Output (Padre → Hijo → Padre)

**Uso estándar para componentes de formulario:**

```typescript
// Componente Hijo (agregar-employee-form.ts)
@Component({
  selector: 'app-agregar-employee-form',
  templateUrl: './agregar-employee-form.html'
})
export class AgregarEmployeeForm {
  @Input() mostrar = false;  // Padre controla visibilidad
  @Output() cerrar = new EventEmitter<void>();  // Hijo notifica cierre
  @Output() empleadoCreado = new EventEmitter<CreateEmployeeRequestDto>();  // Hijo envía datos

  onGuardar(): void {
    const dto: CreateEmployeeRequestDto = { /* ... */ };
    this.empleadoCreado.emit(dto);  // Emitir al padre
  }

  onCerrar(): void {
    this.cerrar.emit();  // Notificar cierre
  }
}
```

```html
<!-- Componente Padre (main-users.html) -->
<app-agregar-employee-form
  [mostrar]="mostrarModalAgregarEmpleado"
  (cerrar)="cerrarModalAgregarEmpleado()"
  (empleadoCreado)="onEmpleadoCreado($event)"
></app-agregar-employee-form>
```

```typescript
// Componente Padre (main-users.ts)
mostrarModalAgregarEmpleado = false;

cerrarModalAgregarEmpleado(): void {
  this.mostrarModalAgregarEmpleado = false;
}

onEmpleadoCreado(dto: CreateEmployeeRequestDto): void {
  this.facade.createEmployee(dto).subscribe({
    next: () => {
      this.cerrarModalAgregarEmpleado();
      this.cargarEmpleados();  // Recargar datos
    }
  });
}
```

---

### Patrón @ViewChild (Padre accede a métodos del Hijo)

**Uso para componentes encapsulados que exponen métodos públicos (Patrón Orders):**

Este patrón se usa cuando un **componente hijo maneja su propia lógica interna** y el padre solo necesita invocar acciones específicas del hijo sin conocer sus detalles internos.

**Cuándo usar @ViewChild:**
- Hijo tiene múltiples modales internos y lógica compleja
- Padre solo necesita disparar acciones del hijo (abrir modales, ejecutar métodos)
- Se quiere evitar pasar muchos @Input para estados internos del hijo

**Ejemplo completo (Orders Module):**

```typescript
// Componente Hijo Encapsulado (payments-section.ts)
@Component({
  selector: 'app-payments-section',
  templateUrl: './payments-section.html'
})
export class PaymentsSectionComponent {
  // Props de entrada (solo datos, no estado de modales)
  @Input() cargandoPagos = false;
  @Input() pagosPendientes: PendingPaymentOrderViewModel[] = [];
  @Input() pagosTodos: PaymentViewModel[] = [];
  @Input() metodosPago: PaymentMethodViewModel[] = [];
  @Input() metodosPagoOptions: Array<{ value: any; label: string }> = [];

  // Evento de salida para recargar datos en el padre
  @Output() recargarSeccion = new EventEmitter<void>();

  // Estado interno de modales (padre NO controla esto)
  mostrarModalAgregarMetodoPago = false;
  mostrarModalMetodosPago = false;
  mostrarModalRegistrarPago = false;
  mostrarModalPreviewRecibo = false;

  // Métodos públicos que el padre puede llamar via @ViewChild
  onAbrirModalMetodosPago(): void {
    this.mostrarModalMetodosPago = true;
  }

  onAgregarMetodoPago(): void {
    this.mostrarModalAgregarMetodoPago = true;
  }

  // Métodos privados de lógica interna
  private onMetodoPagoCreado(dto: CreatePaymentMethodRequestDto): void {
    this.facade.createPaymentMethod(dto).subscribe({
      next: () => {
        this.mostrarModalAgregarMetodoPago = false;
        this.recargarSeccion.emit();  // Notifica al padre
      }
    });
  }
}
```

```typescript
// Componente Padre (main-orders.ts)
import { ViewChild } from '@angular/core';

export class MainOrders {
  // Referencia al componente hijo
  @ViewChild(PaymentsSectionComponent) paymentsSection!: PaymentsSectionComponent;

  // Props que se pasan al hijo
  cargandoPagos = false;
  pagosPendientes: PendingPaymentOrderViewModel[] = [];
  metodosPago: PaymentMethodViewModel[] = [];
  metodosPagoOptions: Array<{ value: any; label: string }> = [];

  // Llamar método del hijo directamente
  onAbrirModalMetodosPago(): void {
    if (this.paymentsSection) {
      this.paymentsSection.onAbrirModalMetodosPago();  // Invoca método público del hijo
    }
  }

  onAgregarMetodoPago(): void {
    if (this.paymentsSection) {
      this.paymentsSection.onAgregarMetodoPago();
    }
  }

  // Handler cuando el hijo emite evento de recarga
  cargarSeccionPagos(): void {
    this.cargandoPagos = true;
    forkJoin({
      pendientes: this.facade.getPendingPaymentOrders(),
      metodosPago: this.facade.getPaymentMethods(),
      // ...
    }).subscribe({
      next: (data) => {
        this.pagosPendientes = data.pendientes;
        this.metodosPago = data.metodosPago;
        this.metodosPagoOptions = data.metodosPago.map(m => ({
          value: m.idMetodoPago,
          label: m.nombre
        }));
        this.cargandoPagos = false;
      }
    });
  }
}
```

```html
<!-- Componente Padre (main-orders.html) -->
<div class="acciones-header">
  <!-- Botones en header que invocan métodos del hijo -->
  <ng-container *ngIf="tabActiva === 'pagos'">
    <app-ui-only-icon-button
      texto="Agregar Método"
      urlIcono="icons/agregar.svg"
      [showTextStyle]="true"
      (action)="onAgregarMetodoPago()"
    ></app-ui-only-icon-button>

    <app-ui-only-icon-button
      texto="Gestionar Métodos"
      urlIcono="icons/editar.svg"
      [showTextStyle]="true"
      (action)="onAbrirModalMetodosPago()"
    ></app-ui-only-icon-button>
  </ng-container>
</div>

<!-- Componente hijo con referencia @ViewChild -->
<app-payments-section
  *ngIf="tabActiva === 'pagos'"
  [cargandoPagos]="cargandoPagos"
  [pagosPendientes]="pagosPendientes"
  [pagosTodos]="pagosTodos"
  [metodosPago]="metodosPago"
  [metodosPagoOptions]="metodosPagoOptions"
  (recargarSeccion)="cargarSeccionPagos()"
></app-payments-section>
```

**Ventajas de @ViewChild:**
- **Encapsulación completa**: El hijo maneja todos sus modales y lógica interna
- **Interface limpia**: El padre solo conoce los métodos públicos necesarios
- **Reducción de código**: Elimina decenas de @Input booleanos para estados de modales
- **Reutilización**: El hijo puede usarse en otros contextos sin cambios
- **Testing**: Facilita testing unitario del componente hijo aisladamente

**Comparación:**

| Patrón | Cuándo Usar | Ejemplo |
|--------|-------------|---------|
| **@Input/@Output** | Formularios simples con 1-2 modales | `agregar-employee-form`, `editar-product-form` |
| **@ViewChild** | Componentes complejos con múltiples modales y lógica interna | `payments-section` (5 modales internos) |

**Regla de decisión:**
- **≤ 2 modales**: Usa @Input/@Output
- **> 2 modales o lógica compleja**: Usa @ViewChild + componente encapsulado

---

## 5. Flujo de Trabajo para Nueva Página Administrativa

### Estructura de Carpetas
```
pages/
  nuevo-modulo/
    components/
      agregar-form/
        agregar-form.html
        agregar-form.scss
        agregar-form.ts
      editar-form/
        editar-form.html
        editar-form.scss
        editar-form.ts
    main-nuevo-modulo/
      main-nuevo-modulo.html
      main-nuevo-modulo.scss
      main-nuevo-modulo.ts
    services/
      nuevo-modulo.facade.ts
    nuevo-modulo-module.ts
    nuevo-modulo-routing-module.ts
```

### Flujo Optimizado
```
main-nuevo-modulo.ts (Orquestador principal)
  ├─ Header + Botones (app-ui-only-icon-button)
  ├─ [Tabs] (solo si hay múltiples vistas)
  ├─ Tabla (app-ui-tabla)
  ├─ [Click Editar] → agregar-form (componente con modal interno)
  ├─ [Click Actualizar] → editar-form (componente con modal interno)
  └─ [Click Eliminar en tabla] → Modal Confirmación (inline)
```

### Checklist de Implementación

Para validar que una página sigue los estándares:

- [ ] Contenedor principal con clase `.{modulo}-page` y estilos flexbox
- [ ] Header con h1 (font-weight 100, color blanco), border-bottom dorado
- [ ] Header con `.acciones-header` para botones
- [ ] Botones usando `app-ui-only-icon-button` en header (Agregar, Recargar)
- [ ] Tabla (`app-ui-tabla`) con columnas bien definidas
- [ ] **Flujo tabla → Componentes de formulario específicos**
- [ ] Componentes `agregar-*-form.component` con modal interno (`app-ui-modal`)
- [ ] Componentes `actualizar-*-form.component` con modal interno (`app-ui-modal`)
- [ ] Modal de Confirmación eliminar **inline en main** (no componente separado)
- [ ] Botones usando `ui-button` con propiedades estándar
- [ ] Validaciones con `app-ui-helper-text` en formularios
- [ ] Placeholders minimalistas (sin "Ej:")
- [ ] Estilos de `.form-footer` en componentes de formulario
- [ ] [Opcional] Tabs (`app-ui-tabs`) solo si hay múltiples vistas
- [ ] Lógica de API delegada al Facade (no en componentes)

---

## 5. Palette de Colores Estandarizada

| Elemento | Color | Código |
|----------|-------|--------|
| Primario/Dorado | Dorado Don Papa | `#D4AF37` |
| Fondo | Oscuro | `#1a1a1a` |
| Texto Principal | Blanco | `#ffffff` |
| Texto Secundario | Gris | `#999999` |
| Error/Alerta | Rojo | `#EF4444` |
| Éxito | Verde | `#10B981` |
| Advertencia | Amarillo | `#FBBF24` |
| Border | Dorado | `#D4AF37` |

---

## 6. Checklist de Implementación

Para validar que una página sigue los estándares:

- [ ] Contenedor principal con clase `.{modulo}-page` y estilos flexbox
- [ ] Header con h1 (font-weight 100, color blanco), border-bottom dorado
- [ ] Header con `.acciones-header` para botones (recargar, agregar, etc.)
- [ ] Botones en header usando `app-ui-only-icon-button`
- [ ] Tabla (`app-ui-tabla`) con columnas bien definidas
- [ ] **Flujo tabla → Componentes de formulario específicos** (sin modal de detalle)
- [ ] Componentes `agregar-*-form.ts` con modal interno (`app-ui-modal`)
- [ ] Componentes `actualizar-*-form.ts` (si aplica) con modal interno (`app-ui-modal`)
- [ ] Modal de Confirmación Eliminar **inline en main** (no componente separado)
- [ ] Botones usando `ui-button` en formularios
- [ ] Validaciones con `app-ui-helper-text` (no alerts, no arrays de errores)
- [ ] Placeholders minimalistas (sin "Ej:")
- [ ] Estilos de `.form-footer` en componentes de formulario
- [ ] [Opcional] Tabs (`app-ui-tabs`) solo si hay múltiples vistas
- [ ] Lógica de API delegada al Facade (no en componentes)

> [!IMPORTANT]
> Mantén la lógica de API fuera de los componentes de UI. Los componentes deben orquestar la vista, delegando persistencia al Facade.

---

## 7. Referencias de Implementación

| Módulo | Ruta | Patrón Destacado |
|--------|------|------------------|
| **Inventory** | `/features/admin/pages/inventory/` | Componentes formulario con modal interno, gestión de recursos con combobox |
| **Users** | `/features/admin/pages/users/` | Tabs + múltiples tablas, empleados y usuarios |
| **Orders** | `/features/admin/pages/orders/` | **@ViewChild + componente encapsulado** (`payments-section`), PDF preview, gestión con combobox |

**Patrones específicos por referencia:**

### Inventory Module
- ✅ Componentes `agregar-form` y `editar-form` con modales internos
- ✅ Modal de confirmación eliminar inline
- ✅ Gestión de categorías con combobox (no tabla)
- ✅ Two-button structure (agregar + gestionar)

### Users Module  
- ✅ Tabs para empleados y usuarios
- ✅ Múltiples tablas con acciones diferentes por tab
- ✅ Componentes de formulario especializados por entidad

### Orders Module (NUEVO)
- ✅ **@ViewChild** para comunicación padre-hijo programática
- ✅ **Componente encapsulado** (`PaymentsSectionComponent`) con 5 modales internos
- ✅ **PDF Preview** con `DomSanitizer` y `SafeResourceUrl`
- ✅ **Modal con scroll** (max-height: 85vh, overflow-y: auto)
- ✅ **Gestión de métodos de pago** con combobox (patrón inventory)
- ✅ **Two-button structure** para métodos de pago (agregar + gestionar)
- ✅ **Acción de descarga/preview** en tabla con icono download
- ✅ **Separación clara**: padre carga datos, hijo maneja UI

**Usa Orders Module como referencia para:**
- Tabs complejos que requieren encapsulación
- Previsualización de documentos (PDF, imágenes)
- Componentes con múltiples modales internos (>3)
- Comunicación programática padre-hijo con @ViewChild
- Manejo seguro de archivos binarios con DomSanitizer

