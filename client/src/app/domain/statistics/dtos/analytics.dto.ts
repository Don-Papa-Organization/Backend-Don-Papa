/**
 * DTOs para el módulo de Estadísticas (Analytics)
 * Basados en las respuestas del microservicio MS6
 */

// ============ FILTROS ============
export interface AnalyticsFilterDto {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  limit?: number;    // Para top products
}

// ============ PERÍODO ============
export interface PeriodoDto {
  desde: string | Date;
  hasta: string | Date;
}

// ============ RESUMEN DE VENTAS ============
export interface SalesResumenDto {
  totalVentas: number;
  cantidadPedidos: number;
  ventasFisico: number;
  ventasWeb: number;
  totalDescuentos: number;
  margenPromedio: string | number;
}

export interface DailySalesSummaryDto {
  id?: number;
  fecha: Date;
  totalVentas: number;
  cantidadPedidos: number;
  canalFisico: number;
  canalWeb: number;
  totalDescuentos?: number;
  createdAt?: Date;
}

export interface SalesSummaryResponseDto {
  periodo: PeriodoDto;
  resumen: SalesResumenDto;
  detalles: DailySalesSummaryDto[];
}

// ============ TIMELINE DE VENTAS ============
export interface SalesTimelineItemDto {
  fecha: Date;
  totalVentas: number;
  cantidadPedidos: number;
  canalFisico: number;
  canalWeb: number;
}

// ============ PRODUCTOS TOP ============
export interface TopProductDto {
  idProducto: number;
  cantidadVendida: number;
  ingresosGenerados: number;
  fecha?: Date;
}

// ============ INVENTARIO ============
export interface DeadStockDto {
  idProducto: number;
  nombreProducto?: string;
  diasSinVentas: number;
}

export interface CategoryStockDto {
  idCategoria: number;
  stockTotal: number;
  productosUnicos: number;
  fecha?: Date;
}

// ============ CRECIMIENTO DE USUARIOS ============
export interface UserGrowthResumenDto {
  totalNuevosRegistros: number;
  clientesFrecuentesPromedio: number;
}

export interface DailyUserGrowthDto {
  fecha: Date;
  nuevosRegistros: number;
  clientesFrecuentesActivos: number;
}

export interface UserGrowthResponseDto {
  periodo: PeriodoDto;
  resumen: UserGrowthResumenDto;
  detalles: DailyUserGrowthDto[];
}

// ============ OCUPACIÓN Y RESERVAS ============
export interface FrequentUserDto {
  idUsuario: number;
  cantidadCompras: number;
  montoTotal: number;
  fecha?: Date | string;
}

export interface PeakHourDto {
  hora: number;
  cantidadReservas: number;
  tasaOcupacion: number;
}

export interface ReservationOccupancyDto {
  fecha: Date;
  horaPico?: number;
  cantidadReservas: number;
  tasaNoShow: number;
}

export interface OccupancyResponseDto {
  periodo: PeriodoDto;
  picos: PeakHourDto[];
  tasaNoShowPromedio: number;
  detalles: ReservationOccupancyDto[];
}

// ============ PROMOCIONES ============
export interface PromotionPerformanceDto {
  idPromocion: number;
  idEvento?: number;
  fecha: Date;
  usosAplicados: number;
  ingresoBajoPromocion: number;
}

export interface PromotionResumenDto {
  totalUsos: number;
  totalIngresos: number;
  ingresoPromedioPorUso: number;
}

export interface PromotionEffectivenessResponseDto {
  periodo: PeriodoDto;
  resumen: PromotionResumenDto;
  detalles: PromotionPerformanceDto[];
}

// ============ RESPUESTAS GENÉRICAS ============
export interface AnalyticsApiResponseDto<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
  timestamp?: string;
}

// ============ ESTADO DEL DASHBOARD ============
export interface DashboardStateDto {
  salesSummary: SalesSummaryResponseDto | null;
  salesTimeline: SalesTimelineItemDto[] | null;
  topProducts: TopProductDto[] | null;
  deadStock: DeadStockDto[] | null;
  categoryStock: CategoryStockDto[] | null;
  userGrowth: UserGrowthResponseDto | null;
  frequentUsers: FrequentUserDto[] | null;
  occupancy: OccupancyResponseDto | null;
  promotions: PromotionEffectivenessResponseDto | null;
  
  // Estados de carga
  loadingState: {
    salesSummary: boolean;
    salesTimeline: boolean;
    topProducts: boolean;
    deadStock: boolean;
    categoryStock: boolean;
    userGrowth: boolean;
    frequentUsers: boolean;
    occupancy: boolean;
    promotions: boolean;
  };
  
  // Estados de error
  errorState: {
    salesSummary: string | null;
    salesTimeline: string | null;
    topProducts: string | null;
    deadStock: string | null;
    categoryStock: string | null;
    userGrowth: string | null;
    frequentUsers: string | null;
    occupancy: string | null;
    promotions: string | null;
  };
  
  // Filtros actuales
  filters: AnalyticsFilterDto;
}
