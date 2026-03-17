# Mapeo de Servicios API Frontend (Archivo > Rol)

Se detalla el acceso a los métodos de la API del frontend, organizados por archivo de servicio y categorizados por el rol requerido para su ejecución.

---

## 📦 `inventory.api.ts`

Gestión de catálogo, productos y existencias.

### 🛡️ Administrador

- `createProduct`: `POST /inventory/products`
- `updateProduct`: `PUT /inventory/products/:id`
- `associateProductCategory`: `PUT /inventory/products/:id/categoria/:idCat`
- `uploadProductImage`: `POST /inventory/products/:id/imagen`
- `deleteProduct`: `DELETE /inventory/products/:id`
- `createCategory`: `POST /inventory/categoria`
- `updateCategory`: `PUT /inventory/categoria/:id`
- `deleteCategory`: `DELETE /inventory/categoria/:id`

### 🧑‍🍳 Empleado

- `listProducts`: `GET /inventory/products`
- `getProduct`: `GET /inventory/products/:id`
- `updateProductStock`: `PATCH /inventory/products/:id/stock`
- `listCategories`: `GET /inventory/categoria`
- `getCategory`: `GET /inventory/categoria/:id`

### 🌐 Público (No requiere rol)

- `listCatalog`: `GET /inventory/catalogo`
- `getCatalogDetail`: `GET /inventory/catalogo/:id`
- `getProductImageUrl`: `GET /inventory/catalogo/:id/imagen`

---

## 👥 `users.api.ts`

Autenticación, perfiles y gestión de personal/clientes.

### 🛡️ Administrador

- `listClients`: `GET /users/clientes`
- `searchClients`: `GET /users/clientes/buscar`
- `listClientsEnriched`: `GET /users/clientes/enriquecido`
- `getClientEnriched`: `GET /users/clientes/enriquecido/:id`
- `createClientForUser`: `POST /users/clientes/:idUsuario`
- `listEmployees`: `GET /users/empleados`
- `getEmployee`: `GET /users/empleados/:id`
- `createEmployee`: `POST /users/empleados`
- `listUsers`: `GET /users/usuarios`
- `getUser`: `GET /users/usuarios/:id`
- `getUserByEmail`: `GET /users/usuarios/correo/:correo`

### 🧑‍🍳 Empleado

- `getEmployeeByDocument`: `GET /users/empleados/documento/:doc`
- `getProfile`: `GET /users/auth/profile`
- `updateProfile`: `PUT /users/auth/profile`
- `changePassword`: `POST /users/auth/change-password`
- `logout`: `POST /users/auth/logout`

### 👤 Cliente

- `createClient`: `POST /users/clientes/crear`
- `getClient`: `GET /users/clientes/:id`
- `getProfile`: `GET /users/auth/profile`
- `updateProfile`: `PUT /users/auth/profile`
- `changePassword`: `POST /users/auth/change-password`
- `logout`: `POST /users/auth/logout`

### 🌐 Público (No requiere rol)

- `register`: `POST /users/auth/register`
- `login`: `POST /users/auth/login`
- `verifyEmail`: `GET /users/auth/verify-email`
- `refreshToken`: `POST /users/auth/refresh-token`
- `resendVerification`: `POST /users/auth/resend-verification`
- `forgotPassword`: `POST /users/auth/forgot-password`
- `resetPassword`: `POST /users/auth/reset-password`
- `checkEmail`: `GET /users/auth/check-email/:email`

---

## 🛒 `orders.api.ts`

Carrito, pedidos y gestión de pagos.

### 🛡️ Administrador / 🧑‍🍳 Empleado

- `createCustomerOrder`: `POST /orders/create-customer-order`
- `addProductToOrder`: `POST /orders/:id/product`
- `removeProductFromOrder`: `DELETE /orders/:id/product/:idPP`
- `deleteOrder`: `DELETE /orders/:id`
- `getOrderById`: `GET /orders/:id`
- `listAllOrders`: `GET /orders/all`
- `updateOrderStatus`: `PATCH /orders/:id/status`
- `getPaymentHistory`: `GET /payments/history`
- `listAllPayments`: `GET /payments/all` (Admin solo)
- `createPaymentMethod`: `POST /payments/methods` (Admin solo)
- `updatePaymentMethod`: `PUT /payments/methods/:id` (Admin solo)
- `deletePaymentMethod`: `DELETE /payments/methods/:id` (Admin solo)

### 👤 Cliente

