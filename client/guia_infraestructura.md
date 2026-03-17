# Estructura Modular del Sistema - Don Papa

## 1. Principios Arquitectónicos Generales

### 1.1 Independencia e Replicabilidad
- Cada módulo debe ser **independiente de su implementación específica** pero adherir a patrones comunes
- La estructura debe ser **replicable en otros contextos** dentro del mismo sistema sin necesidad de modificaciones estructurales
- Los módulos deben ser agnósticos respecto a los DTOs específicos utilizados
- Se establece un **contrato común** que todos los módulos deben cumplir

### 1.2 Separación de Responsabilidades
- **Domain Layer**: Define modelos de negocio y contratos de datos (DTOs)
- **Feature Layer**: Implementa la lógica de presentación y orquestación
- **Shared Layer**: Proporciona componentes reutilizables
- **Services Layer**: Gestiona la comunicación con APIs

### 1.3 Jerarquía de Dependencias
```
Main Component (Página Principal)
    ├── Facade Service (Orquestación)
    │   └── API Service (Comunicación)
    ├── Child Components (Formularios, Modales)
    └── Shared Components (UI Reusable)
```

---

## 2. Estructura Modular de Inventory (Caso de Estudio)

### 2.1 Descripción General del Módulo
**Propósito**: Gestión integral del inventario de productos y categorías

**Responsabilidades**:
- Listar productos con información completa
- Crear nuevos productos
- Actualizar información de productos
- Eliminar productos
- Gestionar categorías de productos

**Contexto**: Módulo administrativo accesible solo a usuarios con rol de administrador

### 2.2 Estructura de Directorios

```
inventory/
├── inventory-module.ts                    # ⭐ Punto de entrada del módulo
├── inventory-routing-module.ts            # Configuración de rutas
├── main-inventory/                        # 🔴 BLOQUE PRINCIPAL
│   ├── main-inventory.ts                 # Componente orquestador principal
│   ├── main-inventory.html               # Template de la página
│   ├── main-inventory.scss               # Estilos específicos
│   └── main-inventory.spec.ts            # Tests unitarios
├── components/                            # 🟡 BLOQUES MODULARES
│   ├── agregar-form/                     # Formulario de creación
│   │   ├── agregar-form.ts
│   │   ├── agregar-form.html
│   │   ├── agregar-form.scss
│   │   └── agregar-form.spec.ts
│   └── editar-form/                      # Formulario de edición
│       ├── editar-form.ts
│       ├── editar-form.html
│       ├── editar-form.scss
│       └── editar-form.spec.ts
└── services/                              # 🟢 CAPA DE SERVICIOS
    └── inventory.facade.ts               # Orquestador de negocio
```

---

## 3. Componentes y Sus Responsabilidades

### 3.1 BLOQUE PRINCIPAL: MainInventory (main-inventory/)

**Responsabilidad**: Orquestación de la página principal de inventario

**Configuración del Componente**:
```typescript
@Component({
  selector: 'app-main-inventory',
  templateUrl: './main-inventory.html',
  styleUrls: ['./main-inventory.scss'],
  standalone: false  // ⚠️ OBLIGATORIO: Todos los componentes deben declararse con standalone: false
})
```

**Características**:
- **Dependencia directa** de: Facade Service, API Service
- **Gestiona el estado visual** de:
  - Tabla de productos
  - Estados de modales (agregar, editar, eliminar)
  - Registro seleccionado actual
- **Es el coordinador central** que delegará en componentes hijos

**Estructura de Datos Esperada**:
```typescript
// DTO de Domain (REQUERIDO)
- Producto extends BaseEntity
- CreateProductRequestDto
- UpdateProductRequestDto
- CreateCategoryRequestDto
- UpdateCategoryRequestDto

// ViewModel Local (para presentación)
- ProductViewModel (mapeo de Producto para la tabla)
```

**Métodos Críticos**:
```typescript
ngOnInit()              // Carga inicial de datos
cargarProductos()       // Obtiene lista de productos
cargarCategorias()      // Obtiene lista de categorías
onAgregar()            // Abre modal de creación
onEditar(registro)     // Abre modal de edición
onEliminar(registro)   // Abre modal de confirmación
onProductoCreado()     // Callback cuando se crea producto
onProductoActualizado()// Callback cuando se actualiza producto
onProductoEliminado()  // Callback cuando se elimina producto
```

### 3.2 BLOQUES MODULARES: Componentes (components/)

#### 3.2.1 AgregarForm (agregar-form/)
**Responsabilidad**: Capturar datos para crear nuevos productos

