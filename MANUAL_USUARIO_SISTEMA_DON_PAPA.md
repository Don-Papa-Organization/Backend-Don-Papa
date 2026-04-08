# Manual de Usuario - Sistema Don Papa

Este manual de usuario proporciona instrucciones detalladas para el uso del Sistema Don Papa. Describe las funcionalidades disponibles para cada tipo de usuario, siguiendo un orden logico que facilita la navegacion y comprension de las caracteristicas del sistema. El presente documento incluye manuales especificos diferenciados segun el rol del usuario, considerando que las acciones disponibles varian segun el tipo de usuario (Cliente, Administrador o Empleado).

## HISTORIAL DE REVISION

| Version | Fecha Elaboracion | Responsable Elaboracion | Fecha Aprobacion | Responsable Aprobacion |
| --- | --- | --- | --- | --- |
| 1.0 | 2026/04/03 | Juan David Castaneda Herrera |  | Juan David Nieto |
|  |  |  |  |  |

## CAMBIOS RESPECTO A LA VERSION ANTERIOR

| VERSION | MODIFICACION RESPECTO VERSION ANTERIOR |
| --- | --- |
| 1.0 | Version inicial del manual de usuario por roles (Cliente, Empleado, Administrador). |
|  |  |
|  |  |

## Tabla de Contenido

1. Introduccion  
2. Alcance  
3. Definiciones, Siglas y Abreviaturas  
4. Responsables e involucrados  
5. Roles y Usuarios  
6. Ingreso al Sistema  
7. Navegacion  
8. Opciones, Modulos o Funcionalidades  
9. Mensajes  

## 1. Introduccion

Don Papa es una plataforma digital integral disenada para la gestion completa de un negocio de restaurante y comercio de productos. El sistema permite a los clientes explorar el catalogo de productos, realizar pedidos, gestionar reservas y disfrutar de promociones especiales. Para el personal administrativo, proporciona herramientas avanzadas de gestion de inventario, usuarios, reportes analiticos, eventos y estadisticas. Los empleados pueden gestionar ventas en punto de venta (POS), monitorear pedidos web, operar el flujo de mesas y registrar incidencias.

## 2. Alcance

Este documento cubre el uso funcional del sistema Don Papa desde el punto de vista de usuario final, contemplando:

- Frontend web por roles: publico, cliente, empleado y administrador.
- Flujos de autenticacion: inicio de sesion, registro, verificacion de correo y recuperacion de contrasena.
- Modulos operativos conectados a microservicios: inventario, usuarios, pedidos, mesas y reservas, eventos y promociones, reportes y estadisticas.
- Diferencias de acceso segun rol y rutas habilitadas actualmente.

Proyectos asociados:

- Cliente web Angular.
- Gateway API.
- Microservicios ms1 a ms8 (inventario, usuarios, pedidos, reservas, eventos/promociones, reportes/bitacora, email, agente).

Elementos afectados por este documento:

- Operacion diaria de usuarios finales.
- Capacitacion funcional por rol.
- Validacion de alcance funcional vigente.

## 3. Definiciones, Siglas y Abreviaturas

- API: Interfaz de Programacion de Aplicaciones.
- Gateway: Servicio que centraliza y enruta llamadas a microservicios.
- JWT: JSON Web Token para autenticacion/autorizacion.
- POS: Point of Sale (Punto de Venta).
- Rol: Nivel de permisos de un usuario en el sistema.
- Cliente: Usuario final que compra productos y realiza reservas.
- Empleado: Usuario operativo interno de atencion y caja.
- Administrador: Usuario con permisos de gestion integral.
- Catalogo: Vista de productos disponibles para compra.
- Pedido web: Pedido generado por clientes desde el canal web.
- Cuadre de caja: Proceso operativo de control de movimientos de caja.

## 4. Responsables e involucrados

| Nombre | Tipo (Responsable/Involucrado) | Rol |
| --- | --- | --- |
| Juan David Castaneda Herrera | Responsable | Elaboracion de manual y definicion funcional |
| Juan David Nieto | Responsable | Aprobacion del documento |
| Equipo de Desarrollo Don Papa | Involucrado | Desarrollo tecnico y soporte de plataforma |
| Equipo Operativo Don Papa | Involucrado | Uso operativo (empleados y administracion) |

## 5. Roles y Usuarios

### 5.1 Usuarios

