import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { StatisticsApi } from '../../../../../services/apis/statistics.api';
import {
  AnalyticsFilterDto,
  DashboardStateDto,
  PeriodoDto,
  SalesSummaryResponseDto,
  SalesTimelineItemDto,
  WeeklySalesResponseDto,
  TopProductDto,
  DeadStockDto,
  CategoryStockDto,
  UserGrowthResponseDto,
  FrequentUsersResponseDto,
  PeakHourDto,
  ReservationOccupancyDto,
  OccupancyResponseDto,
  PromotionEffectivenessResponseDto
} from '../../../../../domain/statistics/dtos';

@Injectable({ providedIn: 'root' })
export class StatisticsFacade {
  // Estado centralizado del dashboard
  private readonly initialState: DashboardStateDto = {
    salesSummary: null,
    salesTimeline: null,
    weeklySales: null,
    topProducts: null,
    deadStock: null,
    categoryStock: null,
    userGrowth: null,
    frequentUsers: null,
    occupancy: null,
    promotions: null,
    loadingState: {
      salesSummary: false,
      salesTimeline: false,
      weeklySales: false,
      topProducts: false,
      deadStock: false,
      categoryStock: false,
      userGrowth: false,
      frequentUsers: false,
      occupancy: false,
      promotions: false
    },
    errorState: {
      salesSummary: null,
      salesTimeline: null,
      weeklySales: null,
      topProducts: null,
      deadStock: null,
      categoryStock: null,
      userGrowth: null,
      frequentUsers: null,
      occupancy: null,
      promotions: null
    },
    filters: {
      startDate: '',
      endDate: '',
      limit: 10
    }
  };

  private readonly dashboardState$ = new BehaviorSubject<DashboardStateDto>(this.initialState);
  
  constructor(private statisticsApi: StatisticsApi) {}

  /**
   * Observable del estado completo del dashboard
   */
  getDashboardState(): Observable<DashboardStateDto> {
    return this.dashboardState$.asObservable();
  }

  /**
   * Obtiene el estado actual sin subscribe
   */
  getCurrentState(): DashboardStateDto {
    return this.dashboardState$.getValue();
  }

  /**
   * Carga todos los datos del dashboard en paralelo
   * Si un endpoint falla, continúa cargando los demás
   */
  loadDashboard(filters: AnalyticsFilterDto): Observable<DashboardStateDto> {
    // Actualizar filtros
    this.updateFilters(filters);

    // Marcar todos como cargando
    this.setLoadingState(true);

    // Disparar todas las peticiones en paralelo con error handling individual
    const requests = {
      salesSummary: this.statisticsApi.getSalesSummary(filters).pipe(
        tap(response => this.setSalesSummary(response.data || null)),
        catchError(error => {
          this.setError('salesSummary', this.getErrorMessage(error));
          return of(null);
        })
      ),
      salesTimeline: this.statisticsApi.getSalesTimeline(filters).pipe(
        tap(response => this.setSalesTimeline(this.normalizeSalesTimelineData(response.data))),
        catchError(error => {
          this.setError('salesTimeline', this.getErrorMessage(error));
          return of(null);
        })
      ),
      weeklySales: this.statisticsApi.getWeeklySales(filters).pipe(
        tap(response => this.setWeeklySales(response.data || null)),
        catchError(error => {
          this.setError('weeklySales', this.getErrorMessage(error));
          return of(null);
        })
      ),
      topProducts: this.statisticsApi.getTopProducts(filters).pipe(
        tap(response => this.setTopProducts(response.data || null)),
        catchError(error => {
          this.setError('topProducts', this.getErrorMessage(error));
          return of(null);
        })
      ),
      deadStock: this.statisticsApi.getDeadStock(filters).pipe(
        tap(response => this.setDeadStock(this.normalizeDeadStockData(response.data))),
        catchError(error => {
          this.setError('deadStock', this.getErrorMessage(error));
          return of(null);
        })
      ),
      categoryStock: this.statisticsApi.getInventoryByCategory(filters).pipe(
        tap(response => this.setCategoryStock(this.normalizeCategoryStockData(response.data))),
        catchError(error => {
          this.setError('categoryStock', this.getErrorMessage(error));
          return of(null);
        })
      ),
      userGrowth: this.statisticsApi.getUserGrowth(filters).pipe(
        tap(response => this.setUserGrowth(response.data || null)),
        catchError(error => {
          this.setError('userGrowth', this.getErrorMessage(error));
          return of(null);
        })
      ),
      frequentUsers: this.statisticsApi.getFrequentUsers(filters).pipe(
        tap(response => this.setFrequentUsers(this.normalizeFrequentUsersData(response.data))),
        catchError(error => {
          this.setError('frequentUsers', this.getErrorMessage(error));
          return of(null);
        })
      ),
      occupancy: forkJoin({
        peakHours: this.statisticsApi.getPeakHours(filters),
        noShow: this.statisticsApi.getNoShowRate(filters)
      }).pipe(
        map(({ peakHours, noShow }) => this.mergeOccupancyResponses(peakHours.data, noShow.data, filters)),
        tap(occupancy => this.setOccupancy(occupancy)),
        catchError(error => {
          this.setError('occupancy', this.getErrorMessage(error));
          return of(null);
        })
      ),
      promotions: this.statisticsApi.getPromotionEffectiveness(filters).pipe(
        tap(response => this.setPromotions(this.normalizePromotionEffectivenessData(response.data, filters))),
        catchError(error => {
          this.setError('promotions', this.getErrorMessage(error));
          return of(null);
        })
      )
    };

    // Esperar a que todas las peticiones terminen (exitosas o no)
    return forkJoin(requests).pipe(
      finalize(() => this.setLoadingState(false)),
      map(() => this.getCurrentState())
    );
  }