**Configuración del Componente**:
```typescript
@Component({
  selector: 'app-agregar-form',
  templateUrl: './agregar-form.html',
  styleUrls: ['./agregar-form.scss'],
  standalone: false  // ⚠️ OBLIGATORIO: Todos los componentes deben declararse con standalone: false
})
```

**Contrato de Comunicación**:
```typescript
// INPUTS (Datos que recibe del padre)
@Input() mostrar: boolean              // Control de visibilidad
@Input() categoriasOptions: []         // Lista de categorías disponibles
@Input() showTextStyle: boolean        // Estilo de presentación

// OUTPUTS (Eventos que emite al padre)
@Output() cerrar = EventEmitter       // Señal para cerrar modal
@Output() productoCreado = EventEmitter<{
    dto: CreateProductRequestDto,
    imagen: File | null
}>                                     // Señal con datos del nuevo producto
```

**Dependencias Internas**:
- Componente UiImageUpload (de shared)
- DTOs de Domain (CreateProductRequestDto)

**Validaciones Esperadas**:
- Campos obligatorios no vacíos
- Precio y stocks > 0
- Categoría válida si es requerida
- Imagen válida (formato y tamaño)

#### 3.2.2 EditarForm (editar-form/)
**Responsabilidad**: Capturar datos para actualizar productos existentes

**Configuración del Componente**:
```typescript
@Component({
  selector: 'app-editar-form',
  templateUrl: './editar-form.html',
  styleUrls: ['./editar-form.scss'],
  standalone: false  // ⚠️ OBLIGATORIO: Todos los componentes deben declararse con standalone: false
})
```

**Contrato de Comunicación**:
```typescript
// INPUTS
@Input() mostrar: boolean              // Control de visibilidad
@Input() registroSeleccionado: any     // Producto a editar (del domain)
@Input() categoriasOptions: []         // Lista de categorías
@Input() showTextStyle: boolean        // Estilo de presentación

// OUTPUTS
@Output() cerrar = EventEmitter       // Señal para cerrar modal
@Output() productoActualizado = EventEmitter<
    UpdateProductRequestDto
>                                      // Señal con datos actualizados
```

**Diferencias con AgregarForm**:
- Recibe un producto pre-existente
- Mapea datos del producto a campos del formulario
- Puede permitir edición selectiva de campos

---

## 4. CAPA DE SERVICIOS

### 4.1 Inventory Facade Service (services/inventory.facade.ts)

**Propósito**: Orquestar operaciones de negocio complejas y abstraer la complejidad

**Responsabilidades**:
- Combinar múltiples llamadas API (ej: productos + categorías)
- Mapear DTOs de Domain a ViewModels para presentación
- Encapsular lógica de transformación de datos
- Proporcionar métodos de alto nivel al componente principal

**Métodos Base**:
```typescript
// Lectura de datos
getProductsWithCategories(): Observable<ProductViewModel[]>
getCategories(): Observable<Categoria[]>

// Escritura de datos (delegados al API)
createProduct(dto: CreateProductRequestDto): Observable<ApiResponse>
updateProduct(id: number, dto: UpdateProductRequestDto): Observable<ApiResponse>
deleteProduct(id: number): Observable<ApiResponse>

// Transformación de datos
mapToViewModel(producto: Producto): ProductViewModel
mapToDto(formData: any): CreateProductRequestDto | UpdateProductRequestDto
```

### 4.2 Inventory API Service (servicios/apis/inventory.api.ts)

**Propósito**: Comunicación HTTP con el backend

**Responsabilidades**:
- Ejecutar llamadas HTTP
- Manejo de errores de red
- Retornar respuestas tipadas (ApiResponse<T>)

---

## 5. Requisitos y Señalamientos Críticos

### ✅ REQUISITOS DE ESTRUCTURA

#### R1: Modelo de Dependencia
```
✓ MainInventory -> Facade
✓ Facade -> InventoryApi
✓ AgregarForm -> Nada (es puro presentación + validación)
✓ EditarForm -> Nada (es puro presentación + validación)

✗ AgregarForm -> NO debe llamar APIs directamente
✗ EditarForm -> NO debe llamar APIs directamente
```

#### R2: Tipado con DTOs de Domain
- **OBLIGATORIO**: Todo dato intercambiado debe usar DTOs del paquete `domain/`
- **PROHIBIDO**: Crear DTOs ad-hoc en la capa de features
- **PATRÓN**: `domain/inventory/dtos/` contiene:
  ```
  - CreateProductRequestDto
  - UpdateProductRequestDto
  - CreateCategoryRequestDto
  - UpdateCategoryRequestDto
  - (y sus respuestas correspondientes)
  ```

