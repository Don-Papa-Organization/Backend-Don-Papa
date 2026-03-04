import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AnalyticsFilterDto,
  SalesSummaryResponseDto,
  SalesTimelineItemDto,
  TopProductDto,
  DeadStockDto,
  CategoryStockDto,
  UserGrowthResponseDto,
  FrequentUserDto,
  OccupancyResponseDto,
  PromotionEffectivenessResponseDto,
  AnalyticsApiResponseDto
} from '../../domain/statistics/dtos';
import { API_ENDPOINTS, buildApiUrl } from '../../config/api.config';

@Injectable({ providedIn: 'root' })
export class StatisticsApi {
  private readonly salesSummaryUrl = buildApiUrl(API_ENDPOINTS.analytics.salesSummary());
  private readonly salesTimelineUrl = buildApiUrl(API_ENDPOINTS.analytics.salesTimeline());
  private readonly topProductsUrl = buildApiUrl(API_ENDPOINTS.analytics.topProducts());
  private readonly deadStockUrl = buildApiUrl(API_ENDPOINTS.analytics.deadStock());
  private readonly inventoryByCategoryUrl = buildApiUrl(API_ENDPOINTS.analytics.inventoryByCategory());
  private readonly userGrowthUrl = buildApiUrl(API_ENDPOINTS.analytics.userGrowth());
  private readonly frequentUsersUrl = buildApiUrl(API_ENDPOINTS.analytics.frequentUsers());
  private readonly peakHoursUrl = buildApiUrl(API_ENDPOINTS.analytics.peakHours());
  private readonly noShowRateUrl = buildApiUrl(API_ENDPOINTS.analytics.noShowRate());
  private readonly promotionEffectivenessUrl = buildApiUrl(API_ENDPOINTS.analytics.promotionEffectiveness());
  private readonly exportPdfUrl = buildApiUrl(API_ENDPOINTS.export.pdf());
  private readonly exportJsonUrl = buildApiUrl(API_ENDPOINTS.export.json());

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el resumen de ventas para un rango de fechas
   */
  getSalesSummary(filters: AnalyticsFilterDto): Observable<AnalyticsApiResponseDto<SalesSummaryResponseDto>> {
    const params = this.buildParams(filters);
    return this.http.get<AnalyticsApiResponseDto<SalesSummaryResponseDto>>(this.salesSummaryUrl, { params });
  }

  /**
   * Obtiene la timeline de ventas diarias
   */
  getSalesTimeline(filters: AnalyticsFilterDto): Observable<AnalyticsApiResponseDto<SalesTimelineItemDto[]>> {
    const params = this.buildParams(filters);
    return this.http.get<AnalyticsApiResponseDto<SalesTimelineItemDto[]>>(this.salesTimelineUrl, { params });
  }

  /**
   * Obtiene los productos top vendidos
   */
  getTopProducts(filters: AnalyticsFilterDto): Observable<AnalyticsApiResponseDto<TopProductDto[]>> {
    let params = this.buildParams(filters);
    if (filters.limit) {
      params = params.set('limit', filters.limit.toString());
    }
    return this.http.get<AnalyticsApiResponseDto<TopProductDto[]>>(this.topProductsUrl, { params });
  }

  /**
   * Obtiene productos sin movimiento (dead stock)
   */
  getDeadStock(filters: AnalyticsFilterDto): Observable<AnalyticsApiResponseDto<DeadStockDto[]>> {
    const params = this.buildParams(filters);
    return this.http.get<AnalyticsApiResponseDto<DeadStockDto[]>>(this.deadStockUrl, { params });
  }

  /**
   * Obtiene el inventario por categoría
   */
  getInventoryByCategory(filters: AnalyticsFilterDto): Observable<AnalyticsApiResponseDto<CategoryStockDto[]>> {
    const params = this.buildParams(filters);
    return this.http.get<AnalyticsApiResponseDto<CategoryStockDto[]>>(this.inventoryByCategoryUrl, { params });
  }

  /**
   * Obtiene el crecimiento de usuarios
   */
  getUserGrowth(filters: AnalyticsFilterDto): Observable<AnalyticsApiResponseDto<UserGrowthResponseDto>> {
    const params = this.buildParams(filters);
    return this.http.get<AnalyticsApiResponseDto<UserGrowthResponseDto>>(this.userGrowthUrl, { params });
  }

  /**
   * Obtiene los usuarios frecuentes
   */
  getFrequentUsers(filters: AnalyticsFilterDto): Observable<AnalyticsApiResponseDto<FrequentUserDto[]>> {
    const params = this.buildParams(filters);
    return this.http.get<AnalyticsApiResponseDto<FrequentUserDto[]>>(this.frequentUsersUrl, { params });
  }

  /**
   * Obtiene las horas pico de ocupación
   */
  getPeakHours(filters: AnalyticsFilterDto): Observable<AnalyticsApiResponseDto<OccupancyResponseDto>> {
    const params = this.buildParams(filters);
    return this.http.get<AnalyticsApiResponseDto<OccupancyResponseDto>>(this.peakHoursUrl, { params });
  }

  /**
   * Obtiene la tasa de no-show en reservaciones
   */
  getNoShowRate(filters: AnalyticsFilterDto): Observable<AnalyticsApiResponseDto<OccupancyResponseDto>> {
    const params = this.buildParams(filters);
    return this.http.get<AnalyticsApiResponseDto<OccupancyResponseDto>>(this.noShowRateUrl, { params });
  }

  /**
   * Obtiene la efectividad de promociones
   */
  getPromotionEffectiveness(filters: AnalyticsFilterDto): Observable<AnalyticsApiResponseDto<PromotionEffectivenessResponseDto>> {
    const params = this.buildParams(filters);
    return this.http.get<AnalyticsApiResponseDto<PromotionEffectivenessResponseDto>>(this.promotionEffectivenessUrl, { params });
  }

  /**
   * Descarga el dashboard como PDF
   */
  exportPDF(filters: AnalyticsFilterDto): Observable<Blob> {
    const params = this.buildParams(filters);
    return this.http.get(this.exportPdfUrl, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Descarga el dashboard como JSON
   */
  exportJSON(filters: AnalyticsFilterDto): Observable<any> {
    const params = this.buildParams(filters);
    return this.http.get<any>(this.exportJsonUrl, { params });
  }

  /**
   * Helper: construye HttpParams a partir del DTO de filtros
   */
  private buildParams(filters: AnalyticsFilterDto): HttpParams {
    let params = new HttpParams();
    
    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }
    
    return params;
  }
}