  /**
   * Carga una sección específica del dashboard
   */
  loadSection(
    section: keyof Omit<DashboardStateDto, 'loadingState' | 'errorState' | 'filters'>,
    filters: AnalyticsFilterDto
  ): Observable<any> {
    this.setLoading(section, true);
    this.clearError(section);

    let request$: Observable<any>;

    switch (section) {
      case 'salesSummary':
        request$ = this.statisticsApi.getSalesSummary(filters).pipe(
          tap(response => this.setSalesSummary(response.data || null))
        );
        break;
      case 'salesTimeline':
        request$ = this.statisticsApi.getSalesTimeline(filters).pipe(
          tap(response => this.setSalesTimeline(this.normalizeSalesTimelineData(response.data)))
        );
        break;
      case 'weeklySales':
        request$ = this.statisticsApi.getWeeklySales(filters).pipe(
          tap(response => this.setWeeklySales(response.data || null))
        );
        break;
      case 'topProducts':
        request$ = this.statisticsApi.getTopProducts(filters).pipe(
          tap(response => this.setTopProducts(response.data || null))
        );
        break;
      case 'deadStock':
        request$ = this.statisticsApi.getDeadStock(filters).pipe(
          tap(response => this.setDeadStock(this.normalizeDeadStockData(response.data)))
        );
        break;
      case 'categoryStock':
        request$ = this.statisticsApi.getInventoryByCategory(filters).pipe(
          tap(response => this.setCategoryStock(this.normalizeCategoryStockData(response.data)))
        );
        break;
      case 'userGrowth':
        request$ = this.statisticsApi.getUserGrowth(filters).pipe(
          tap(response => this.setUserGrowth(response.data || null))
        );
        break;
      case 'frequentUsers':
        request$ = this.statisticsApi.getFrequentUsers(filters).pipe(
          tap(response => this.setFrequentUsers(this.normalizeFrequentUsersData(response.data)))
        );
        break;
      case 'occupancy':
        request$ = forkJoin({
          peakHours: this.statisticsApi.getPeakHours(filters),
          noShow: this.statisticsApi.getNoShowRate(filters)
        }).pipe(
          map(({ peakHours, noShow }) => this.mergeOccupancyResponses(peakHours.data, noShow.data, filters)),
          tap(occupancy => this.setOccupancy(occupancy))
        );
        break;
      case 'promotions':
        request$ = this.statisticsApi.getPromotionEffectiveness(filters).pipe(
          tap(response => this.setPromotions(this.normalizePromotionEffectivenessData(response.data, filters)))
        );
        break;
      default:
        request$ = of(null);
    }

    return request$.pipe(
      catchError(error => {
        this.setError(section, this.getErrorMessage(error));
        return of(null);
      }),
      finalize(() => this.setLoading(section, false))
    );
  }