#### R3: ViewModels Locales Permitidos
- Se puede crear ViewModels **específicos para presentación** en el Facade
- Estos ViewModels mapean DTOs de Domain a formatos de tabla/lista
- Ejemplo: `ProductViewModel` (tiene campos como `nombreCategoria` para mostrar)

#### R4: Comunicación Componente-Padre
- Solo a través de **@Input y @Output**
- **PROHIBIDO**: Inyectar servicios en componentes presentacionales (AgregarForm, EditarForm, etc.)
- El padre es responsable de la orquestación.

> [!CAUTION]
> **Anti-patrón Crítico (Detectado en Events-Promotions)**:
> Inyectar un Facade o API Service directamente en un formulario (`AgregarForm`, `EditarForm`).
> 
> **Consecuencias**:
> - Rompe la reutilización del componente.
> - Dificulta el testing (requiere mocks complejos para componentes simples).
> - Genera inconsistencias en el flujo de datos (el padre pierde el control de cuándo recargar/cerrar).
> 
> **Solución Correcta**:
> El formulario captura los datos, valida y hace `@Output().emit(dto)`. El componente "Main" recibe el evento, llama al Facade y gestiona el éxito o error.

#### R5: Responsabilidad del Componente Principal
```typescript
class MainInventory {
    // ✓ Gestiona estado UI
    mostrarModalAgregar: boolean;
    registroSeleccionado: any;
    
    // ✓ Inyecta servicios
    constructor(private facade: InventoryFacade) {}
    
    // ✓ Coordina operaciones
    onProductoCreado(evento) {
        this.facade.createProduct(evento.dto).subscribe(...)
    }
    
    // ✓ Actualiza datos después de cambios
    cargarProductos() { ... }
}
```

#### R6: Estructura de Routing
```typescript
// inventory-routing-module.ts
const routes: Routes = [
  {
    path: '',
    component: MainInventory,
    canActivate: [RoleGuard],
    data: { requiredRoles: ['ADMIN'] }
  }
];
```

---

## 6. Flujo de Datos (Data Flow)

### 6.1 Creación de Producto
```
Usuario hace click "Agregar"
    ↓
MainInventory.onAgregar() -> abre modal AgregarForm
    ↓
Usuario llena formulario y confirma
    ↓
AgregarForm.@Output(productoCreado).emit({dto, imagen})
    ↓
MainInventory.onProductoCreado(evento)
    ↓
InventoryFacade.createProduct(dto) -> API
    ↓
Respuesta exitosa
    ↓
MainInventory.cargarProductos() -> refresca tabla
```

### 6.2 Actualización de Producto
```
Usuario hace click editar en registro
    ↓
MainInventory.onEditar(registro)
    ↓
Abre modal EditarForm con datos pre-cargados
    ↓
Usuario modifica datos
    ↓
EditarForm.@Output(productoActualizado).emit(dto)
    ↓
MainInventory.onProductoActualizado(evento)
    ↓
InventoryFacade.updateProduct(id, dto) -> API
    ↓
Respuesta exitosa
    ↓
MainInventory.cargarProductos() -> refresca tabla
```

---
TODOS los componentes tienen `standalone: false` en el decorador @Component**
- [ ] **
## 7. Checklist de Cumplimiento

Al crear un nuevo módulo (ej: Orders, Users, Events) sigue este checklist:

- [ ] Directorio `main-{modulo}/` contiene componente orquestador
- [ ] Directorio `components/` contiene solo componentes presentacionales
- [ ] Directorio `services/` contiene Facade (orquestador) y Opcionalmente DTOs adaptadores
- [ ] Archivo `{modulo}-module.ts` importa y declara todos los componentes
- [ ] Archivo `{modulo}-routing-module.ts` define rutas con guards si aplica
- [ ] **Facade inyectado SOLO en componente principal**
- [ ] Componentes hijos comunican via @Input/@Output únicamente
- [ ] DTOs vienen de `domain/{modulo}/`
- [ ] ViewModels (mapeos) definidos en el Facade, no en componentes
- [ ] Métodos del Facade son Observable-based (RxJS)
- [ ] Componentes principales usan OnInit para cargar datos iniciales

---

## 8. Componentes Encapsulados con @ViewChild (Patrón Avanzado)