Usuarios generales del sistema actualmente contemplados:

- Usuario publico (sin autenticacion).
- Cliente autenticado.
- Empleado autenticado.
- Administrador autenticado.

### 5.2 Roles

Roles disponibles y nivel de privilegio:

- Publico: acceso de consulta (catalogo, eventos y disponibilidad de reservas).
- Cliente: acceso a compra, carrito, pagos, reservas, historial y perfil.
- Empleado: acceso operativo POS, pedidos web, eventos y perfil operativo.
- Administrador: acceso completo de gestion (inventario, usuarios, pedidos, mesas, promociones, reportes, estadisticas).

## 6. Ingreso al Sistema

El ingreso depende del tipo de usuario:

- Publico: puede navegar sin iniciar sesion.
- Cliente/Empleado/Administrador: debe autenticarse.

Flujo de autenticacion disponible:

1. Ir a `/auth/login`.
2. Ingresar credenciales.
3. El sistema redirige automaticamente segun rol.
4. Si no tiene cuenta: `/auth/register`.
5. Si requiere recuperacion: `/auth/forgot-password` y `/auth/reset-password`.
6. Verificacion de correo: `/auth/verify-email`.

Pantallazos sugeridos:

- Pantallazo 1: pantalla de login.
- Pantallazo 2: pantalla de registro.
- Pantallazo 3: flujo de recuperacion de contrasena.
- Pantallazo 4: validacion/verificacion de correo.

Nota: la carpeta de evidencias de pantallazos esta vacia al momento de esta version del manual, por lo que se recomienda adjuntar capturas en una revision 1.1.

## 7. Navegacion

La navegacion se organiza por contexto de acceso y por layout de rol.

Navegacion general:

- Publico (guest): `/catalogo`, `/catalogo/:idProducto`, `/reservas`, `/eventos`, `/eventos/:idEvento`.
- Cliente: prefijo `/client` con modulo principal por secciones.
- Empleado: prefijo `/employee` con menu operativo lateral.
- Administrador: prefijo `/admin` con menu de gestion lateral.

Elementos de navegacion implementados:

- Barra lateral (sidebar) para administrador y empleado.
- Encabezado por modo (client, employee, admin).
- Rutas protegidas con guardas de autenticacion y rol.
- Redirecciones seguras para rutas no validas.

Pantallazos sugeridos:

- Pantallazo 5: menu lateral de administrador.
- Pantallazo 6: menu lateral de empleado.
- Pantallazo 7: home catalogo cliente.
- Pantallazo 8: navegacion publica sin login.

## 8. Opciones, Modulos o Funcionalidades

### 8.1 Opcion 1: Modulos Publicos (sin login)

Acceso:

- Ruta raiz publica y rutas guest.

Funcionalidades vigentes:

- Consultar catalogo de productos.
- Ver detalle de producto.
- Revisar disponibilidad de mesas.
- Consultar eventos proximos y detalle de evento.

Objetivo:

- Permitir exploracion del negocio antes de autenticarse.

### 8.2 Opcion 2: Modulo Cliente

Acceso:

- ` /client ` con control de rol cliente.

Secciones vigentes:

- Catalogo (`/client/catalogo`).
- Perfil (`/client/perfil`).
- Carrito (`/client/carrito`).
- Pedidos (`/client/pedidos`).
- Pagos (`/client/pagos` y registro de pago por pedido).
- Reservas (`/client/reservas`, disponibilidad, confirmacion, historial y detalle).
- Eventos (`/client/eventos`, detalle de evento).

Procesos principales por cliente:

1. Explorar catalogo y productos.
2. Agregar productos al carrito.
3. Confirmar pedido.
4. Registrar pago del pedido.
5. Revisar historial y estado de pedidos.
6. Reservar mesa y gestionar historial de reservas.
7. Actualizar datos de perfil y contrasena.

Pantallazos sugeridos:

- Pantallazo 9: catalogo cliente.
- Pantallazo 10: carrito.
- Pantallazo 11: registro de pago.
- Pantallazo 12: reservas e historial.

### 8.3 Opcion 3: Modulo Empleado

Acceso:

- ` /employee ` con control de rol empleado.

Menu operativo implementado:

- POS (`/employee/orders`).
- Cuadre (`/employee/cuadre-caja`).
- Perfil (`/employee/users`).
- Eventos (`/employee/events-promotions`).
- Pedidos web (`/employee/pedidos-web`).

