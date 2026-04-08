import { environment } from "./environment";

const normalizeBaseUrl = (baseUrl: string): string => baseUrl.replace(/\/+$/, "");
const normalizePath = (path: string): string => (path.startsWith("/") ? path : `/${path}`);

export const buildApiUrl = (path: string): string => {
  const baseUrl = normalizeBaseUrl(environment.apiGatewayUrl || "");
  const route = normalizePath(path);
  return baseUrl ? `${baseUrl}${route}` : route;
};

export const API_ROUTES = {
  inventory: "/inventory",
  users: "/users",
  orders: "/orders",
  payments: "/payments",
  reservations: "/reservations",
  tables: "/table",
  events: "/events",
  promotions: "/promotions",
  eventDays: "/eventos-dias",
  productPromotions: "/productos-promocion",
  promotionEventDays: "/promocion-evento-dia",
  reports: "/reports",
  agent: "/agent",
  analytics: "/analytics",
  export: "/export"
};

export const API_ENDPOINTS = {
  inventory: {
    catalog: () => `${API_ROUTES.inventory}/catalogo`,
    catalogEnriched: () => `${API_ROUTES.inventory}/catalogo/enriquecido`,
    catalogDetail: (id: number) => `${API_ROUTES.inventory}/catalogo/${id}`,
    catalogImage: (id: number) => `${API_ROUTES.inventory}/catalogo/${id}/imagen`,
    products: () => `${API_ROUTES.inventory}/products`,
    productsSearch: () => `${API_ROUTES.inventory}/products/search`,
    productsEnriched: () => `${API_ROUTES.inventory}/products/enriched`,
    productsByCategory: (idCategoria: number) => `${API_ROUTES.inventory}/products/categoria/${idCategoria}`,
    productDetail: (id: number) => `${API_ROUTES.inventory}/products/${id}`,
    productStock: (id: number) => `${API_ROUTES.inventory}/products/${id}/stock`,
    productImage: (id: number) => `${API_ROUTES.inventory}/products/${id}/imagen`,
    productCategory: (idProducto: number, idCategoria: number) => `${API_ROUTES.inventory}/products/${idProducto}/categoria/${idCategoria}`,
    categories: () => `${API_ROUTES.inventory}/categoria`,
    categoryDetail: (id: number) => `${API_ROUTES.inventory}/categoria/${id}`
  },
  users: {
    authRegister: () => `${API_ROUTES.users}/auth/register`,
    authVerifyEmail: () => `${API_ROUTES.users}/auth/verify-email`,
    authLogin: () => `${API_ROUTES.users}/auth/login`,
    authRefreshToken: () => `${API_ROUTES.users}/auth/refresh-token`,
    authResendVerification: () => `${API_ROUTES.users}/auth/resend-verification`,
    authLogout: () => `${API_ROUTES.users}/auth/logout`,
    authProfile: () => `${API_ROUTES.users}/auth/profile`,
    authChangePassword: () => `${API_ROUTES.users}/auth/change-password`,
    authForgotPassword: () => `${API_ROUTES.users}/auth/forgot-password`,
    authResetPassword: () => `${API_ROUTES.users}/auth/reset-password`,
    authCheckEmail: (email: string) => `${API_ROUTES.users}/auth/check-email/${email}`,
    clients: () => `${API_ROUTES.users}/clientes`,
    clientsSearch: () => `${API_ROUTES.users}/clientes/buscar`,
    clientsEnriched: () => `${API_ROUTES.users}/clientes/enriquecido`,
    clientEnrichedDetail: (id: number) => `${API_ROUTES.users}/clientes/enriquecido/${id}`,
    clientDetail: (id: number) => `${API_ROUTES.users}/clientes/${id}`,
    clientForUser: (idUsuario: number) => `${API_ROUTES.users}/clientes/${idUsuario}`,
    clientCreate: () => `${API_ROUTES.users}/clientes/crear`,
    employees: () => `${API_ROUTES.users}/empleados`,
    employeeDetail: (id: number) => `${API_ROUTES.users}/empleados/${id}`,
    employeeByDocument: (documento: string) => `${API_ROUTES.users}/empleados/documento/${documento}`,
    users: () => `${API_ROUTES.users}/usuarios`,
    userDetail: (id: number) => `${API_ROUTES.users}/usuarios/${id}`,
    userByEmail: (correo: string) => `${API_ROUTES.users}/usuarios/correo/${correo}`
  },
  orders: {
    cartProduct: () => `${API_ROUTES.orders}/cart/product`,
    cartProductDetail: (idProductoPedido: number) => `${API_ROUTES.orders}/cart/product/${idProductoPedido}`,
    cart: () => `${API_ROUTES.orders}/cart`,
    confirmOrder: () => `${API_ROUTES.orders}/confirm`,
    createCustomerOrder: () => `${API_ROUTES.orders}/create-customer-order`,
    orderProduct: (idPedido: number) => `${API_ROUTES.orders}/${idPedido}/product`,
    orderProductDetail: (idPedido: number, idProductoPedido: number) => `${API_ROUTES.orders}/${idPedido}/product/${idProductoPedido}`,
    orderDetail: (idPedido: number) => `${API_ROUTES.orders}/${idPedido}`,
    orderCustomerDetail: (idPedido: number) => `${API_ROUTES.orders}/${idPedido}/detail`,
    orderCustomerReceipt: (idPedido: number) => `${API_ROUTES.orders}/${idPedido}/receipt`,
    orderOpenByMesa: (idMesa: number) => `${API_ROUTES.orders}/mesa/${idMesa}/open`,
    productsPromotionPricing: () => `${API_ROUTES.orders}/products/promotion-pricing`,
    orderHistory: () => `${API_ROUTES.orders}/history`,
    ordersInProgress: () => `${API_ROUTES.orders}/in-progress`,
    orderStatus: (idPedido: number) => `${API_ROUTES.orders}/status/${idPedido}`,
    ordersAll: () => `${API_ROUTES.orders}/all`,
    orderStatusUpdate: (idPedido: number) => `${API_ROUTES.orders}/${idPedido}/status`
  },
  payments: {
    pendingOrders: () => `${API_ROUTES.payments}/pending-orders`,
    methods: () => `${API_ROUTES.payments}/methods`,
    methodDetail: (idMetodo: number) => `${API_ROUTES.payments}/methods/${idMetodo}`,
    register: (idPedido: number) => `${API_ROUTES.payments}/register/${idPedido}`,
    mercadoPagoPreference: (idPedido: number) => `${API_ROUTES.payments}/mercadopago/preference/${idPedido}`,
    history: () => `${API_ROUTES.payments}/history`,
    all: () => `${API_ROUTES.payments}/all`,
    paymentDetail: (idPago: number) => `${API_ROUTES.payments}/${idPago}`,
    receipt: (idPago: number) => `${API_ROUTES.payments}/${idPago}/receipt`
  },
  reservations: {
    availability: () => `${API_ROUTES.reservations}/availability`,
    reserve: () => `${API_ROUTES.reservations}/reserve`,
    reserveStaff: () => `${API_ROUTES.reservations}/reserve-staff`,
    history: () => `${API_ROUTES.reservations}/history`,
    daily: () => `${API_ROUTES.reservations}/daily`,
    staffStatus: () => `${API_ROUTES.reservations}/staff/status`,
    status: (idReserva: number) => `${API_ROUTES.reservations}/${idReserva}/status`,
    cancel: (idReserva: number) => `${API_ROUTES.reservations}/${idReserva}/cancel`,
    confirm: (idReserva: number) => `${API_ROUTES.reservations}/${idReserva}/confirm`,
    cancelStaff: (idReserva: number) => `${API_ROUTES.reservations}/${idReserva}/cancel-staff`
  },
  tables: {
    base: () => `${API_ROUTES.tables}`,
    types: () => `${API_ROUTES.tables}/tipos`,
    detail: (idMesa: number) => `${API_ROUTES.tables}/${idMesa}`,
    byStatus: (estado: string) => `${API_ROUTES.tables}/estado/${estado}`,
    statusUpdate: (idMesa: number) => `${API_ROUTES.tables}/${idMesa}/estado`
  },
  events: {
    upcoming: () => `${API_ROUTES.events}/proximos`,
    base: () => `${API_ROUTES.events}`,
    search: () => `${API_ROUTES.events}/search`,
    detail: (id: number) => `${API_ROUTES.events}/${id}`,
    detailFull: (id: number) => `${API_ROUTES.events}/${id}/detalle`
  },
  promotions: {
    base: () => `${API_ROUTES.promotions}`,
    detail: (id: number) => `${API_ROUTES.promotions}/${id}`,
    active: (activas: boolean) => `${API_ROUTES.promotions}/activas/${activas}`,
    toggleActive: (id: number) => `${API_ROUTES.promotions}/${id}/toggle-active`
  },
  eventDays: {
    base: () => `${API_ROUTES.eventDays}`,
    byEvent: (idEvento: number) => `${API_ROUTES.eventDays}/evento/${idEvento}`,
    detail: (idEventoSemana: number) => `${API_ROUTES.eventDays}/${idEventoSemana}`
  },
  productPromotions: {
    base: () => `${API_ROUTES.productPromotions}`,
    detail: (id: number) => `${API_ROUTES.productPromotions}/${id}`,
    byPromotion: (idPromocion: number) => `${API_ROUTES.productPromotions}/promocion/${idPromocion}`,
    byPromotionEnriched: (idPromocion: number) => `${API_ROUTES.productPromotions}/promocion/${idPromocion}/enriquecido`,
    byProduct: (idProducto: number) => `${API_ROUTES.productPromotions}/producto/${idProducto}/promociones`
  },
  promotionEventDays: {
    base: () => `${API_ROUTES.promotionEventDays}`,
    detail: (id: number) => `${API_ROUTES.promotionEventDays}/${id}`,
    byEventDay: (idEventoDiaSemana: number) => `${API_ROUTES.promotionEventDays}/evento-dia/${idEventoDiaSemana}`
  },
  reports: {
    salesHistory: () => `${API_ROUTES.reports}/sales/history`,
    salesDetail: (idPedido: number) => `${API_ROUTES.reports}/sales/${idPedido}/detail`,
    salesByDates: () => `${API_ROUTES.reports}/sales/by-dates`,
    bitacoraIncidents: () => `${API_ROUTES.reports}/bitacora/incidents`,
    bitacoraComments: () => `${API_ROUTES.reports}/bitacora/comments`,
    bitacoraByEmployee: (idEmpleado: number) => `${API_ROUTES.reports}/bitacora/employee/${idEmpleado}`,
    bitacoraSearch: () => `${API_ROUTES.reports}/bitacora`
  },
  agent: {
    query: () => `${API_ROUTES.agent}/query`,
    health: () => `${API_ROUTES.agent}/health`
  },
  analytics: {
    salesSummary: () => `${API_ROUTES.reports}${API_ROUTES.analytics}/sales/summary`,
    salesTimeline: () => `${API_ROUTES.reports}${API_ROUTES.analytics}/sales/timeline`,
    topProducts: () => `${API_ROUTES.reports}${API_ROUTES.analytics}/products/top`,
    deadStock: () => `${API_ROUTES.reports}${API_ROUTES.analytics}/products/dead-stock`,
    inventoryByCategory: () => `${API_ROUTES.reports}${API_ROUTES.analytics}/inventory/by-category`,
    userGrowth: () => `${API_ROUTES.reports}${API_ROUTES.analytics}/users/growth`,
    frequentUsers: () => `${API_ROUTES.reports}${API_ROUTES.analytics}/users/frequent`,
    peakHours: () => `${API_ROUTES.reports}${API_ROUTES.analytics}/occupancy/peak-hours`,
    noShowRate: () => `${API_ROUTES.reports}${API_ROUTES.analytics}/occupancy/no-show`,
    promotionEffectiveness: () => `${API_ROUTES.reports}${API_ROUTES.analytics}/promotions/effectiveness`
  },
  export: {
    pdf: () => `${API_ROUTES.reports}${API_ROUTES.export}/pdf`,
    json: () => `${API_ROUTES.reports}${API_ROUTES.export}/data`
  }
};