### 8.1 Cuándo Usar Componentes Encapsulados

**Indicadores de necesidad:**
- Tab o sección con **> 3 modales diferentes** (ej: `Orders`, `Events-Promotions`)
- Lógica de UI compleja que **no debe estar en el componente principal**
- **Reutilización potencial** de la sección en otros contextos
- Estado interno complejo que el padre no necesita controlar

**Comparación de patrones:**

| Característica | @Input/@Output | @ViewChild + Encapsulado |
|----------------|----------------|--------------------------|
| Modales manejados | 1-2 | 3+ |
| Estado interno | Controlado por padre | Autónomo en hijo |
| Complejidad lógica | Baja-Media | Alta |
| Líneas de código en padre | < 200 | Reducción de 100-200 líneas |
| Testing | Simple (padre controla todo) | Más robusto (hijo independiente) |

### 8.2 Estructura de Componente Encapsulado (Caso Orders)

**Ejemplo: PaymentsSectionComponent en Orders**

```
orders/
├── main-orders/                           # 🔴 COMPONENTE PRINCIPAL
│   ├── main-orders.ts                    # Orquestador principal (341 líneas)
│   ├── main-orders.html
│   └── main-orders.scss
├── components/
│   ├── payments-section/                  # 🔵 COMPONENTE ENCAPSULADO
│   │   ├── payments-section.ts           # Maneja toda la lógica de pagos (227 líneas)
│   │   ├── payments-section.html
│   │   └── payments-section.scss
│   ├── agregar-metodo-pago-form/         # Formulario auxiliar
│   └── registrar-pago-form/            ,
  standalone: false  // ⚠️ OBLIGATORIO en todos los componentes  # Formulario auxiliar
└── services/
    └── orders.facade.ts
```

### 8.3 Contrato del Componente Encapsulado

**Componente Hijo (payments-section.ts):**
```typescript
@Component({
  selector: 'app-payments-section',
  templateUrl: './payments-section.html'
})
export class PaymentsSectionComponent implements OnInit {
  // ⭐ SOLO DATOS - El padre pasa props de entrada
  @Input() cargandoPagos = false;
  @Input() pagosPendientes: PendingPaymentOrderViewModel[] = [];
  @Input() pagosTodos: PaymentViewModel[] = [];
  @Input() metodosPago: PaymentMethodViewModel[] = [];
  @Input() metodosPagoOptions: Array<{ value: any; label: string }> = [];

  // ⭐ EVENTOS - El hijo notifica al padre para recargar
  @Output() recargarSeccion = new EventEmitter<void>();

  // ✅ ESTADO INTERNO - El padre NO controla estos estados
  private mostrarModalAgregarMetodoPago = false;
  private mostrarModalMetodosPago = false;
  private mostrarModalRegistrarPago = false;
  private mostrarModalPreviewRecibo = false;
  
  // Estado de selección interna
  private reciboSeleccionado: PaymentViewModel | null = null;
  private reciboURL: SafeResourceUrl | null = null;
  private metodoPagoSeleccionadoId: string | number | null = null;

  constructor(
    private facade: OrdersFacade,
    private sanitizer: DomSanitizer
  ) {}

  // ⭐ MÉTODOS PÚBLICOS - Accesibles via @ViewChild desde el padre
  public onAbrirModalMetodosPago(): void {
    this.mostrarModalMetodosPago = true;
  }

  public onAgregarMetodoPago(): void {
    this.mostrarModalAgregarMetodoPago = true;
  }

  // ⭐ MÉTODOS PRIVADOS - Lógica interna del componente
  private onMetodoPagoCreado(dto: CreatePaymentMethodRequestDto): void {
    this.facade.createPaymentMethod(dto).subscribe({
      next: () => {
        this.mostrarModalAgregarMetodoPago = false;
        this.recargarSeccion.emit();  // Notifica al padre
      },
      error: (err) => console.error(err)
    });
  }

  private onRegistrarPago(registro: PendingPaymentOrderViewModel): void {
    this.pedidoSeleccionado = registro;
    this.mostrarModalRegistrarPago = true;
  }

  private onDescargarRecibo(registro: PaymentViewModel): void {
    this.reciboSeleccionado = registro;
    this.mostrarModalPreviewRecibo = true;
    
    this.facade.getPaymentReceipt(registro.idPago).subscribe({
      next: (arrayBuffer: ArrayBuffer) => {
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        this.reciboURL = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      }
    });
  }
}
```

