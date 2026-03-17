import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiResponse } from "../../types/api-response.type";
import { Mesa } from "../../domain/tables&Reserves/models/mesa.model";
import { Reserva } from "../../domain/tables&Reserves/models/reserva.model";
import { CheckAvailabilityRequestDto } from "../../domain/tables&Reserves/dtos/request/check-availability.request.dto";
import { ReserveTableRequestDto } from "../../domain/tables&Reserves/dtos/request/reserve-table.request.dto";
import { DailyReservationsRequestDto } from "../../domain/tables&Reserves/dtos/request/daily-reservations.request.dto";
import { UpdateMesaRequestDto } from "../../domain/tables&Reserves/dtos/request/update-mesa.request.dto";
import { CreateMesaRequestDto } from "../../domain/tables&Reserves/dtos/request/create-mesa.request.dto";
import { UpdateMesaEstadoRequestDto } from "../../domain/tables&Reserves/dtos/request/update-mesa-estado.request.dto";
import { AvailabilityDataDto } from "../../domain/tables&Reserves/dtos/response/check-availability.response.dto";
import { ReservationHistoryDataDto } from "../../domain/tables&Reserves/dtos/response/reservation-history.response.dto";
import { DailyReservationsDataDto } from "../../domain/tables&Reserves/dtos/response/daily-reservations.response.dto";
import { ReservationStatusDataDto } from "../../domain/tables&Reserves/dtos/response/reservation-status.response.dto";
import { ListReservationsByStatusDataDto } from "../../domain/tables&Reserves/dtos/response/list-reservations-by-status.response.dto";
import { ListMesasDataDto } from "../../domain/tables&Reserves/dtos/response/list-mesas.response.dto";
import { ListMesasByEstadoDataDto } from "../../domain/tables&Reserves/dtos/response/list-mesas-by-estado.response.dto";
import { ListMesaTiposDataDto } from "../../domain/tables&Reserves/dtos/response/list-mesa-tipos.response.dto";
import { API_ENDPOINTS, buildApiUrl } from "../../config/api.config";

@Injectable({ providedIn: "root" })
export class TablesReservesApi {
	private readonly tablesUrl = buildApiUrl(API_ENDPOINTS.tables.base());

	constructor(private http: HttpClient) {}

	checkAvailability(dto: CheckAvailabilityRequestDto): Observable<ApiResponse<AvailabilityDataDto>> {
		return this.http.get<ApiResponse<AvailabilityDataDto>>(buildApiUrl(API_ENDPOINTS.reservations.availability()), {
			params: dto as any
		});
	}

	reserveTable(dto: ReserveTableRequestDto): Observable<ApiResponse<Reserva>> {
		return this.http.post<ApiResponse<Reserva>>(buildApiUrl(API_ENDPOINTS.reservations.reserve()), dto);
	}

	getReservationHistory(): Observable<ApiResponse<ReservationHistoryDataDto>> {
		return this.http.get<ApiResponse<ReservationHistoryDataDto>>(buildApiUrl(API_ENDPOINTS.reservations.history()));
	}

	cancelReservation(idReserva: number): Observable<ApiResponse<Reserva>> {
		return this.http.delete<ApiResponse<Reserva>>(buildApiUrl(API_ENDPOINTS.reservations.cancel(idReserva)));
	}

	getDailyReservations(dto?: DailyReservationsRequestDto): Observable<ApiResponse<DailyReservationsDataDto>> {
		return this.http.get<ApiResponse<DailyReservationsDataDto>>(buildApiUrl(API_ENDPOINTS.reservations.daily()), {
			params: dto as any
		});
	}

	getReservationStatus(idReserva: number): Observable<ApiResponse<ReservationStatusDataDto>> {
		return this.http.get<ApiResponse<ReservationStatusDataDto>>(
			buildApiUrl(API_ENDPOINTS.reservations.status(idReserva))
		);
	}

	confirmReservation(idReserva: number): Observable<ApiResponse<Reserva>> {
		return this.http.put<ApiResponse<Reserva>>(buildApiUrl(API_ENDPOINTS.reservations.confirm(idReserva)), {});
	}

	cancelReservationByStaff(idReserva: number): Observable<ApiResponse<Reserva>> {
		return this.http.delete<ApiResponse<Reserva>>(buildApiUrl(API_ENDPOINTS.reservations.cancelStaff(idReserva)));
	}

	listReservationsByStatus(estado?: string): Observable<ApiResponse<ListReservationsByStatusDataDto>> {
		return this.http.get<ApiResponse<ListReservationsByStatusDataDto>>(
			buildApiUrl(API_ENDPOINTS.reservations.staffStatus()),
			{
			params: estado ? ({ estado } as any) : undefined
			}
		);
	}

	listTables(): Observable<ApiResponse<ListMesasDataDto>> {
		return this.http.get<ApiResponse<ListMesasDataDto>>(this.tablesUrl);
	}

	listTableTypes(): Observable<ApiResponse<ListMesaTiposDataDto>> {
		return this.http.get<ApiResponse<ListMesaTiposDataDto>>(buildApiUrl(API_ENDPOINTS.tables.types()));
	}

	getTable(idMesa: number): Observable<ApiResponse<Mesa>> {
		return this.http.get<ApiResponse<Mesa>>(buildApiUrl(API_ENDPOINTS.tables.detail(idMesa)));
	}

	createTable(dto: CreateMesaRequestDto): Observable<ApiResponse<Mesa>> {
		return this.http.post<ApiResponse<Mesa>>(this.tablesUrl, dto);
	}

	updateTable(idMesa: number, dto: UpdateMesaRequestDto): Observable<ApiResponse<Mesa>> {
		return this.http.put<ApiResponse<Mesa>>(buildApiUrl(API_ENDPOINTS.tables.detail(idMesa)), dto);
	}

	updateTableStatus(idMesa: number, dto: UpdateMesaEstadoRequestDto): Observable<ApiResponse<Mesa>> {
		return this.http.patch<ApiResponse<Mesa>>(buildApiUrl(API_ENDPOINTS.tables.statusUpdate(idMesa)), dto);
	}

	deleteTable(idMesa: number): Observable<ApiResponse<null>> {
		return this.http.delete<ApiResponse<null>>(buildApiUrl(API_ENDPOINTS.tables.detail(idMesa)));
	}

	listTablesByStatus(estado: string): Observable<ApiResponse<ListMesasByEstadoDataDto>> {
		return this.http.get<ApiResponse<ListMesasByEstadoDataDto>>(buildApiUrl(API_ENDPOINTS.tables.byStatus(estado)));
	}
}