Funciones operativas relevantes:

- Gestion de ventas por mesa en POS.
- Gestion de pedidos web (confirmar/cancelar/entregar segun estado).
- Consulta y actualizacion de perfil.
- Registro de incidencias desde perfil operativo.
- Consulta de eventos/promociones para apoyo comercial.
- Cuadre de caja.

Importante sobre estado actual:

- Existen rutas de empleado para inventario, mesas-reservas y reportes en la configuracion general, pero sus modulos de ruteo internos se encuentran sin rutas activas en esta version.

Pantallazos sugeridos:

- Pantallazo 13: vista POS.
- Pantallazo 14: detalle de mesa en POS.
- Pantallazo 15: bandeja de pedidos web.
- Pantallazo 16: cuadre de caja.
- Pantallazo 17: perfil empleado.

### 8.4 Opcion 4: Modulo Administrador

Acceso:

- ` /admin ` con control de rol administrador.

Menu de gestion implementado:

- Inventario (`/admin/inventory`).
- Usuarios (`/admin/users`).
- Pedidos (`/admin/orders`).
- Mesas (`/admin/tables-reserves`).
- Promociones y eventos (`/admin/events-promotions`).
- Reportes (`/admin/reports`).
- Estadisticas (`/admin/statistics`).

Funciones de gestion destacadas:

- CRUD de productos y categorias.
- Administracion de clientes, empleados y usuarios.
- Gestion de pedidos y metodos de pago.
- Gestion de mesas y reservas de staff.
- Gestion de promociones, eventos y dias relacionados.
- Consulta de reportes de ventas y bitacora.
- Visualizacion de analitica y estadisticas.

Importante sobre estado actual:

- El modulo de agente para administrador aparece comentado en rutas y no esta habilitado como menu funcional en esta version.

Pantallazos sugeridos:

- Pantallazo 18: inventario admin.
- Pantallazo 19: usuarios admin.
- Pantallazo 20: pedidos admin.
- Pantallazo 21: promociones/eventos.
- Pantallazo 22: reportes.
- Pantallazo 23: estadisticas.

## 9. Mensajes

El sistema muestra mensajes de retroalimentacion en componentes visuales y validaciones de formulario. Se contemplan mensajes de error, advertencia, confirmacion e informacion.

### 9.1 Error

Casos frecuentes:

- Error de conexion con servidor.
- Error de validacion de formulario.
- Error al cargar perfil, pedidos o recursos.
- Error en carga/subida de imagen.

Patrones observados:

- Mensajes tipo error en componentes de ayuda visual.
- Retroalimentacion inline en vistas POS.
- Mensajes de error especificos por accion.

Pantallazo sugerido:

- Pantallazo 24: error de carga de datos/perfil.

### 9.2 Advertencia

Casos frecuentes:

- Stock insuficiente.
- Intentos de acciones con datos incompletos.
- Restricciones de operacion en carrito/pedido.

Pantallazo sugerido:

- Pantallazo 25: advertencia por stock o validacion previa.

### 9.3 Confirmacion

Casos frecuentes:

- Confirmar eliminacion de item del carrito.
- Confirmar acciones de reserva.
- Confirmar cambio de estado de pedido.

Pantallazo sugerido:

- Pantallazo 26: modal de confirmacion.

### 9.4 Informacion

Casos frecuentes:

- Pedido creado correctamente.
- Producto agregado al pedido.
- Estado actualizado.
- Mensajes de guia durante recarga o procesamiento.

Pantallazo sugerido:

- Pantallazo 27: notificacion informativa o de exito.

---

## Anexo A - Resumen de rutas base por rol

- Publico: `/catalogo`, `/reservas`, `/eventos`.
- Auth: `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`.
- Cliente: `/client/catalogo`, `/client/carrito`, `/client/pedidos`, `/client/pagos`, `/client/reservas`, `/client/eventos`, `/client/perfil`.
- Empleado: `/employee/orders`, `/employee/cuadre-caja`, `/employee/users`, `/employee/events-promotions`, `/employee/pedidos-web`.
- Administrador: `/admin/inventory`, `/admin/users`, `/admin/orders`, `/admin/tables-reserves`, `/admin/events-promotions`, `/admin/reports`, `/admin/statistics`.