**Componente Padre (main-orders.ts):**
```typescript
import { ViewChild } from '@angular/core';
import { PaymentsSectionComponent } from './components/payments-section/payments-section';

export class MainOrders implements OnInit {
  // ⭐ REFERENCIA AL HIJO - Permite llamar métodos públicos
  @ViewChild(PaymentsSectionComponent) paymentsSection!: PaymentsSectionComponent;

  // Props que se pasan al hijo (solo datos)
  cargandoPagos = false;
  pagosPendientes: PendingPaymentOrderViewModel[] = [];
  pagosTodos: PaymentViewModel[] = [];
  metodosPago: PaymentMethodViewModel[] = [];
  metodosPagoOptions: Array<{ value: any; label: string }> = [];

  constructor(private facade: OrdersFacade) {}

  ngOnInit(): void {
    this.cargarSeccionPagos();
  }

  // ⭐ DELEGACIÓN - El padre invoca métodos públicos del hijo
  onAbrirModalMetodosPago(): void {
    if (this.paymentsSection) {
      this.paymentsSection.onAbrirModalMetodosPago();
    }
  }

  onAgregarMetodoPago(): void {
    if (this.paymentsSection) {
      this.paymentsSection.onAgregarMetodoPago();
    }
  }

  // ⭐ CARGA DE DATOS - El padre obtiene datos y los pasa al hijo
  cargarSeccionPagos(): void {
    this.cargandoPagos = true;
    
    forkJoin({
      pendientes: this.facade.getPendingPaymentOrders(),
      todos: this.facade.getAllPayments(),
      metodosPago: this.facade.getPaymentMethods()
    }).subscribe({
      next: (data) => {
        this.pagosPendientes = data.pendientes.map(p => 
          this.facade.mapPendingPaymentOrderToViewModel(p)
        );
        this.pagosTodos = data.todos.map(p => this.facade.mapPaymentToViewModel(p));
        this.metodosPago = data.metodosPago.map(m => 
          this.facade.mapPaymentMethodToViewModel(m)
        );
        this.metodosPagoOptions = this.metodosPago.map(m => ({
          value: m.idMetodoPago,
          label: m.nombre
        }));
        
        this.cargandoPagos = false;
      },
      error: () => {
        this.cargandoPagos = false;
      }
    });
  }
}
```

**Template del Padre (main-orders.html):**
```html
<!-- Botones en header que invocan métodos del hijo via @ViewChild -->
<div class="acciones-header">
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

<!-- Componente hijo encapsulado -->
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

### 8.4 Flujo de Datos con @ViewChild

**Flujo de Creación de Método de Pago:**
```
Usuario click "Agregar Método" en header
    ↓
MainOrders.onAgregarMetodoPago() (handler en padre)
    ↓
paymentsSection.onAgregarMetodoPago() (via @ViewChild)
    ↓
PaymentsSectionComponent.mostrarModalAgregarMetodoPago = true
    ↓
Usuario llena formulario y confirma
    ↓
AgregarMetodoPagoForm.@Output(metodoPagoCreado).emit(dto)
    ↓
PaymentsSectionComponent.onMetodoPagoCreado(dto)
    ↓
OrdersFacade.createPaymentMethod(dto) -> API
    ↓
Respuesta exitosa
    ↓
PaymentsSectionComponent.recargarSeccion.emit() (notifica al padre)
    ↓
MainOrders.cargarSeccionPagos() (recarga datos)
    ↓
