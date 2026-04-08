import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Observable, Subject, interval } from 'rxjs';
import { takeUntil, filter, tap } from 'rxjs/operators';

import { StatisticsFacade } from '../services/statistics.facade';
import {
	AnalyticsFilterDto,
	DashboardStateDto,
	SalesTimelineItemDto,
	TopProductDto,
	DeadStockDto,
	FrequentUserDto,
	OccupancyResponseDto,
	PromotionEffectivenessResponseDto
} from '../../../../../domain/statistics/dtos/analytics.dto';
import { StatisticMetricItem } from '../components/statistics-metrics-grid/statistics-metrics-grid';

@Component({
	selector: 'app-main-statistics',
	standalone: false,
	templateUrl: './main-statistics.html',
	styleUrl: './main-statistics.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainStatistics implements OnInit, OnDestroy {
	isLoading = false;
	showDownloadMenu = false;
	@ViewChild('downloadMenuContainer') downloadMenuContainer?: ElementRef<HTMLElement>;

	filters: AnalyticsFilterDto = {
		startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
		endDate: new Date().toISOString().split('T')[0],
		limit: 10
	};

	activeTab: string = 'ventas';
	tabs = [
		{ id: 'ventas', label: 'Ventas' },
		{ id: 'inventario', label: 'Inventario' },
		{ id: 'usuarios', label: 'Usuarios' },
		{ id: 'ocupacion', label: 'Ocupación' }
	];

	// ViewModels pre-calculados para Ventas
	salesMetrics: StatisticMetricItem[] = [
		{ label: 'Total de Ventas', value: '$0' },
		{ label: 'Cantidad de Pedidos', value: 0 },
		{ label: 'Ticket Promedio', value: '$0' }
	];
	timelineRows: Array<Record<string, string | number>> = [];
	weeklySalesLabels: string[] = [];
	weeklySalesData: number[] = [];
	salesLoading = false;
	salesError: string | null = null;
	
	// Nuevos ViewModels para gráficos de Ventas
	weeklyComparisonLabels: string[] = [];
	weeklyCurrentData: number[] = [];
	weeklyPreviousData: number[] = [];
	ventasFisico: number = 0;
	ventasWeb: number = 0;

	// ViewModels para Inventario
	topProductsRows: Array<Record<string, string | number>> = [];
	deadStockRows: Array<Record<string, string | number>> = [];
	inventoryLoading = false;
	inventoryError: string | null = null;
	
	// Nuevos ViewModels para gráficos de Inventario
	top5Labels: string[] = [];
	top5Data: number[] = [];
	top3ProductsWithComparison: Array<{id: number, name: string, sales: number, totalSales: number}> = [];
	totalSales: number = 0;

	// ViewModels para Usuarios
	userMetrics: StatisticMetricItem[] = [
		{ label: 'Usuarios Nuevos', value: 0 },
		{ label: 'Clientes frecuentes (promedio)', value: 0 },
		{ label: 'Días analizados', value: 0 }
	];
	promotionsRows: Array<Record<string, string | number>> = [];
	frequentUsersRows: Array<Record<string, string | number>> = [];
	usersLoading = false;
	usersError: string | null = null;

	// ViewModels para Ocupación
	occupancyMetrics: StatisticMetricItem[] = [];
	occupancyRows: Array<Record<string, string | number>> = [];
	occupancyChartLabels: string[] = [];
	occupancyChartData: number[] = [];
	peakHour = '-';
	totalReservations = 0;
	noShowRate = '0%';
	occupancyLoading = false;
	occupancyError: string | null = null;

	// Filtros rápidos - valores pre-calculados
	quickFilter7Days = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];
	quickFilter30Days = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
	quickFilter90Days = new Date(new Date().setDate(new Date().getDate() - 90)).toISOString().split('T')[0];

	private destroy$ = new Subject<void>();

	constructor(
		private statisticsFacade: StatisticsFacade,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.loadDashboard();

		this.statisticsFacade.getDashboardState()
			.pipe(takeUntil(this.destroy$))
			.subscribe(state => {
				this.updateViewModels(state);
				this.cdr.markForCheck();
			});
	}

	private updateViewModels(state: DashboardStateDto): void {
		// Loading states
		this.isLoading = Object.values(state.loadingState).some(val => val === true);
		this.salesLoading = state.loadingState['salesSummary'] || state.loadingState['salesTimeline'] || false;
		this.inventoryLoading = state.loadingState['topProducts'] || state.loadingState['deadStock'] || false;
		this.usersLoading = state.loadingState['userGrowth'] || state.loadingState['promotions'] || state.loadingState['frequentUsers'] || false;
		this.occupancyLoading = state.loadingState['occupancy'] || false;

		// Error states
		this.salesError = state.errorState['salesSummary'] || state.errorState['salesTimeline'] || null;
		this.inventoryError = state.errorState['topProducts'] || state.errorState['deadStock'] || null;
		this.usersError = state.errorState['userGrowth'] || state.errorState['promotions'] || state.errorState['frequentUsers'] || null;
		this.occupancyError = state.errorState['occupancy'] || null;

		// Sales metrics
		if (state.salesSummary) {
			const totalVentas = state.salesSummary.resumen.totalVentas;
			const cantidadPedidos = state.salesSummary.resumen.cantidadPedidos;
			const ticketPromedio = cantidadPedidos > 0 ? totalVentas / cantidadPedidos : 0;
			this.salesMetrics = [
				{ label: 'Total de Ventas', value: this.toCurrency(totalVentas) },
				{ label: 'Cantidad de Pedidos', value: cantidadPedidos },
				{ label: 'Ticket Promedio', value: this.toCurrency(ticketPromedio) }
			];
		}

		// Timeline rows
		this.timelineRows = this.buildTimelineRows(state.salesTimeline);

		// Weekly sales chart
		const weeklySeries = this.buildWeeklySalesChartSeries(state.salesTimeline);
		this.weeklySalesLabels = weeklySeries.labels;
		this.weeklySalesData = weeklySeries.data;
		
		// Nuevos viewModels para gráficos comparativos de ventas
		this.buildWeeklyComparisonViewModel(state.salesTimeline);
		this.buildSalesChannelViewModel(state.salesSummary);

		// Top products
		this.topProductsRows = this.buildTopProductsRows(state.topProducts);
		
		// Nuevos viewModels para gráficos de inventario
		this.buildTop5PieViewModel(state.topProducts);
		this.buildProductComparisonViewModel(state.topProducts, state.salesSummary?.resumen?.totalVentas ?? 0);

		// Dead stock
		this.deadStockRows = this.buildDeadStockRows(state.deadStock);

		// User metrics
		if (state.userGrowth) {
			this.userMetrics = [
				{ label: 'Usuarios Nuevos', value: state.userGrowth.resumen.totalNuevosRegistros },
				{ label: 'Clientes frecuentes (promedio)', value: state.userGrowth.resumen.clientesFrecuentesPromedio },
				{ label: 'Días analizados', value: state.userGrowth.detalles.length }
			];
		}

		// Promotions
		this.promotionsRows = this.buildPromotionsRows(state.promotions);

		// Frequent users
		this.frequentUsersRows = this.buildFrequentUsersRows(state.frequentUsers);

		// Occupancy
		this.updateOccupancyViewModels(state.occupancy);
	}

	private updateOccupancyViewModels(occupancy: OccupancyResponseDto | null): void {
		if (!occupancy?.detalles?.length) {
			this.occupancyRows = [];
			this.occupancyChartLabels = [];
			this.occupancyChartData = [];
			this.peakHour = '-';
			this.totalReservations = 0;
			this.noShowRate = '0%';
			this.occupancyMetrics = [];
			return;
		}

		// Calculate totals by hour
		const hourMap = new Map<number, number>();
		occupancy.detalles.forEach(d => {
			const hora = d.horaPico || 0;
			if (hora > 0) {
				hourMap.set(hora, (hourMap.get(hora) || 0) + d.cantidadReservas);
			}
		});

		// Peak hour
		let maxHour = 0;
		let maxReservations = 0;
		hourMap.forEach((count, hour) => {
			if (count > maxReservations) {
				maxReservations = count;
				maxHour = hour;
			}
		});
		this.peakHour = maxHour > 0 ? `${maxHour}:00` : '-';
		this.totalReservations = occupancy.detalles.reduce((sum, d) => sum + d.cantidadReservas, 0);

		// No-show rate
		const tasaNoShow = Number(occupancy.tasaNoShowPromedio);
		const tasaNoShowSafe = Number.isFinite(tasaNoShow) ? tasaNoShow : 0;
		this.noShowRate = `${tasaNoShowSafe.toFixed(1)}%`;

		// Occupancy metrics
		this.occupancyMetrics = [
			{ label: 'Tasa No-Show Promedio', value: this.noShowRate },
			{ label: 'Hora Pico', value: this.peakHour },
			{ label: 'Reservas en Hora Pico', value: maxReservations > 0 ? maxReservations : '-' }
		];

		// Chart data
		const sortedHours = [...hourMap.keys()].sort((a, b) => a - b);
		this.occupancyChartLabels = sortedHours.map(h => `${h}:00`);
		this.occupancyChartData = sortedHours.map(h => hourMap.get(h) || 0);

		// Table rows
		this.occupancyRows = occupancy.detalles.map(detail => ({
			'Hora': detail.horaPico ? `${detail.horaPico}:00` : '-',
			'Reservas': detail.cantidadReservas
		}));
	}

	private buildTimelineRows(timeline: SalesTimelineItemDto[] | null): Array<Record<string, string | number>> {
		if (!timeline?.length) return [];
		// Limitar a últimos 10 registros
		return timeline.slice(-10).map(item => ({
			'Fecha': new Date(item.fecha).toLocaleDateString('es-CO'),
			'Ventas': this.toCurrency(item.totalVentas),
			'Pedidos': item.cantidadPedidos
		}));
	}

	private buildWeeklySalesChartSeries(timeline: SalesTimelineItemDto[] | null): { labels: string[]; data: number[] } {
		if (!timeline?.length) {
			return { labels: [], data: [] };
		}
		const ventasSemanales = timeline.slice(-8);
		return {
			labels: ventasSemanales.map(item => {
				const fecha = new Date(item.fecha);
				return `${fecha.getDate()}/${fecha.getMonth() + 1}`;
			}),
			data: ventasSemanales.map(item => Number(item.totalVentas ?? 0))
		};
	}
	
	// Nuevos métodos para viewModels de gráficos
	
	private buildWeeklyComparisonViewModel(timeline: SalesTimelineItemDto[] | null): void {
		if (!timeline?.length) {
			this.weeklyComparisonLabels = [];
			this.weeklyCurrentData = [];
			this.weeklyPreviousData = [];
			return;
		}
		const ventasSemanales = timeline.slice(-8);
		
		this.weeklyComparisonLabels = ventasSemanales.map(item => {
			const fecha = new Date(item.fecha);
			return `Sem ${fecha.getDate()}/${fecha.getMonth() + 1}`;
		});
		
		this.weeklyCurrentData = ventasSemanales.map(item => Number(item.totalVentas ?? 0));
		this.weeklyPreviousData = [];
	}
	
	private buildSalesChannelViewModel(salesSummary: any): void {
		if (!salesSummary?.resumen) {
			this.ventasFisico = 0;
			this.ventasWeb = 0;
			return;
		}
		
		this.ventasFisico = Number(salesSummary.resumen.ventasFisico ?? 0);
		this.ventasWeb = Number(salesSummary.resumen.ventasWeb ?? 0);
	}
	
	private buildTop5PieViewModel(topProducts: TopProductDto[] | null): void {
		if (!topProducts?.length) {
			this.top5Labels = [];
			this.top5Data = [];
			return;
		}
		
		// Eliminar duplicados por ID de producto
		const uniqueProducts = this.removeDuplicateProducts(topProducts);
		const top5 = uniqueProducts.slice(0, 5);
		this.top5Labels = top5.map(p => this.resolveProductName(p));
		this.top5Data = top5.map(p => Number(p.cantidadVendida ?? 0));
	}
	
	private buildProductComparisonViewModel(
		topProducts: TopProductDto[] | null,
		totalSalesValue: number
	): void {
		this.totalSales = totalSalesValue;
		
		if (!topProducts?.length) {
			this.top3ProductsWithComparison = [];
			return;
		}
		
		// Eliminar duplicados por ID de producto
		const uniqueProducts = this.removeDuplicateProducts(topProducts);
		this.top3ProductsWithComparison = uniqueProducts.slice(0, 3).map(p => ({
			id: p.idProducto,
			name: this.resolveProductName(p),
			sales: Number(p.ingresosGenerados ?? 0),
			totalSales: totalSalesValue
		}));
	}
	
	private removeDuplicateProducts(products: TopProductDto[]): TopProductDto[] {
		const seen = new Set<number>();
		return products.filter(p => {
			if (seen.has(p.idProducto)) {
				return false;
			}
			seen.add(p.idProducto);
			return true;
		});
	}

	private buildTopProductsRows(products: TopProductDto[] | null): Array<Record<string, string | number>> {
		if (!products?.length) return [];
		// Top 10 productos
		return products.slice(0, 10).map(p => ({
			'ID Producto': p.idProducto,
			'Nombre Producto': this.resolveProductName(p),
			'Unidades Vendidas': p.cantidadVendida,
			'Ingresos': this.toCurrency(p.ingresosGenerados)
		}));
	}

	private resolveProductName(product: TopProductDto): string {
		const normalized = (product.nombreProducto || '').trim();
		if (normalized) {
			return normalized;
		}
		return 'N/A';
	}

	private buildDeadStockRows(deadStock: DeadStockDto[] | null): Array<Record<string, string | number>> {
		if (!deadStock?.length) return [];
		// Limitar a 15 productos con stock muerto
		return deadStock.slice(0, 15).map(item => ({
			'ID Producto': item.idProducto,
			'Nombre': item.nombreProducto || '-',
			'Días sin ventas': item.diasSinVentas
		}));
	}

	private buildPromotionsRows(promotions: PromotionEffectivenessResponseDto | null): Array<Record<string, string | number>> {
		if (!promotions?.detalles?.length) return [];
		// Limitar a top 10
		return promotions.detalles.slice(0, 10).map((promo: { idPromocion: number; usosAplicados: number }) => ({
			'ID Promoción': promo.idPromocion,
			'Nombre Promoción': (promo as any).nombrePromocion || 'Promoción sin nombre',
			'Uso': promo.usosAplicados
		}));
	}

	private buildFrequentUsersRows(frequentUsers: FrequentUserDto[] | null): Array<Record<string, string | number>> {
		if (!frequentUsers?.length) return [];
		// Limitar a últimos 10 registros
		const serie = frequentUsers.slice(-10);
		return serie.map((item: FrequentUserDto) => ({
			'Fecha': item.fecha ? new Date(item.fecha).toLocaleDateString('es-CO') : '-',
			'Clientes Frecuentes': item.cantidadCompras,
			'Monto Total': this.toCurrency(item.montoTotal)
		}));
	}

	private toCurrency(value: number): string {
		return new Intl.NumberFormat('es-CO', {
			style: 'currency',
			currency: 'COP',
			maximumFractionDigits: 0
		}).format(value);
	}

	isActiveFilter(startDate: string): boolean {
		return this.filters.startDate === startDate;
	}

	setActiveTab(tabId: string): void {
		this.activeTab = tabId;
	}

	setQuickFilter(days: number): void {
		this.filters = {
			...this.filters,
			startDate: new Date(new Date().setDate(new Date().getDate() - days)).toISOString().split('T')[0],
			endDate: new Date().toISOString().split('T')[0]
		};
		this.loadDashboard();
	}

	loadDashboard(): void {
		this.statisticsFacade.loadDashboard(this.filters)
			.pipe(takeUntil(this.destroy$))
			.subscribe();
	}

	onFilterChange(): void {
		this.loadDashboard();
	}

	onDownloadRange(days: 7 | 30 | 90): void {
		const endDate = new Date().toISOString().split('T')[0];
		const startDate = new Date(new Date().setDate(new Date().getDate() - days)).toISOString().split('T')[0];
		const filters = { ...this.filters, startDate, endDate };

		this.filters = filters;
		this.showDownloadMenu = false;
		this.statisticsFacade.downloadPDF(filters)
			.pipe(takeUntil(this.destroy$))
			.subscribe();
	}

	toggleDownloadMenu(event?: MouseEvent): void {
		event?.stopPropagation();
		this.showDownloadMenu = !this.showDownloadMenu;
	}

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent): void {
		if (!this.showDownloadMenu) return;
		const target = event.target as Node;
		if (!this.downloadMenuContainer?.nativeElement.contains(target)) {
			this.showDownloadMenu = false;
		}
	}

	onDownloadJSON(): void {
		this.statisticsFacade.downloadJSON(this.filters)
			.pipe(takeUntil(this.destroy$))
			.subscribe();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}