  /**
   * Descarga el dashboard como PDF
   */
  downloadPDF(filters: AnalyticsFilterDto): Observable<Blob> {
    return this.statisticsApi.exportPDF(filters).pipe(
      tap(blob => this.triggerDownload(blob, 'analytics.pdf')),
      catchError(error => {
        console.error('Error downloading PDF:', error);
        throw error;
      })
    );
  }

  /**
   * Descarga el dashboard como JSON
   */
  downloadJSON(filters: AnalyticsFilterDto): Observable<any> {
    return this.statisticsApi.exportJSON(filters).pipe(
      tap(data => this.triggerDownload(
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
        'analytics.json'
      )),
      catchError(error => {
        console.error('Error downloading JSON:', error);
        throw error;
      })
    );
  }

  /**
   * Resetea el estado del dashboard
   */
  reset(): void {
    this.dashboardState$.next(this.initialState);
  }

  // ============ MÉTODOS PRIVADOS DE ACTUALIZACIÓN DE ESTADO ============

  private updateFilters(filters: AnalyticsFilterDto): void {
    const state = this.getCurrentState();
    this.dashboardState$.next({
      ...state,
      filters
    });
  }

  private setLoadingState(loading: boolean): void {
    const state = this.getCurrentState();
    this.dashboardState$.next({
      ...state,
      loadingState: {
        salesSummary: loading,
        salesTimeline: loading,
        weeklySales: loading,
        topProducts: loading,
        deadStock: loading,
        categoryStock: loading,
        userGrowth: loading,
        frequentUsers: loading,
        occupancy: loading,
        promotions: loading
      }
    });
  }

  private setLoading(section: string, loading: boolean): void {
    const state = this.getCurrentState();
    this.dashboardState$.next({
      ...state,
      loadingState: {
        ...state.loadingState,
        [section]: loading
      }
    });
  }

  private setError(section: string, error: string | null): void {
    const state = this.getCurrentState();
    this.dashboardState$.next({
      ...state,
      errorState: {
        ...state.errorState,
        [section]: error
      }
    });
  }

  private clearError(section: string): void {
    this.setError(section, null);
  }

  private setSalesSummary(data: SalesSummaryResponseDto | null): void {
    const state = this.getCurrentState();
    this.dashboardState$.next({ ...state, salesSummary: data });
    if (data) this.clearError('salesSummary');
  }

  private setSalesTimeline(data: SalesTimelineItemDto[] | null): void {
    const state = this.getCurrentState();
    this.dashboardState$.next({ ...state, salesTimeline: data });
    if (data) this.clearError('salesTimeline');
  }

  private setWeeklySales(data: WeeklySalesResponseDto | null): void {
    const state = this.getCurrentState();
    this.dashboardState$.next({ ...state, weeklySales: data });
    if (data) this.clearError('weeklySales');
  }

  private setTopProducts(data: TopProductDto[] | null): void {
    const state = this.getCurrentState();
    this.dashboardState$.next({ ...state, topProducts: data });
    if (data) this.clearError('topProducts');
  }

  private setDeadStock(data: DeadStockDto[] | null): void {
    const state = this.getCurrentState();
    this.dashboardState$.next({ ...state, deadStock: data });
    if (data) this.clearError('deadStock');
  }

  private setCategoryStock(data: CategoryStockDto[] | null): void {
    const state = this.getCurrentState();
    this.dashboardState$.next({ ...state, categoryStock: data });
    if (data) this.clearError('categoryStock');
  }