Datos actualizados se pasan via @Input al hijo
```

### 8.5 Ventajas del Patrón @ViewChild

**Reducción de código:**
- **Antes (sin encapsular)**: main-orders.ts con ~500 líneas
- **Después (encapsulado)**: main-orders.ts con 341 líneas + payments-section.ts con 227 líneas
- **Beneficio**: Separación clara, ambos componentes < 400 líneas

**Encapsulación:**
- El padre NO conoce los estados internos del hijo
- El hijo maneja su propia lógica de modales
- Cambios en la UI de pagos no afectan al componente principal

**Testing:**
- PaymentsSectionComponent puede testearse de forma aislada
- Mock del Facade más simple (scope reducido)
- Tests del padre no necesitan conocer lógica interna de pagos

**Reutilización:**
- PaymentsSectionComponent puede usarse en otros contextos
- Solo requiere pasarle datos via @Input
- No depende del layout del padre

### 8.6 Reglas de Diseño para Componentes Encapsulados

**✅ HACER:**
- Inyectar Facade directamente en el componente encapsulado
- Usar @Input solo para **datos** (arrays, objetos de datos)
- Usar @Output solo para **eventos de recarga** (no para estados de modales)
- Exponer métodos públicos para acciones del padre via @ViewChild
- Mant**El componente tiene `standalone: false` en el decorador @Component**
- [ ] ener estado de modales privado dentro del componente

**❌ NO HACER:**
- Pasar estados de modales como @Input (ej: `[mostrarModal]="mostrarModalPago"`)
- Emitir eventos específicos por cada acción interna (ej: `(abrirModalPago)`, `(cerrarModalPago)`)
- Inyectar múltiples servicios si un Facade puede centralizar
- Crear componentes encapsulados para secciones con < 3 modales

### 8.7 Checklist para Componentes Encapsulados

Al crear un componente encapsulado:

- [ ] El componente hijo maneja **>= 3 modales internos**
- [ ] El padre usa **@ViewChild** para referenciar al hijo
- [ ] El hijo expone **métodos públicos** para acciones del padre
- [ ] El hijo recibe **solo datos** via @Input (no estados UI)
- [ ] El hijo emite **eventos de recarga** via @Output
- [ ] El hijo inyecta **Facade** directamente (no depende del padre)
- [ ] El padre NO conoce estados internos de modales del hijo
- [ ] El componente es **testeable independientemente**
- [ ] La separación reduce el tamaño del componente principal en **> 100 líneas**

---

## 9. Patrón de Formularios Corregido (Events-Promotions v2.0)

### 9.1 Estructura Correcta de Componentes de Formulario

**Importante**: A partir de la v2.0 del módulo Events-Promotions, se han corregido errores críticos en la estructura de formularios. Todos los nuevos módulos DEBEN seguir este patrón.

#### Componente TypeScript (agregar-evento-form.ts)

```typescript
@Component({
  selector: 'app-agregar-evento-form',
  templateUrl: './agregar-evento-form.html',
  styleUrls: ['./agregar-evento-form.scss'],
  standalone: false  // ⚠️ OBLIGATORIO
})
export class AgregarEventoForm {
  @Input() mostrar = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() eventoCreado = new EventEmitter<CreateEventRequestDto>();

  // Campos del formulario (binding bidireccional)
  nombre = '';
  descripcion = '';

  constructor() { }

  // ⭐ IMPORTANTE: Sin argumentos en onSubmit()
  onSubmit(): void {
    // Validación manual simple (sin NgForm)
    if (!this.nombre || !this.descripcion) return;

    const dto: CreateEventRequestDto = {
      nombre: this.nombre.trim(),
      descripcion: this.descripcion.trim()
    };

    this.eventoCreado.emit(dto);
    this.limpiarFormulario();
  }

  onCerrar(): void {
    this.limpiarFormulario();
    this.cerrar.emit();
  }

  private limpiarFormulario(): void {
    this.nombre = '';
    this.descripcion = '';
  }
}
```

#### Template HTML (agregar-evento-form.html)

```html
<!-- ⭐ CORRECTO: Sin etiqueta <form> anidada -->
<app-ui-modal
  titulo="Agregar Nuevo Evento"
  [mostrar]="mostrar"
  (cerrar)="onCerrar()"
>
  <app-ui-form maxHeight="50vh" maxWidth="700px">
    <!-- ✅ Inputs FUERA de <form> (app-ui-form ya lo contiene) -->
    <ui-input
      tituloInput="Nombre del Evento"
      tipo="text"
      placeholder="Noche de Jazz"
      [(ngModel)]="nombre"
      name="nombre"
      required
      #nombreField="ngModel"
    ></ui-input>

    @if (nombreField.invalid && nombreField.touched) {
      <app-ui-helper-text>
        <ng-container>El nombre es obligatorio</ng-container>
      </app-ui-helper-text>
    }

    <ui-input
      tituloInput="Descripción"
      tipo="text"
      placeholder="Música en vivo todos los viernes"
      [(ngModel)]="descripcion"
      name="descripcion"
      required
      #descripcionField="ngModel"
    ></ui-input>

    @if (descripcionField.invalid && descripcionField.touched) {
      <app-ui-helper-text>
        <ng-container>La descripción es obligatoria</ng-container>
      </app-ui-helper-text>
    }

    <!-- ✅ Footer con botones (sin cancelar, solo acción) -->
    <div footer class="form-footer">
      <ui-button
        texto="Crear Evento"
        [noBackgroundColor]="true"
        type="submit"
        (accion)="onSubmit()"
      ></ui-button>
    </div>
  </app-ui-form>
