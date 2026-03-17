import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
	styleUrl: './main-statistics.scss'
})
export class MainStatistics implements OnInit, OnDestroy {
	dashboardState$: Observable<DashboardStateDto>;
	isLoading = false;

	filters: AnalyticsFilterDto = {
		startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
		endDate: new Date().toISOString().split('T')[0],
		limit: 10
	};

	private destroy$ = new Subject<void>();
	private autoRefreshIntervalId: ReturnType<typeof setInterval> | null = null;

	constructor(private statisticsFacade: StatisticsFacade) {
		this.dashboardState$ = this.statisticsFacade.getDashboardState();
	}

	ngOnInit(): void {
		this.loadDashboard();
		this.startAutoRefresh();

		this.dashboardState$
			.pipe(takeUntil(this.destroy$))
			.subscribe(state => {
				this.isLoading = Object.values(state.loadingState).some(val => val === true);
			});
	}

	loadDashboard(): void {
		this.statisticsFacade
			.loadDashboard(this.filters)
			.pipe(takeUntil(this.destroy$))
			.subscribe();
	}

	onFilterChange(): void {
		this.statisticsFacade
			.loadDashboard(this.filters)
			.pipe(takeUntil(this.destroy$))
			.subscribe();
	}

	onDownloadPDF(): void {
		this.statisticsFacade
			.downloadPDF(this.filters)
			.pipe(takeUntil(this.destroy$))
			.subscribe();
	}

	onDownloadJSON(): void {
		this.statisticsFacade
			.downloadJSON(this.filters)
			.pipe(takeUntil(this.destroy$))
			.subscribe();
	}

	onExportPDF(): void {
		this.statisticsFacade
			.downloadPDF(this.filters)
			.pipe(takeUntil(this.destroy$))
			.subscribe();
	}

	buildSalesMetrics(state: DashboardStateDto): StatisticMetricItem[] {
		if (!state.salesSummary) {
			return [
				{ label: 'Total de Ventas', value: this.toCurrency(0) },
				{ label: 'Cantidad de Pedidos', value: 0 },
				{ label: 'Ticket Promedio', value: this.toCurrency(0) }
			];
		}

		const totalVentas = state.salesSummary.resumen.totalVentas;
		const cantidadPedidos = state.salesSummary.resumen.cantidadPedidos;
		const ticketPromedio = cantidadPedidos > 0 ? totalVentas / cantidadPedidos : 0;

		return [
			{ label: 'Total de Ventas', value: this.toCurrency(totalVentas) },
			{ label: 'Cantidad de Pedidos', value: cantidadPedidos },
			{ label: 'Ticket Promedio', value: this.toCurrency(ticketPromedio) }
		];
	}

	buildUserGrowthMetrics(state: DashboardStateDto): StatisticMetricItem[] {
		if (!state.userGrowth) {
			return [
				{ label: 'Usuarios Nuevos', value: 0 },
				{ label: 'Clientes frecuentes (promedio)', value: 0 },
				{ label: 'Días analizados', value: 0 }
			];
		}

		return [
			{ label: 'Usuarios Nuevos', value: state.userGrowth.resumen.totalNuevosRegistros },
			{ label: 'Clientes frecuentes (promedio)', value: state.userGrowth.resumen.clientesFrecuentesPromedio },
			{ label: 'Días analizados', value: state.userGrowth.detalles.length }
		];
	}

	buildTopProductsRows(products: TopProductDto[] | null): Array<Record<string, string | number>> {
		if (!products?.length) return [];

		return products.map(p => ({
			'ID Producto': p.idProducto,
			'Unidades Vendidas': p.cantidadVendida,
			'Ingresos': this.toCurrency(p.ingresosGenerados)
		}));
	}

	buildSalesTimelineRows(timeline: SalesTimelineItemDto[] | null): Array<Record<string, string | number>> {
		if (!timeline?.length) return [];

		return timeline.map(item => ({
			'Fecha': new Date(item.fecha).toLocaleDateString('es-CR'),
			'Ventas': this.toCurrency(item.totalVentas),
			'Pedidos': item.cantidadPedidos
		}));
	}

	buildDeadStockRows(deadStock: DeadStockDto[] | null): Array<Record<string, string | number>> {
		if (!deadStock?.length) return [];

		return deadStock.map(item => ({
			'ID Producto': item.idProducto,
			'Nombre': item.nombreProducto || '-',
			'Días sin ventas': item.diasSinVentas
		}));
	}

	buildOccupancyRows(occupancy: OccupancyResponseDto | null): Array<Record<string, string | number>> {
		if (!occupancy?.picos?.length) return [];

		return occupancy.picos.map(hour => ({
			'Hora': hour.hora,
			'Reservas': hour.cantidadReservas
		}));
	}

	buildPromotionsRows(promotions: PromotionEffectivenessResponseDto | null): Array<Record<string, string | number>> {
		if (!promotions?.detalles?.length) return [];

		return promotions.detalles.map(promo => ({
			'ID Promoción': promo.idPromocion,
			'Uso': promo.usosAplicados,
			'Ingresos Generados': this.toCurrency(promo.ingresoBajoPromocion)
		}));
	}

	buildFrequentUsersRows(frequentUsers: FrequentUserDto[] | null): Array<Record<string, string | number>> | any{
		if (!frequentUsers?.length) return [];

		return frequentUsers.map(user => {
			const hasUserId = Number(user.idUsuario) > 0;

			if (!hasUserId && user.fecha) {
				return {
					'Fecha': new Date(user.fecha).toLocaleDateString('es-CR'),
					'Clientes Frecuentes': user.cantidadCompras,
					'Nuevos Registros': user.montoTotal
				};
			}

			return {
				'ID Usuario': user.idUsuario,
				'Compras': user.cantidadCompras,
				'Monto Total': this.toCurrency(user.montoTotal)
			};
		});
	}

	buildOccupancyMetrics(occupancy: OccupancyResponseDto | null): StatisticMetricItem[] {
		if (!occupancy) return [];

		const tasaNoShow = Number(occupancy.tasaNoShowPromedio);
		const tasaNoShowSafe = Number.isFinite(tasaNoShow) ? tasaNoShow : 0;

		const horaPico = occupancy.picos?.length
			? occupancy.picos.reduce((max, current) => current.cantidadReservas > max.cantidadReservas ? current : max)
			: null;

		return [
			{
				label: 'Tasa No-Show Promedio',
				value: `${tasaNoShowSafe.toFixed(2)}%`
			},
			{
				label: 'Hora Pico',
				value: horaPico ? `${horaPico.hora}:00` : '-'
			},
			{
				label: 'Reservas en Hora Pico',
				value: horaPico ? horaPico.cantidadReservas : '-'
			}
		];
	}

	private toCurrency(value: number): string {
		return new Intl.NumberFormat('es-CR', {
			style: 'currency',
			currency: 'CRC',
			maximumFractionDigits: 2
		}).format(value);
	}

	ngOnDestroy(): void {
		if (this.autoRefreshIntervalId) {
			clearInterval(this.autoRefreshIntervalId);
			this.autoRefreshIntervalId = null;
		}
		this.destroy$.next();
		this.destroy$.complete();
	}

	private startAutoRefresh(): void {
		const refreshMs = 20000;

		if (this.autoRefreshIntervalId) {
			clearInterval(this.autoRefreshIntervalId);
		}

		this.autoRefreshIntervalId = setInterval(() => {
			this.loadDashboard();
		}, refreshMs);
	}
}