  private setUserGrowth(data: UserGrowthResponseDto | null): void {
    const state = this.getCurrentState();
    this.dashboardState$.next({ ...state, userGrowth: data });
    if (data) this.clearError('userGrowth');
  }

  private setFrequentUsers(data: FrequentUsersResponseDto | null): void {
    const state = this.getCurrentState();
    this.dashboardState$.next({ ...state, frequentUsers: data });
    if (data) this.clearError('frequentUsers');
  }

  private setOccupancy(data: OccupancyResponseDto | null): void {
    const state = this.getCurrentState();
    this.dashboardState$.next({ ...state, occupancy: data });
    if (data) this.clearError('occupancy');
  }

  private setPromotions(data: PromotionEffectivenessResponseDto | null): void {
    const state = this.getCurrentState();
    this.dashboardState$.next({ ...state, promotions: data });
    if (data) this.clearError('promotions');
  }

  private normalizeOccupancyFromPeakHours(rawData: any, filters: AnalyticsFilterDto): OccupancyResponseDto {
    const details: any[] = Array.isArray(rawData?.detalles) ? rawData.detalles : [];

    const picos: PeakHourDto[] = details
      .filter(item => item?.horaPico !== null && item?.horaPico !== undefined)
      .map(item => ({
        hora: Number(item.horaPico ?? 0),
        cantidadReservas: Number(item.cantidadReservas ?? 0),
        tasaOcupacion: 0
      }));

    const occupancyDetails: ReservationOccupancyDto[] = details.map(item => ({
      fecha: item?.fecha,
      horaPico: item?.horaPico,
      cantidadReservas: Number(item?.cantidadReservas ?? 0),
      tasaNoShow: Number(item?.tasaNoShow ?? 0)
    }));

    return {
      periodo: this.resolvePeriodo(rawData?.periodo, filters),
      picos,
      tasaNoShowPromedio: 0,
      detalles: occupancyDetails
    };
  }

  private normalizeOccupancyFromNoShow(rawData: any, filters: AnalyticsFilterDto): OccupancyResponseDto {
    const details: any[] = Array.isArray(rawData?.detalles) ? rawData.detalles : [];

    const occupancyDetails: ReservationOccupancyDto[] = details.map(item => ({
      fecha: item?.fecha,
      cantidadReservas: Number(item?.cantidadReservas ?? 0),
      tasaNoShow: Number(item?.tasaNoShow ?? 0)
    }));

    return {
      periodo: this.resolvePeriodo(rawData?.periodo, filters),
      picos: [],
      tasaNoShowPromedio: Number(rawData?.tasaNoShowPromedio ?? 0),
      detalles: occupancyDetails
    };
  }

  private mergeOccupancyResponses(peakRaw: any, noShowRaw: any, filters: AnalyticsFilterDto): OccupancyResponseDto {
    const peakNormalized = this.normalizeOccupancyFromPeakHours(peakRaw, filters);
    const noShowNormalized = this.normalizeOccupancyFromNoShow(noShowRaw, filters);

    return {
      periodo: peakNormalized.periodo,
      picos: peakNormalized.picos,
      tasaNoShowPromedio: noShowNormalized.tasaNoShowPromedio,
      detalles: peakNormalized.detalles.length > 0 ? peakNormalized.detalles : noShowNormalized.detalles
    };
  }

  private resolvePeriodo(rawPeriodo: any, filters: AnalyticsFilterDto): PeriodoDto {
    return {
      desde: rawPeriodo?.desde ?? filters.startDate,
      hasta: rawPeriodo?.hasta ?? filters.endDate
    };
  }

  private normalizeSalesTimelineData(rawData: any): SalesTimelineItemDto[] | null {
    if (!rawData) return null;

    if (Array.isArray(rawData)) {
      return rawData;
    }

    if (Array.isArray(rawData?.puntos)) {
      return rawData.puntos;
    }

    return [];
  }