</app-ui-modal>
```

### 9.2 Errores Comunes a Evitar

#### ❌ INCORRECTO: Etiqueta <form> Anidada

```html
<!-- NO HACER ESTO -->
<app-ui-form>
  <form #myForm="ngForm" (ngSubmit)="onSubmit(myForm)">
    <!-- El problema: app-ui-form YA CONTIENE <form> internamente -->
    <!-- Esta estructura anidada causa problemas de rendering -->
    <ui-input></ui-input>
  </form>
</app-ui-form>
```

#### ❌ INCORRECTO: onSubmit() Recibiendo NgForm

```typescript
// NO HACER ESTO
onSubmit(form: NgForm): void {
  if (!form.valid) return;  // form es undefined cuando llamas sin argumentos
  // ...
}
```

#### ❌ INCORRECTO: Botón Cancelar en Modal

```html
<!-- NO HACER ESTO -->
<div footer class="form-footer">
  <ui-button
    texto="Cancelar"
    [noBackgroundColor]="true"
    (accion)="onCerrar()"
  ></ui-button>

  <ui-button
    texto="Guardar"
    [noBackgroundColor]="true"
    (accion)="onSubmit()"
  ></ui-button>
</div>

<!-- Los modales CIERRAN mediante el botón X en el header automáticamente.
     NO es necesario un botón Cancelar (es redundante y confunde al usuario) -->
```

#### ❌ INCORRECTO: Botón Sin [noBackgroundColor]

```html
<!-- NO HACER ESTO -->
<ui-button
  texto="Guardar"
  backgroundColor="#D4AF37"  <!-- ← REDUNDANTE, es el default -->
  (accion)="onSubmit()"
></ui-button>

<!-- CORRECTO -->
<ui-button
  texto="Guardar"
  [noBackgroundColor]="true"
  (accion)="onSubmit()"
></ui-button>
```

### 9.3 Patrón de Validación Recomendado

**Validación Manual Simple** (para formularios pequeños):
```typescript
// ✅ Para formularios simples (2-3 campos)
onSubmit(): void {
  if (!this.nombre || !this.descripcion) return;
  
  const dto: CreateEventRequestDto = { /*...*/ };
  this.eventoCreado.emit(dto);
}
```

**Validación con Template Form** (si necesitas validaciones complejas):
```typescript
// Para formularios complejos con validaciones múltiples
@ViewChild('formulario') formulario!: NgForm;

onSubmit(): void {
  if (!this.formulario.valid) return;
  
  const dto: CreateEventRequestDto = { /*...*/ };
  this.eventoCreado.emit(dto);
}
```

### 9.4 Checklist para Componentes de Formulario

Al crear un componente `agregar-*-form` o `editar-*-form`:

- [ ] Componente tiene `standalone: false`
- [ ] **NO hay etiqueta `<form>` dentro del template** (app-ui-form lo contiene)
- [ ] @Input `mostrar` controla visibilidad del modal
- [ ] @Output eventos emiten DTOs, no objetos arbitrarios
- [ ] `onSubmit()` **recibe 0 argumentos**
- [ ] Validaciones simples con `app-ui-helper-text`
- [ ] **NO hay botón Cancelar** en el footer (cierre vía X del modal)
- [ ] Botones en footer tienen `[noBackgroundColor]="true"`
- [ ] Campo `type="submit"` en el botón principal
- [ ] `(accion)="onSubmit()"` **sin parámetros $event**
- [ ] Método `limpiarFormulario()` se llama en `onCerrar()` y después de `emit()`

---

## 10. Recomendaciones y Mejores Prácticas

### 10.1 Para Escalabilidad
- Si `main-{modulo}` crece (>300 líneas), divide en sub-componentes
- Crear `layout/` dentro del módulo para componentes de disposición
- Usar `*ngIf` para componentes condicionales, no múltiples vistas

### 10.2 Para Testing
- Cada componente hijo debe tener tests de @Input/@Output
- Facade debe mockearse en tests de componentes
- InventoryApi debe mockearse en tests de Facade

### 10.3 Para Mantenibilidad
- Documentar el propósito de cada Facade method
- Mantener ViewModels simples (máximo 15 propiedades)
- Usar comentarios TSDoc para métodos complejos

### 10.4 Para Nuevos Módulos
- Copia la estructura de **inventory** como template para módulos simples
- Usa la estructura de **orders** como referencia para módulos con tabs complejos
- Si necesitas componentes encapsulados (>3 modales), revisa PaymentsSectionComponent
- Asegura que los DTOs existan en `domain/{modulo}/`
- Prueba que el Facade funciona antes de crear componentes

**Referencias de Implementación:**

| Módulo | Ruta | Patrón Principal | Casos de Uso |
|--------|------|------------------|--------------|
| **Inventory** | `/features/admin/pages/inventory/` | @Input/@Output | CRUD simple, 1-2 modales por entidad |
| **Users** | `/features/admin/pages/users/` | @Input/@Output + Tabs | Múltiples entidades, tabs simples |
| **Orders** | `/features/admin/pages/orders/` | **@ViewChild + Encapsulado** | Tabs complejos, >3 modales, PDF preview |

---

## 11. Anexo: Estructura Esperada de Domain

Los DTOs de cada módulo deben residir en:

```
domain/{modulo}/
├── models/                           # Modelos de negocio (entidades)
│   └── {entidad}.model.ts
├── dtos/                             # Contratos de comunicación
│   ├── request/
│   │   ├── create-{entidad}.request.dto.ts
│   │   ├── update-{entidad}.request.dto.ts
│   │   └── delete-{entidad}.request.dto.ts
│   └── response/
│       ├── {entidad}.response.dto.ts
│       └── list-{entidad}.response.dto.ts
└── state/                            # State management (si aplica)
    └── {modulo}.state.ts
