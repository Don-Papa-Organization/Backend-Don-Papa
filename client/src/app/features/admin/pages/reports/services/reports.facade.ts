import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { ReportsApi } from "../../../../../services/apis/reports.api";
import { BitacoraByEmployeeDataDto } from "../../../../../domain/reports/dtos/response/bitacora-by-employee.response.dto";
import { BitacoraSearchDataDto } from "../../../../../domain/reports/dtos/response/bitacora-search.response.dto";
import { SalesHistoryDataDto } from "../../../../../domain/reports/dtos/response/sales-history.response.dto";
import { SaleDetailDataDto } from "../../../../../domain/reports/dtos/response/sale-detail.response.dto";
import { SalesReportByDatesRequestDto } from "../../../../../domain/reports/dtos/request/sales-report-by-dates.request.dto";
import { ReporteVentas } from "../../../../../domain/reports/models/ventas.model";

@Injectable({
	providedIn: "root"
})
export class ReportsFacade {
	constructor(private reportsApi: ReportsApi) {}

	/**
	 * Obtiene la bitácora de incidencias de un empleado específico
	 * @param idEmpleado ID del empleado
	 */
	getBitacoraByEmployee(idEmpleado: number): Observable<BitacoraByEmployeeDataDto | null> {
		return this.reportsApi.getBitacoraByEmployee(idEmpleado).pipe(
			map(response => {
				console.log('Bitácora por empleado:', response.data);
				return response.data;
			}),
			catchError((error) => {
				console.error("Error al cargar bitácora por empleado:", error);
				return of(null);
			})
		);
	}

	/**
	 * Busca en la bitácora de incidencias con filtros
	 */
	searchBitacora(dto?: any): Observable<BitacoraSearchDataDto | null> {
		return this.reportsApi.searchBitacora(dto).pipe(
			map(response => {
				console.log('Bitácora buscada:', response.data);
				return response.data;
			}),
			catchError((error) => {
				console.error("Error al buscar bitácora:", error);
				return of(null);
			})
		);
	}

	/**
	 * Obtiene el historial de ventas
	 */
	getSalesHistory(dto?: any): Observable<SalesHistoryDataDto | null> {
		return this.reportsApi.getSalesHistory(dto).pipe(
			map(response => {
				console.log('Historial de ventas:', response.data);
				return response.data;
			}),
			catchError((error) => {
				console.error("Error al cargar historial de ventas:", error);
				return of(null);
			})
		);
	}

	/**
	 * Obtiene el detalle de una venta específica
	 * @param idVenta ID de la venta
	 */
	getSaleDetail(idVenta: number): Observable<SaleDetailDataDto | null> {
		return this.reportsApi.getSaleDetail(idVenta).pipe(
			map(response => {
				console.log('Detalle de venta:', response.data);
				return response.data;
			}),
			catchError((error) => {
				console.error("Error al cargar detalle de venta:", error);
				return of(null);
			})
		);
	}

	/**
	 * Obtiene reporte de ventas por rango de fechas
	 */
	getSalesReportByDates(dto: any): Observable<ReporteVentas | null> {
		return this.reportsApi.getSalesReportByDates(dto).pipe(
			map(response => {
				console.log('Reporte de ventas por fechas:', response.data);
				return response.data;
			}),
			catchError((error) => {
				console.error("Error al cargar reporte de ventas por fechas:", error);
				return of(null);
			})
		);
	}

	downloadSalesReportPdf(dto: SalesReportByDatesRequestDto): Observable<void> {
		return this.reportsApi.downloadSalesReportPdf(dto).pipe(
			map((blob) => {
				this.triggerDownload(blob, `reporte-ventas-${dto.fechaInicio}-${dto.fechaFin}.pdf`);
			}),
			catchError((error) => {
				console.error("Error al descargar reporte de ventas en PDF:", error);
				return of(void 0);
			})
		);
	}

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