- `addProductToCart`: `POST /orders/cart/product`
- `removeProductFromCart`: `DELETE /orders/cart/product/:id`
- `updateProductQuantity`: `PATCH /orders/cart/product/:id`
- `clearCart`: `DELETE /orders/cart`
- `getCart`: `GET /orders/cart`
- `confirmOrder`: `POST /orders/confirm`
- `listOrderHistory`: `GET /orders/history`
- `getCustomerOrderDetail`: `GET /orders/:id/detail`
- `listOrdersInProgress`: `GET /orders/in-progress`
- `checkOrderStatus`: `GET /orders/status/:id`

### Mixto (Cliente / Empleado / Admin)

- `listPendingPaymentOrders`: `GET /payments/pending-orders`
- `listPaymentMethods`: `GET /payments/methods`
- `registerPayment`: `POST /payments/register/:id`
- `downloadReceipt`: `GET /payments/:id/receipt`

---

## 📊 `reports.api.ts`

Reportes de ventas y bitácora de incidencias.

### 🛡️ Administrador

- `getBitacoraByEmployee`: `GET /reports/bitacora/employee/:id`
- `searchBitacora`: `GET /reports/bitacora`
- `getSalesHistory`: `GET /reports/sales/history`
- `getSaleDetail`: `GET /reports/sales/:id/detail`
- `getSalesReportByDates`: `GET /reports/sales/by-dates`

### 🧑‍🍳 Empleado

- `registerIncident`: `POST /reports/bitacora/incidents`
- `registerComment`: `POST /reports/bitacora/comments`

---

## 🪑 `tables&Reserves.api.ts`

Gestión de mesas y reservaciones.

### 🛡️ Administrador

- `createTable`: `POST /table`
- `updateTable`: `PUT /table/:id`
- `deleteTable`: `DELETE /table/:id`
- `cancelReservationByStaff`: `DELETE /reservations/:id/cancel-staff`

### 🧑‍🍳 Empleado

- `getDailyReservations`: `GET /reservations/daily`
- `confirmReservation`: `PUT /reservations/:id/confirm`
- `listReservationsByStatus`: `GET /reservations/staff/status`
- `updateTableStatus`: `PATCH /table/:id/estado`

### 👤 Cliente

- `reserveTable`: `POST /reservations/reserve`
- `getReservationHistory`: `GET /reservations/history`
- `cancelReservation`: `DELETE /reservations/:id/cancel`
- `getReservationStatus`: `GET /reservations/:id/status`

### 🌐 Público (No requiere rol)

- `checkAvailability`: `GET /reservations/availability`
- `listTables`: `GET /table`
- `getTable`: `GET /table/:id`
- `listTablesByStatus`: `GET /table/estado/:estado`

---

## 📅 `events&Promotions.api.ts`

Eventos nocturnos, promociones y días destacados.

### 🛡️ Administrador

- `createPromotion`: `POST /promotions`
- `updatePromotion`: `PUT /promotions/:id`
- `deletePromotion`: `DELETE /promotions/:id`
- `togglePromotionActive`: `PATCH /promotions/:id/toggle-active`
- `createEvent`: `POST /events`
- `updateEvent`: `PUT /events/:id`
- `deleteEvent`: `DELETE /events/:id`
- `createEventDay`: `POST /eventos-dias`
- `updateEventDay`: `PUT /eventos-dias/:id`
- `deleteEventDay`: `DELETE /eventos-dias/:id`
- `createProductPromotion`: `POST /productos-promocion`
- `updateProductPromotion`: `PUT /productos-promocion/:id`
- `deleteProductPromotion`: `DELETE /productos-promocion/:id`
- `listPromocionEventoDias`: `GET /promocion-evento-dia`
- `getPromocionEventoDiaById`: `GET /promocion-evento-dia/:id`
- `getPromotionsByEventDay`: `GET /promocion-evento-dia/evento-dia/:idEventoDiaSemana`
- `createPromocionEventoDia`: `POST /promocion-evento-dia`
- `updatePromocionEventoDia`: `PUT /promocion-evento-dia/:id`
- `deletePromocionEventoDia`: `DELETE /promocion-evento-dia/:id`

### 🧑‍🍳 Empleado / Admin

- `listPromotions`: `GET /promotions`
- `getPromotion`: `GET /promotions/:id`
- `listActivePromotions`: `GET /promotions/activas/:status`

### 🌐 Público (No requiere rol)

- `listUpcomingEvents`: `GET /events/proximos`
- `getEventDetail`: `GET /events/:id/detalle`
- `searchEvents`: `GET /events/search`