  private normalizeDeadStockData(rawData: any): DeadStockDto[] | null {
    if (!rawData) return null;

    if (Array.isArray(rawData)) {
      return rawData;
    }

    if (Array.isArray(rawData?.productosSinVentas)) {
      return rawData.productosSinVentas.map((item: any) => ({
        idProducto: Number(item?.idProducto ?? 0),
        nombreProducto: item?.nombreProducto ?? item?.nombre,
        diasSinVentas: Number(item?.diasSinVentas ?? 0)
      }));
    }

    return [];
  }

  private normalizeCategoryStockData(rawData: any): CategoryStockDto[] | null {
    if (!rawData) return null;

    if (Array.isArray(rawData)) {
      return rawData;
    }

    if (Array.isArray(rawData?.categorias)) {
      return rawData.categorias;
    }

    return [];
  }

  private normalizeFrequentUsersData(rawData: any): FrequentUsersResponseDto | null {
    if (!rawData) return null;

    if (Array.isArray(rawData)) {
      return {
        serie: rawData.map((item: any) => ({
          fecha: item?.fecha,
          clientesFrecuentesActivos: Number(item?.clientesFrecuentesActivos ?? item?.cantidadCompras ?? 0),
          nuevosRegistros: Number(item?.nuevosRegistros ?? 0)
        })),
        resumen: {
          ultimoValorFrecuentes: 0,
          promedioFrecuentes: 0
        }
      };
    }

    const serie = Array.isArray(rawData?.serie)
      ? rawData.serie.map((item: any) => ({
          fecha: item?.fecha,
          clientesFrecuentesActivos: Number(item?.clientesFrecuentesActivos ?? 0),
          nuevosRegistros: Number(item?.nuevosRegistros ?? 0)
        }))
      : [];

    return {
      serie,
      resumen: {
        ultimoValorFrecuentes: Number(rawData?.resumen?.ultimoValorFrecuentes ?? 0),
        promedioFrecuentes: Number(rawData?.resumen?.promedioFrecuentes ?? 0)
      }
    };
  }

  private normalizePromotionEffectivenessData(
    rawData: any,
    filters: AnalyticsFilterDto
  ): PromotionEffectivenessResponseDto | null {
    if (!rawData) return null;

    if (rawData?.resumen && Array.isArray(rawData?.topPromociones)) {
      return {
        periodo: this.resolvePeriodo(rawData?.periodo, filters),
        resumen: {
          totalPromociones: Number(rawData.resumen.totalPromociones ?? 0),
          totalUsosAplicados: Number(rawData.resumen.totalUsosAplicados ?? 0),
          ingresoTotalPromo: Number(rawData.resumen.ingresoTotalPromo ?? 0),
          ingresoPromedio: Number(rawData.resumen.ingresoPromedio ?? 0)
        },
        topPromociones: rawData.topPromociones
      };
    }

    if (rawData?.resumen && Array.isArray(rawData?.detalles)) {
      return {
        periodo: this.resolvePeriodo(rawData?.periodo, filters),
        resumen: {
          totalPromociones: rawData.detalles.length,
          totalUsosAplicados: Number(rawData.resumen.totalUsos ?? 0),
          ingresoTotalPromo: Number(rawData.resumen.totalIngresos ?? 0),
          ingresoPromedio: Number(rawData.resumen.ingresoPromedioPorUso ?? 0)
        },
        topPromociones: rawData.detalles.map((item: any) => ({
          idPromocion: item.idPromocion,
          idEvento: item.idEvento,
          usosAplicados: Number(item.usosAplicados ?? 0),
          ingresoTotal: Number(item.ingresoBajoPromocion ?? 0),
          fecha: item.fecha
        }))
      };
    }

    return null;
  }

  /**
   * Helper: obtiene mensaje de error legible
   */
  private getErrorMessage(error: any): string | null {
    if (error?.status === 404 || error?.status === 204) {
      return null;
    }

    if (error?.error?.message) return error.error.message;
    if (error?.message) return error.message;
    if (error?.statusText) return error.statusText;
    return 'Error desconocido al cargar los datos';
  }

  /**
   * Helper: dispara descarga de archivo
   */
  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
