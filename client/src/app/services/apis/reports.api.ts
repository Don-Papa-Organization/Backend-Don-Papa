import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiResponse } from "../../types/api-response.type";
import { Bitacora } from "../../domain/reports/models/bitacora.model";
import { ReporteVentas } from "../../domain/reports/models/ventas.model";
import { BitacoraIncidentRequestDto } from "../../domain/reports/dtos/request/bitacora-incident.request.dto";
import { BitacoraCommentRequestDto } from "../../domain/reports/dtos/request/bitacora-comment.request.dto";
import { BitacoraSearchRequestDto } from "../../domain/reports/dtos/request/bitacora-search.request.dto";
import { SalesHistoryRequestDto } from "../../domain/reports/dtos/request/sales-history.request.dto";
import { SalesReportByDatesRequestDto } from "../../domain/reports/dtos/request/sales-report-by-dates.request.dto";
import { SalesHistoryDataDto } from "../../domain/reports/dtos/response/sales-history.response.dto";
import { SaleDetailDataDto } from "../../domain/reports/dtos/response/sale-detail.response.dto";
import { BitacoraByEmployeeDataDto } from "../../domain/reports/dtos/response/bitacora-by-employee.response.dto";
import { BitacoraSearchDataDto } from "../../domain/reports/dtos/response/bitacora-search.response.dto";
import { API_ENDPOINTS, buildApiUrl } from "../../config/api.config";

@Injectable({ providedIn: "root" })
export class ReportsApi {
	private readonly incidentsUrl = buildApiUrl(API_ENDPOINTS.reports.bitacoraIncidents());
	private readonly commentsUrl = buildApiUrl(API_ENDPOINTS.reports.bitacoraComments());
	private readonly salesHistoryUrl = buildApiUrl(API_ENDPOINTS.reports.salesHistory());
	private readonly salesByDatesUrl = buildApiUrl(API_ENDPOINTS.reports.salesByDates());
	private readonly bitacoraSearchUrl = buildApiUrl(API_ENDPOINTS.reports.bitacoraSearch());

	constructor(private http: HttpClient) {}

	registerIncident(dto: BitacoraIncidentRequestDto): Observable<ApiResponse<Bitacora>> {
		return this.http.post<ApiResponse<Bitacora>>(this.incidentsUrl, dto);
	}

	registerComment(dto: BitacoraCommentRequestDto): Observable<ApiResponse<Bitacora>> {
		return this.http.post<ApiResponse<Bitacora>>(this.commentsUrl, dto);
	}

	getBitacoraByEmployee(idEmpleado: number): Observable<ApiResponse<BitacoraByEmployeeDataDto>> {
		return this.http.get<ApiResponse<BitacoraByEmployeeDataDto>>(
			buildApiUrl(API_ENDPOINTS.reports.bitacoraByEmployee(idEmpleado))
		);
	}

	searchBitacora(dto?: BitacoraSearchRequestDto): Observable<ApiResponse<BitacoraSearchDataDto>> {
		return this.http.get<ApiResponse<BitacoraSearchDataDto>>(this.bitacoraSearchUrl, {
			params: dto as any
		});
	}

	getSalesHistory(dto?: SalesHistoryRequestDto): Observable<ApiResponse<SalesHistoryDataDto>> {
		return this.http.get<ApiResponse<SalesHistoryDataDto>>(this.salesHistoryUrl, {
			params: dto as any
		});
	}

	getSaleDetail(idPedido: number): Observable<ApiResponse<SaleDetailDataDto>> {
		return this.http.get<ApiResponse<SaleDetailDataDto>>(buildApiUrl(API_ENDPOINTS.reports.salesDetail(idPedido)));
	}

	getSalesReportByDates(dto: SalesReportByDatesRequestDto): Observable<ApiResponse<ReporteVentas>> {
		return this.http.get<ApiResponse<ReporteVentas>>(this.salesByDatesUrl, {
			params: dto as any
		});
	}

	downloadSalesReportPdf(dto: SalesReportByDatesRequestDto): Observable<Blob> {
		return this.http.get(this.salesByDatesUrl, {
			params: {
				...dto,
				formato: 'pdf'
			},
			responseType: 'blob'
		});
	}
}
