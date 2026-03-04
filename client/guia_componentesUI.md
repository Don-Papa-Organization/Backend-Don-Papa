# 📚 Guía de Componentes UI - Don Papa

## Índice de Componentes

1. [ui-button](#ui-button) - Botón estándar con estilos personalizables
2. [ui-input](#ui-input) - Campo de entrada con soporte para formularios reactivos
3. [ui-tabla](#ui-tabla) - Tabla con acciones personalizables
4. [ui-tabs](#ui-tabs) - Sistema de pestañas navegables
5. [ui-modal](#ui-modal) - Ventana modal genérica
6. [ui-combobox](#ui-combobox) - Selector con búsqueda filtrada
7. [ui-checkbox](#ui-checkbox) - Casilla de verificación
8. [ui-icon-button](#ui-icon-button) - Botón con ícono y texto
9. [ui-only-icon-button](#ui-only-icon-button) - Botón solo ícono
10. [ui-image-upload](#ui-image-upload) - Carga de imágenes con drag & drop
11. [ui-breadcrumbs](#ui-breadcrumbs) - Migas de pan para navegación
12. [ui-button-grid](#ui-button-grid) - Botón en formato grid
13. [ui-helper-text](#ui-helper-text) - Texto de ayuda/error
14. [ui-form](#ui-form) - Contenedor de formulario con header/footer
15. [ui-product-card](#ui-product-card) - Tarjeta de producto

---

## <a name="ui-button"></a>1. ui-button

**Selector:** `<ui-button>`

### Descripción
Botón estándar del sistema con estilos consistentes y personalizables. Soporta diferentes colores, tamaños y estados.

### Atributos (Inputs)

| Atributo | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `texto` | `string` | **requerido** | Texto visible del botón |
| `tipo` | `'button' \| 'submit' \| 'reset'` | `'button'` | Tipo de botón HTML |
| `disabled` | `boolean` | `false` | Deshabilita el botón |
| `customWidth` | `string` | `'fit-content'` | Ancho personalizado (ej: '200px', '100%') |
| `borderRadius` | `string` | `'5px'` | Radio de borde |
| `noBackgroundColor` | `boolean` | `false` | Botón transparente con borde |
| `backgroundColor` | `string` | `'#D4AF37'` | Color de fondo personalizado |
| `[noBackgroundColor]` + `backgroundColor` | **Sinergia** | - | Para alertas (ej: rojo), genera borde de color que se rellena en hover. |

### Eventos (Outputs)

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `accion` | `EventEmitter<void>` | Se emite al hacer click |

### Casos de Uso

**1. Botón Primario (Default)**
```html
<ui-button 
  texto="Guardar" 
  tipo="submit"
  (accion)="onGuardar()">
</ui-button>
```

**2. Botón Secundario (Sin fondo)**
```html
<ui-button 
  texto="Cancelar" 
  [noBackgroundColor]="true"
  (accion)="onCancelar()">
</ui-button>
```

**3. Botón de Ancho Completo**
```html
<ui-button 
  texto="Aplicar Filtros" 
  customWidth="100%"
  (accion)="aplicarFiltros()">
</ui-button>
```

**4. Botón con Color Personalizado**
```html
<ui-button 
  texto="Eliminar" 
  backgroundColor="#dc3545"
  (accion)="onEliminar()">
</ui-button>
```

---

## <a name="ui-input"></a>2. ui-input

**Selector:** `<ui-input>`

### Descripción
Campo de entrada con etiqueta integrada. Soporta formularios reactivos y template-driven mediante `ControlValueAccessor`.

### Atributos (Inputs)

| Atributo | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `tituloInput` | `string` | `''` | Etiqueta del campo |
| `placeholder` | `string` | `''` | Texto placeholder |
| `tipo` | `'text' \| 'password' \| 'email' \| 'number' \| 'checkbox' \| 'date'` | `'text'` | Tipo de input |
| `valorInput` | `string` | `''` | Valor inicial (two-way binding) |
| `min` | `number?` | `undefined` | Valor mínimo (para tipo number) |

### Eventos (Outputs)

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `valorInputChange` | `EventEmitter<string>` | Se emite al cambiar el valor |

### Casos de Uso

**1. Input de Texto Simple**
```html
<ui-input 
  tituloInput="Nombre del producto"
  placeholder="Ingrese nombre..."
  [(valorInput)]="nombreProducto">
</ui-input>
```

**2. Input de Fecha**
```html
<ui-input 
  tituloInput="Fecha de inicio"
  tipo="date"
  [(valorInput)]="fechaInicio">
</ui-input>
```

**3. Input Numérico con Mínimo**
```html
<ui-input 
  tituloInput="Precio"
  tipo="number"
  [min]="0"
  [(valorInput)]="precio">
</ui-input>
```

**4. Input de Contraseña**
```html
<ui-input 
  tituloInput="Contraseña"
  tipo="password"
  placeholder="********"
  [(valorInput)]="password">
</ui-input>
```

**5. Con ngModel (Formularios Reactivos)**
```html
<ui-input 
  tituloInput="Email"
  tipo="email"
  [(ngModel)]="formulario.email"
  (valorInputChange)="onEmailChange($event)">
</ui-input>
```

---

## <a name="ui-tabla"></a>3. ui-tabla

**Selector:** `<app-ui-tabla>`

### Descripción
Tabla genérica con soporte para acciones personalizables por fila (editar, eliminar, ver detalle, etc.).

### Atributos (Inputs)

| Atributo | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `minWidth` | `string` | `'725px'` | Ancho mínimo de la tabla |
| `theadData` | `string[]` | `[]` | Encabezados de columnas |
| `tbodyData` | `Array<any>` | `[]` | Datos de las filas |
| `acciones` | `AccionTabla[]` | `[]` | Configuración de acciones |

### Eventos (Outputs)

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `editarRegistro` | `EventEmitter<any>` | Se emite al editar |
| `eliminarRegistro` | `EventEmitter<any>` | Se emite al eliminar |
| `accionPersonalizada` | `EventEmitter<{accion: string; registro: any}>` | Acciones custom |

### Interfaces

```typescript
export interface AccionTabla {
  urlIcono: string;          // Ruta al ícono SVG
  accion: (registro: any) => void;  // Función a ejecutar
}
```

### Casos de Uso

**1. Tabla Básica con Datos**
```typescript
// Component
theadData = ['ID', 'Nombre', 'Email', 'Rol', 'Estado'];
tbodyData = [
  { id: 1, nombre: 'Juan', email: 'juan@example.com', rol: 'Admin', estado: 'Activo' },
  { id: 2, nombre: 'María', email: 'maria@example.com', rol: 'Empleado', estado: 'Activo' }
];
```

```html
<app-ui-tabla 
  [theadData]="theadData"
  [tbodyData]="tbodyData">
</app-ui-tabla>
```

**2. Tabla con Acciones Personalizadas**
```typescript
// Component
acciones: AccionTabla[] = [
  {
    urlIcono: 'icons/eye.svg',
    accion: (registro) => this.verDetalle(registro)
  },
  {
    urlIcono: 'icons/editar.svg',
    accion: (registro) => this.onEditar(registro)
  },
  {
    urlIcono: 'icons/eliminar.svg',
    accion: (registro) => this.onEliminar(registro)
  }
];
```

```html
<app-ui-tabla 
  [theadData]="theadData"
  [tbodyData]="usuarios"
  [acciones]="acciones">
</app-ui-tabla>
```

**3. Tabla de Reportes (Solo Ver Detalle)**
```typescript
// Component
accionesReporte: AccionTabla[] = [
  {
    urlIcono: 'icons/eye.svg',
    accion: (bitacora) => this.onVerDetalleBitacora(bitacora)
  }
];

theadBitacora = ['ID', 'ID Empleado', 'Descripción', 'Fecha', 'Tipo Evento'];
```

```html
<app-ui-tabla 
  [theadData]="theadBitacora"
  [tbodyData]="datosBitacora"
  [acciones]="accionesReporte"
  minWidth="800px">
</app-ui-tabla>
```

---

## <a name="ui-tabs"></a>4. ui-tabs

**Selector:** `<app-ui-tabs>`

### Descripción
Sistema de pestañas navegables para organizar contenido en secciones.

### Atributos (Inputs)

| Atributo | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `tabItems` | `TabItem[]` | `[]` | Array de pestañas |
| `tabActiva` | `string` | `''` | ID de la pestaña activa |

### Eventos (Outputs)

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `tabChange` | `EventEmitter<string>` | Se emite al cambiar de pestaña |

### Interfaces

```typescript
export interface TabItem {
  id: string;     // Identificador único
  label: string;  // Texto visible
}
```

### Casos de Uso

**1. Tabs Básicas**
```typescript
// Component
tabItems: TabItem[] = [
  { id: 'bitacora', label: 'Bitácora de Incidencias' },
  { id: 'ventas', label: 'Reporte de Ventas' }
];
tabActiva = 'bitacora';

onTabChange(tabId: string) {
  this.tabActiva = tabId;
  // Cargar datos específicos
}
```

```html
<app-ui-tabs 
  [tabItems]="tabItems"
  [tabActiva]="tabActiva"
  (tabChange)="onTabChange($event)">
</app-ui-tabs>

<div *ngIf="tabActiva === 'bitacora'">
  <!-- Contenido de bitácora -->
</div>

<div *ngIf="tabActiva === 'ventas'">
  <!-- Contenido de ventas -->
</div>
```

**2. Tabs con Navegación Condicional**
```typescript
// Component
tabsUsuarios: TabItem[] = [
  { id: 'todos', label: 'Todos los Usuarios' },
  { id: 'activos', label: 'Activos' },
  { id: 'inactivos', label: 'Inactivos' }
];

cambiarTab(tabId: string) {
  this.tabActiva = tabId;
  this.filtrarUsuarios(tabId);
}
```

---

## <a name="ui-modal"></a>5. ui-modal

**Selector:** `<app-ui-modal>`

### Descripción
Ventana modal genérica con overlay, título y botón de cierre.

### Atributos (Inputs)

| Atributo | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `titulo` | `string` | `''` | Título del modal |
| `mostrar` | `boolean` | `false` | Controla visibilidad |

### Eventos (Outputs)

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `cerrar` | `EventEmitter<void>` | Se emite al cerrar |

### Casos de Uso

**1. Modal de Detalle**
```typescript
// Component
mostrarDetalle = false;
registroSeleccionado: any = null;

verDetalle(registro: any) {
  this.registroSeleccionado = registro;
  this.mostrarDetalle = true;
}

cerrarModal() {
  this.mostrarDetalle = false;
}
```

```html
<app-ui-modal 
  titulo="Detalle de Incidencia"
  [mostrar]="mostrarDetalle"
  (cerrar)="cerrarModal()">
  
  <div class="contenido-detalle">
    <div class="detalle-fila">
      <strong>ID:</strong>
      <span>{{ registroSeleccionado?.id }}</span>
    </div>
    <div class="detalle-fila">
      <strong>Descripción:</strong>
      <span>{{ registroSeleccionado?.descripcion }}</span>
    </div>
  </div>
</app-ui-modal>
```

**2. Modal de Confirmación**
```html
<app-ui-modal 
  titulo="Confirmar Eliminación"
  [mostrar]="mostrarConfirmacion"
  (cerrar)="cancelarEliminacion()">
  
  <p>¿Estás seguro de eliminar este registro?</p>
  
  <div class="modal-acciones">
    <ui-button texto="Cancelar" [noBackgroundColor]="true" (accion)="cancelarEliminacion()"></ui-button>
    <ui-button texto="Eliminar" backgroundColor="#dc3545" (accion)="confirmarEliminacion()"></ui-button>
  </div>
</app-ui-modal>
```

**3. Modal de Formulario**
```html
<app-ui-modal 
  titulo="Nuevo Usuario"
  [mostrar]="mostrarFormulario"
  (cerrar)="cerrarFormulario()">
  
  <app-ui-form (formSubmit)="onSubmitUsuario($event)">
    <ui-input tituloInput="Nombre" [(ngModel)]="nuevoUsuario.nombre"></ui-input>
    <ui-input tituloInput="Email" tipo="email" [(ngModel)]="nuevoUsuario.email"></ui-input>
  </app-ui-form>
</app-ui-modal>
```

---

## <a name="ui-combobox"></a>6. ui-combobox

**Selector:** `<app-ui-combobox>`

### Descripción
Selector desplegable con búsqueda filtrada en tiempo real. Soporta dirección automática (arriba/abajo) según espacio disponible.

### Atributos (Inputs)

| Atributo | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `tituloInput` | `string` | `'Selecciona una opción'` | Etiqueta del combobox |
| `options` | `Array<{value: any, label: string}>` | `[]` | Opciones disponibles |
| `selectedOption` | `any` | `undefined` | Opción seleccionada |
| `isDisabled` | `boolean` | `false` | Deshabilitar selector |

### Eventos (Outputs)

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `selectedOptionChange` | `EventEmitter<any>` | Se emite al seleccionar |
| `selectionChange` | `EventEmitter<any>` | Alias del anterior |

### Casos de Uso

**1. Selector de Categorías**
```typescript
// Component
categoriasOpciones = [
  { value: 1, label: 'Bebidas' },
  { value: 2, label: 'Comida' },
  { value: 3, label: 'Postres' }
];
categoriaSeleccionada: number | null = null;
```

```html
<app-ui-combobox 
  tituloInput="Categoría"
  [options]="categoriasOpciones"
  [(selectedOption)]="categoriaSeleccionada"
  (selectionChange)="onCategoriaChange($event)">
</app-ui-combobox>
```

**2. Selector de Empleados con Búsqueda**
```typescript
// Component
empleadosOpciones = [
  { value: 1, label: 'Juan Pérez' },
  { value: 2, label: 'María García' },
  { value: 3, label: 'Pedro López' }
];
```

```html
<app-ui-combobox 
  tituloInput="Empleado"
  [options]="empleadosOpciones"
  [(selectedOption)]="empleadoId">
</app-ui-combobox>
```

**3. Selector Deshabilitado**
```html
<app-ui-combobox 
  tituloInput="Estado"
  [options]="estadosOpciones"
  [isDisabled]="true"
  [(selectedOption)]="estadoActual">
</app-ui-combobox>
```

---

## <a name="ui-checkbox"></a>7. ui-checkbox

**Selector:** `<app-ui-checkbox>`

### Descripción
Casilla de verificación con etiqueta. Soporta formularios reactivos mediante `ControlValueAccessor`.

### Atributos (Inputs)

| Atributo | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `label` | `string` | `''` | Texto de la etiqueta |
| `name` | `string` | `''` | Nombre del campo |
| `checked` | `boolean` | `false` | Estado inicial |

### Eventos (Outputs)

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `checkedChange` | `EventEmitter<boolean>` | Se emite al cambiar estado |

### Casos de Uso

**1. Checkbox Simple**
```html
<app-ui-checkbox 
  label="Activo"
  [(checked)]="usuarioActivo"
  (checkedChange)="onEstadoChange($event)">
</app-ui-checkbox>
```

**2. Checkbox en Formulario**
```html
<app-ui-form>
  <app-ui-checkbox 
    label="Acepto términos y condiciones"
    name="terminos"
    [(ngModel)]="aceptaTerminos">
  </app-ui-checkbox>
  
  <app-ui-checkbox 
    label="Suscribirse al boletín"
    name="newsletter"
    [(ngModel)]="suscripcion">
  </app-ui-checkbox>
</app-ui-form>
```

**3. Lista de Checkboxes**
```typescript
// Component
permisos = [
  { id: 'crear', label: 'Crear', checked: false },
  { id: 'editar', label: 'Editar', checked: true },
  { id: 'eliminar', label: 'Eliminar', checked: false }
];
```

```html
<div *ngFor="let permiso of permisos">
  <app-ui-checkbox 
    [label]="permiso.label"
    [(checked)]="permiso.checked">
  </app-ui-checkbox>
</div>
```

---

## <a name="ui-icon-button"></a>8. ui-icon-button

**Selector:** `<app-ui-icon-button>`

### Descripción
Botón con ícono y texto, útil para menús laterales y acciones principales.

### Atributos (Inputs)

| Atributo | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `texto` | `string` | `''` | Texto del botón |
| `urlIcono` | `string` | `''` | Ruta al ícono SVG |
| `link` | `string` | `''` | Enlace de navegación |
| `sidebarStyles` | `boolean` | `false` | Aplicar estilos de sidebar |
| `customClass` | `string` | `'link'` | Clase CSS personalizada |
| `fullWidth` | `boolean` | `false` | Ancho completo |
| `showBorder` | `boolean` | `false` | Mostrar borde |
| `customHeight` | `string` | `'auto'` | Altura personalizada |

### Eventos (Outputs)

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `action` | `EventEmitter<void>` | Se emite al hacer click |

### Casos de Uso

**1. Botón de Sidebar**
```html
<app-ui-icon-button 
  texto="Dashboard"
  urlIcono="icons/dashboard.svg"
  link="/admin/dashboard"
  [sidebarStyles]="true"
  (action)="onNavigate()">
</app-ui-icon-button>
```

**2. Botón de Acción Principal**
```html
<app-ui-icon-button 
  texto="Agregar Producto"
  urlIcono="icons/add.svg"
  [fullWidth]="true"
  (action)="abrirModalNuevoProducto()">
</app-ui-icon-button>
```

**3. Botón con Borde**
```html
<app-ui-icon-button 
  texto="Exportar"
  urlIcono="icons/download.svg"
  [showBorder]="true"
  (action)="exportarDatos()">
</app-ui-icon-button>
```

---

## <a name="ui-only-icon-button"></a>9. ui-only-icon-button

**Selector:** `<app-ui-only-icon-button>`

### Descripción
Botón compacto solo con ícono, ideal para acciones rápidas en tablas o toolbars.

### Atributos (Inputs)

| Atributo | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `urlIcono` | `string` | `''` | Ruta al ícono SVG |
| `link` | `string` | `''` | Enlace de navegación |
| `texto` | `string` | `''` | Tooltip text |
| `sidebarStyles` | `boolean` | `false` | Aplicar estilos de sidebar |
| `customClass` | `string` | `'icon-button'` | Clase CSS personalizada |
| `fullWidth` | `boolean` | `false` | Ancho completo |
| `showBorder` | `boolean` | `false` | Mostrar borde |
| `background_color` | `boolean` | `false` | Mostrar fondo de color |
| `showTextStyle` | `boolean` | `false` | Mostrar texto adicional |
| `customHeight` | `string` | `'auto'` | Altura personalizada |

### Eventos (Outputs)

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `action` | `EventEmitter<void>` | Se emite al hacer click |

### Casos de Uso

**1. Botón de Reload**
```html
<app-ui-only-icon-button 
  urlIcono="icons/reload.svg"
  texto="Recargar"
  (action)="recargarDatos()">
</app-ui-only-icon-button>
```

**2. Botón de Configuración**
```html
<app-ui-only-icon-button 
  urlIcono="icons/settings.svg"
  [background_color]="true"
  (action)="abrirConfiguracion()">
</app-ui-only-icon-button>
```

**3. Botones en Header**
```html
<div class="acciones-header">
  <app-ui-only-icon-button 
    urlIcono="icons/filter.svg"
    (action)="toggleFiltros()">
  </app-ui-only-icon-button>
  
  <app-ui-only-icon-button 
    urlIcono="icons/download.svg"
    (action)="exportar()">
  </app-ui-only-icon-button>
</div>
```

---

## <a name="ui-image-upload"></a>10. ui-image-upload

**Selector:** `<app-ui-image-upload>`

### Descripción
Componente de carga de imágenes con soporte para drag & drop, preview y subida automática a API.

### Atributos (Inputs)

| Atributo | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `productoId` | `number \| null` | `null` | ID del producto (sube automáticamente si se provee) |
| `urlActual` | `string \| null` | `null` | URL de imagen existente para preview |

### Eventos (Outputs)

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `imagenSubida` | `EventEmitter<void>` | Se emite cuando la subida es exitosa |
| `archivoSeleccionado` | `EventEmitter<File>` | Se emite al seleccionar archivo |

### Casos de Uso

**1. Upload con Auto-subida (Edición de Producto)**
```html
<app-ui-image-upload 
  [productoId]="productoSeleccionado?.id"
  [urlActual]="productoSeleccionado?.imagen_url"
  (imagenSubida)="onImagenActualizada()">
</app-ui-image-upload>
```

**2. Upload Manual (Nuevo Producto)**
```typescript
// Component
archivoImagen: File | null = null;

onArchivoSeleccionado(file: File) {
  this.archivoImagen = file;
  // Guardar para subir después al crear producto
}
```

```html
<app-ui-image-upload 
  (archivoSeleccionado)="onArchivoSeleccionado($event)">
</app-ui-image-upload>
```

**3. Upload en Modal de Edición**
```html
<app-ui-modal 
  titulo="Editar Producto"
  [mostrar]="mostrarModal"
  (cerrar)="cerrarModal()">
  
  <app-ui-image-upload 
    [productoId]="productoEditando?.id"
    [urlActual]="productoEditando?.imagen_url"
    (imagenSubida)="recargarProducto()">
  </app-ui-image-upload>
  
  <ui-input tituloInput="Nombre" [(ngModel)]="productoEditando.nombre"></ui-input>
</app-ui-modal>
```

---

## <a name="ui-breadcrumbs"></a>11. ui-breadcrumbs

**Selector:** `<ui-breadcrumbs>`

### Descripción
Navegación de migas de pan para mostrar la jerarquía de rutas.

### Atributos (Inputs)

| Atributo | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `rutas` | `RouteI[]` | `[]` | Array de rutas de navegación |

### Interfaces

```typescript
export interface RouteI {
  nombre: string;  // Texto visible
  ruta?: string;   // Path para navegación
}
```

### Casos de Uso

**1. Breadcrumbs Básicas**
```typescript
// Component
rutasActuales: RouteI[] = [
  { nombre: 'Dashboard', ruta: '/admin/dashboard' },
  { nombre: 'Usuarios', ruta: '/admin/usuarios' },
  { nombre: 'Editar Usuario' }  // Última sin ruta (actual)
];
```

```html
<ui-breadcrumbs [rutas]="rutasActuales"></ui-breadcrumbs>
```

**2. Breadcrumbs Dinámicas**
```typescript
// Component
construirBreadcrumbs(seccion: string) {
  this.rutasActuales = [
    { nombre: 'Inicio', ruta: '/admin' },
    { nombre: seccion }
  ];
}
```

---

## <a name="ui-button-grid"></a>12. ui-button-grid

**Selector:** `<app-ui-button-grid>`

### Descripción
Botón en formato de grid/tarjeta con ícono y texto, útil para dashboards.

### Atributos (Inputs)

| Atributo | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `accion` | `() => void` | requerido | Función a ejecutar |
| `icono` | `string` | `''` | Ruta al ícono |
| `texto` | `string` | `''` | Texto del botón |

### Casos de Uso

**1. Grid de Acciones en Dashboard**
```typescript
// Component
navegarUsuarios() {
  this.router.navigate(['/admin/usuarios']);
}

navegarProductos() {
  this.router.navigate(['/admin/productos']);
}
```

```html
<div class="dashboard-grid">
  <app-ui-button-grid 
    icono="icons/users.svg"
    texto="Gestión de Usuarios"
    [accion]="navegarUsuarios.bind(this)">
  </app-ui-button-grid>
  
  <app-ui-button-grid 
    icono="icons/inventory.svg"
    texto="Inventario"
    [accion]="navegarProductos.bind(this)">
  </app-ui-button-grid>
</div>
```

---

## <a name="ui-helper-text"></a>13. ui-helper-text

**Selector:** `<app-ui-helper-text>`

### Descripción
Texto de ayuda contextual para mostrar mensajes de error, éxito o información.

### Atributos (Inputs)

| Atributo | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `type` | `'error' \| 'success' \| 'info'` | `'error'` | Tipo de mensaje |
| `visible` | `boolean` | `true` | Controla visibilidad |

### Casos de Uso

**1. Mensaje de Error en Formulario**
```html
<ui-input 
  tituloInput="Email"
  tipo="email"
  [(ngModel)]="email">
</ui-input>

<app-ui-helper-text 
  type="error"
  [visible]="emailInvalido">
  El email ingresado no es válido
</app-ui-helper-text>
```

**2. Mensaje de Éxito**
```html
<app-ui-helper-text 
  type="success"
  [visible]="guardadoExitoso">
  Los cambios se guardaron correctamente
</app-ui-helper-text>
```

**3. Información Contextual**
```html
<ui-input 
  tituloInput="Contraseña"
  tipo="password"
  [(ngModel)]="password">
</ui-input>

<app-ui-helper-text 
  type="info">
  La contraseña debe tener al menos 8 caracteres
</app-ui-helper-text>
```

---

## <a name="ui-form"></a>14. ui-form

**Selector:** `<app-ui-form>`

### Descripción
Contenedor de formulario con header, footer automático y detección de overflow.

### Atributos (Inputs)

| Atributo | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `titulo` | `string?` | `undefined` | Título del formulario |
| `subtitulo` | `string?` | `undefined` | Subtítulo opcional |
| `maxWidth` | `string` | `'500px'` | Ancho máximo |
| `maxHeight` | `string` | `'100vh'` | Altura máxima |
| `showFooter` | `boolean` | `true` | Mostrar footer con botones |

### Eventos (Outputs)

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `formSubmit` | `EventEmitter<NgForm>` | Se emite al submit válido |

### Casos de Uso

**1. Formulario Completo**
```html
<app-ui-form 
  titulo="Nuevo Producto"
  subtitulo="Completa los datos del producto"
  maxWidth="600px"
  (formSubmit)="onGuardarProducto($event)">
  
  <ui-input tituloInput="Nombre" name="nombre" [(ngModel)]="producto.nombre" required></ui-input>
  <ui-input tituloInput="Precio" tipo="number" name="precio" [(ngModel)]="producto.precio"></ui-input>
  <app-ui-combobox tituloInput="Categoría" [options]="categorias" [(selectedOption)]="producto.categoria_id"></app-ui-combobox>
</app-ui-form>
```

**2. Formulario sin Footer**
```html
<app-ui-form 
  titulo="Filtros"
  [showFooter]="false">
  
  <ui-input tituloInput="Buscar" [(ngModel)]="busqueda"></ui-input>
  <app-ui-combobox tituloInput="Estado" [options]="estados" [(selectedOption)]="filtroEstado"></app-ui-combobox>
  
  <ui-button texto="Aplicar" (accion)="aplicarFiltros()"></ui-button>
</app-ui-form>
```

**3. Formulario con Altura Limitada**
```html
<app-ui-form 
  titulo="Registro de Usuario"
  maxHeight="70vh"
  maxWidth="500px"
  (formSubmit)="onRegistrar($event)">
  
  <ui-input tituloInput="Nombre" name="nombre" [(ngModel)]="usuario.nombre"></ui-input>
  <ui-input tituloInput="Email" tipo="email" name="email" [(ngModel)]="usuario.email"></ui-input>
  <ui-input tituloInput="Contraseña" tipo="password" name="password" [(ngModel)]="usuario.password"></ui-input>
  <app-ui-checkbox label="Acepto términos" name="terminos" [(checked)]="aceptaTerminos"></app-ui-checkbox>
</app-ui-form>
```

---

## <a name="ui-product-card"></a>15. ui-product-card

**Selector:** `<app-ui-product-card>`

### Descripción
Tarjeta visual para mostrar productos con imagen, nombre, precio y stock.

### Atributos (Inputs)

| Atributo | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `urlImagen` | `string` | `'/img/default_product.png'` | URL de imagen |
| `precio` | `number` | `0` | Precio del producto |
| `nombre` | `string` | `'nombre'` | Nombre del producto |
| `stockActual` | `number` | `0` | Cantidad en stock |
| `link` | `string` | `''` | Enlace de navegación |

### Casos de Uso

**1. Grid de Productos**
```html
<div class="productos-grid">
  <app-ui-product-card 
    *ngFor="let producto of productos"
    [urlImagen]="producto.imagen_url"
    [nombre]="producto.nombre"
    [precio]="producto.precio"
    [stockActual]="producto.stock_actual"
    [link]="'/productos/' + producto.id">
  </app-ui-product-card>
</div>
```

**2. Catálogo de Productos**
```typescript
// Component
productos = [
  {
    id: 1,
    nombre: 'Ron Don Papa 7 años',
    precio: 45.99,
    imagen_url: '/img/productos/ron-don-papa-7.jpg',
    stock_actual: 15
  },
  {
    id: 2,
    nombre: 'Ron Don Papa 10 años',
    precio: 65.99,
    imagen_url: '/img/productos/ron-don-papa-10.jpg',
    stock_actual: 8
  }
];
```

```html
<div class="catalogo">
  <app-ui-product-card 
    *ngFor="let p of productos"
    [urlImagen]="p.imagen_url"
    [nombre]="p.nombre"
    [precio]="p.precio"
    [stockActual]="p.stock_actual"
    [link]="'/catalogo/' + p.id">
  </app-ui-product-card>
</div>
```

---

## 🎨 Estilos Globales y Variables

Todos los componentes respetan las siguientes variables CSS:

```scss
// Colores principales
--color-dorado: #D4AF37;
--color-texto: #ffffff;
--color-fondo-oscuro: rgba(0, 0, 0, 0.8);
--color-borde: rgba(212, 175, 55, 0.1);

// Espaciado
--padding-contenedor: 1.5rem;
--padding-elemento: 1rem;
--gap-elementos: 1rem;

// Bordes
--border-radius: 5px;
--border-dorado: 3px solid #D4AF37;
```

---

## 📦 Importación en Módulos

Para usar estos componentes, importa `SharedModule` en tu módulo:

```typescript
import { SharedModule } from '@shared/shared-module';

@NgModule({
  declarations: [MiComponente],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule  // ← Importar aquí
  ]
})
export class MiModulo { }
```

---

## ✅ Checklist de Uso Correcto

- ✅ Usa `ui-button` con `[noBackgroundColor]="true"` para botones secundarios
- ✅ Usa `ui-input` para todos los campos de entrada (NO `<input>` HTML puro)
- ✅ Usa `app-ui-tabla` con interface `AccionTabla` para acciones personalizadas
- ✅ Usa `app-ui-tabs` con interface `TabItem` para navegación por pestañas
- ✅ Usa `app-ui-modal` con evento `(cerrar)` (NO `(onCerrar)`)
- ✅ Usa `app-ui-combobox` para selectores con búsqueda
- ✅ Usa `app-ui-checkbox` para formularios reactivos con ngModel
- ✅ Usa `app-ui-only-icon-button` para acciones rápidas en headers
- ✅ Usa `app-ui-form` como contenedor de formularios completos

---

**Guía actualizada:** 25 de Febrero de 2026  
**Versión:** 1.0.0  
**Proyecto:** Don Papa - Sistema de Gestión