```

**Ejemplo para Inventory**:
```
domain/inventory/
├── models/
│   ├── producto.model.ts
│   └── categoria.model.ts
├── dtos/
│   ├── request/
│   │   ├── create-product.request.dto.ts
│   │   ├── update-product.request.dto.ts
│   │   ├── create-category.request.dto.ts
│   │   └── update-category.request.dto.ts
│   └── response/
│       ├── product.response.dto.ts
│       └── category.response.dto.ts
```

---

## 12. Glosario

| Término | Definición |
|---------|-----------|
| **Facade** | Patrón que simplifica la interfaz compleja de subsistemas |
| **DTO** | Data Transfer Object - Contrato de comunicación tipado |
| **ViewModel** | Modelo optimizado para presentación en UI |
| **Observable** | Patrón RxJS para flujos de datos asíncronos |
| **@Input** | Propiedad de entrada en componente Angular |
| **@Output** | Evento de salida desde componente Angular |
| **Guard** | Servicio que controla acceso a rutas |
| **Module** | Contenedor de componentes, servicios y configuración |

---

## 13. Actualización de Contrato: Pagos Mixtos (Orders/Admin)

Se extiende el contrato de registro de pago para soportar compatibilidad legacy y modo mixto sin crear un endpoint nuevo.

### 13.1 Request `registerPayment`

Endpoint:

`POST /api/payments/register/:idPedido`

Formas soportadas:

1) Legacy (compatible):

```json
{
  "idMetodoPago": 1,
  "direccionEntrega": "Av. Ejemplo 123"
}
```

2) Mixto:

```json
{
  "metodos": [
    { "idMetodoPago": 1, "monto": 20.00 },
    { "idMetodoPago": 2, "monto": 30.00 }
  ],
  "direccionEntrega": "Av. Ejemplo 123"
}
```

Reglas:
- Cada línea de `metodos[]` requiere `idMetodoPago` entero y `monto > 0`.
- La suma de `metodos[].monto` debe coincidir exactamente con el total del pedido.
- Si no coincide, backend responde `400`.

### 13.2 Response de pago

El bloque `pago` ahora puede incluir desglose en `detalles`:

```json
{
  "pago": {
    "idPago": 10,
    "idMetodoPago": 1,
    "monto": 50,
    "detalles": [
      { "idMetodoPago": 1, "nombre": "efectivo", "monto": 20 },
      { "idMetodoPago": 2, "nombre": "tarjeta", "monto": 30 }
    ]
  }
}
```

### 13.3 Modelos de dominio (client)

- `RegisterPaymentRequestDto`:
  - `idMetodoPago?: number`
  - `metodos?: Array<{ idMetodoPago: number; monto: number }>`
  - `direccionEntrega?: string`
- `Pago` añade `detalles?: PagoDetalle[]`.
- `Pedido`/pendientes pueden incluir `tipoAtencion?: 'local' | 'llevar'` cuando `canalVenta='fisico'`.

---

**Última actualización**: 21 de enero de 2025  
**Versión**: 1.2 (Agregado: Patrón de formularios corregido v2.0 Events-Promotions)  
**Responsable**: Arquitectura de Frontend
