import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiResponse } from "../../types/api-response.type";
import { Promocion } from "../../domain/events&Promotions/models/promocion.model";
import { Evento } from "../../domain/events&Promotions/models/evento.model";
import { EventoDiaSemana } from "../../domain/events&Promotions/models/eventoDiaSemana.model";
import {
	ProductosPromocionResponse,
	ProductosPromocionEnriquecidosResponse,
	ProductoPromocionItem
} from "../../domain/events&Promotions/models/productoPromocion.model";
import {
	PromotionEventDayItem,
	PromotionsByEventDayResponse
} from "../../domain/events&Promotions/models/promotioneventodia.model";
import { CreatePromotionRequestDto } from "../../domain/events&Promotions/dtos/request/create-promotion.request.dto";
import { UpdatePromotionRequestDto } from "../../domain/events&Promotions/dtos/request/update-promotion.request.dto";
import { TogglePromotionActiveRequestDto } from "../../domain/events&Promotions/dtos/request/toggle-promotion-active.request.dto";
import { CreateEventRequestDto } from "../../domain/events&Promotions/dtos/request/create-event.request.dto";
import { UpdateEventRequestDto } from "../../domain/events&Promotions/dtos/request/update-event.request.dto";
import { SearchEventsRequestDto } from "../../domain/events&Promotions/dtos/request/search-events.request.dto";
import { ListEventsRequestDto } from "../../domain/events&Promotions/dtos/request/list-events.request.dto";
import { ListPromotionsRequestDto } from "../../domain/events&Promotions/dtos/request/list-promotions.request.dto";
import { CreateEventDayRequestDto } from "../../domain/events&Promotions/dtos/request/create-event-day.request.dto";
import { UpdateEventDayRequestDto } from "../../domain/events&Promotions/dtos/request/update-event-day.request.dto";
import { CreateProductPromoRequestDto } from "../../domain/events&Promotions/dtos/request/create-product-promo.request.dto";
import { UpdateProductPromoRequestDto } from "../../domain/events&Promotions/dtos/request/update-product-promo.request.dto";
import { CreatePromotionEventDayRequestDto } from "../../domain/events&Promotions/dtos/request/create-promotion-event-day.request.dto";
import { UpdatePromotionEventDayRequestDto } from "../../domain/events&Promotions/dtos/request/update-promotion-event-day.request.dto";
import { CreatePromotionEventDayResponseDto } from "../../domain/events&Promotions/dtos/response/create-promotion-event-day.response.dto";
import { UpdatePromotionEventDayResponseDto } from "../../domain/events&Promotions/dtos/response/update-promotion-event-day.response.dto";
import { UpcomingEventoDto } from "../../domain/events&Promotions/dtos/response/list-upcoming-events.response.dto";
import { EventoDetalleDto } from "../../domain/events&Promotions/dtos/response/get-event-detail.response.dto";
import { PromotionsByProductDataDto } from "../../domain/events&Promotions/dtos/response/get-promotions-by-product.response.dto";
import { API_ENDPOINTS, buildApiUrl } from "../../config/api.config";

@Injectable({ providedIn: "root" })
export class EventsPromotionsApi {
	private readonly eventsUrl = buildApiUrl(API_ENDPOINTS.events.base());
	private readonly promotionsUrl = buildApiUrl(API_ENDPOINTS.promotions.base());
	private readonly eventDaysUrl = buildApiUrl(API_ENDPOINTS.eventDays.base());
	private readonly productPromotionsUrl = buildApiUrl(API_ENDPOINTS.productPromotions.base());
	private readonly promotionEventDaysUrl = buildApiUrl(API_ENDPOINTS.promotionEventDays.base());

	constructor(private http: HttpClient) {}

	listPromotions(dto?: ListPromotionsRequestDto): Observable<ApiResponse<Promocion[]>> {
		return this.http.get<ApiResponse<Promocion[]>>(this.promotionsUrl, {
			params: dto as any
		});
	}

	getPromotion(id: number): Observable<ApiResponse<Promocion>> {
		return this.http.get<ApiResponse<Promocion>>(buildApiUrl(API_ENDPOINTS.promotions.detail(id)));
	}

	listActivePromotions(activas: boolean): Observable<ApiResponse<Promocion[]>> {
		return this.http.get<ApiResponse<Promocion[]>>(buildApiUrl(API_ENDPOINTS.promotions.active(activas)));
	}

	createPromotion(dto: CreatePromotionRequestDto): Observable<ApiResponse<Promocion>> {
		return this.http.post<ApiResponse<Promocion>>(this.promotionsUrl, dto);
	}

	updatePromotion(id: number, dto: UpdatePromotionRequestDto): Observable<ApiResponse<Promocion>> {
		return this.http.put<ApiResponse<Promocion>>(buildApiUrl(API_ENDPOINTS.promotions.detail(id)), dto);
	}

	deletePromotion(id: number): Observable<ApiResponse<null>> {
		return this.http.delete<ApiResponse<null>>(buildApiUrl(API_ENDPOINTS.promotions.detail(id)));
	}

	togglePromotionActive(id: number, dto: TogglePromotionActiveRequestDto): Observable<ApiResponse<Promocion>> {
		return this.http.patch<ApiResponse<Promocion>>(buildApiUrl(API_ENDPOINTS.promotions.toggleActive(id)), dto);
	}

	listEvents(dto?: ListEventsRequestDto): Observable<ApiResponse<Evento[]>> {
		return this.http.get<ApiResponse<Evento[]>>(this.eventsUrl, {
			params: dto as any
		});
	}

	getEvent(id: number): Observable<ApiResponse<Evento>> {
		return this.http.get<ApiResponse<Evento>>(buildApiUrl(API_ENDPOINTS.events.detail(id)));
	}

	searchEvents(dto: SearchEventsRequestDto): Observable<ApiResponse<Evento[]>> {
		return this.http.get<ApiResponse<Evento[]>>(buildApiUrl(API_ENDPOINTS.events.search()), { params: dto as any });
	}

	getEventDetail(id: number): Observable<ApiResponse<EventoDetalleDto>> {
		return this.http.get<ApiResponse<EventoDetalleDto>>(buildApiUrl(API_ENDPOINTS.events.detailFull(id)));
	}

	listUpcomingEvents(): Observable<ApiResponse<UpcomingEventoDto[]>> {
		return this.http.get<ApiResponse<UpcomingEventoDto[]>>(buildApiUrl(API_ENDPOINTS.events.upcoming()));
	}

	createEvent(dto: CreateEventRequestDto): Observable<ApiResponse<Evento>> {
		return this.http.post<ApiResponse<Evento>>(this.eventsUrl, dto);
	}

	updateEvent(id: number, dto: UpdateEventRequestDto): Observable<ApiResponse<Evento>> {
		return this.http.put<ApiResponse<Evento>>(buildApiUrl(API_ENDPOINTS.events.detail(id)), dto);
	}

	deleteEvent(id: number): Observable<ApiResponse<null>> {
		return this.http.delete<ApiResponse<null>>(buildApiUrl(API_ENDPOINTS.events.detail(id)));
	}

	listEventDays(idEvento: number): Observable<ApiResponse<EventoDiaSemana[]>> {
		return this.http.get<ApiResponse<EventoDiaSemana[]>>(buildApiUrl(API_ENDPOINTS.eventDays.byEvent(idEvento)));
	}

	createEventDay(dto: CreateEventDayRequestDto): Observable<ApiResponse<EventoDiaSemana>> {
		return this.http.post<ApiResponse<EventoDiaSemana>>(this.eventDaysUrl, dto);
	}

	updateEventDay(idEventoSemana: number, dto: UpdateEventDayRequestDto): Observable<ApiResponse<EventoDiaSemana>> {
		return this.http.put<ApiResponse<EventoDiaSemana>>(buildApiUrl(API_ENDPOINTS.eventDays.detail(idEventoSemana)), dto);
	}

	deleteEventDay(idEventoSemana: number): Observable<ApiResponse<null>> {
		return this.http.delete<ApiResponse<null>>(buildApiUrl(API_ENDPOINTS.eventDays.detail(idEventoSemana)));
	}

	listProductPromotions(): Observable<ApiResponse<ProductoPromocionItem[]>> {
		return this.http.get<ApiResponse<ProductoPromocionItem[]>>(this.productPromotionsUrl);
	}

	getProductPromotion(id: number): Observable<ApiResponse<ProductoPromocionItem>> {
		return this.http.get<ApiResponse<ProductoPromocionItem>>(buildApiUrl(API_ENDPOINTS.productPromotions.detail(id)));
	}

	getProductsByPromotion(idPromocion: number): Observable<ApiResponse<ProductosPromocionResponse>> {
		return this.http.get<ApiResponse<ProductosPromocionResponse>>(
			buildApiUrl(API_ENDPOINTS.productPromotions.byPromotion(idPromocion))
		);
	}

	getProductsByPromotionEnriched(idPromocion: number): Observable<ApiResponse<ProductosPromocionEnriquecidosResponse>> {
		return this.http.get<ApiResponse<ProductosPromocionEnriquecidosResponse>>(
			buildApiUrl(API_ENDPOINTS.productPromotions.byPromotionEnriched(idPromocion))
		);
	}

	getPromotionsByProduct(idProducto: number): Observable<ApiResponse<PromotionsByProductDataDto>> {
		return this.http.get<ApiResponse<PromotionsByProductDataDto>>(
			buildApiUrl(API_ENDPOINTS.productPromotions.byProduct(idProducto))
		);
	}

	createProductPromotion(dto: CreateProductPromoRequestDto): Observable<ApiResponse<ProductoPromocionItem>> {
		return this.http.post<ApiResponse<ProductoPromocionItem>>(this.productPromotionsUrl, dto);
	}

	updateProductPromotion(id: number, dto: UpdateProductPromoRequestDto): Observable<ApiResponse<ProductoPromocionItem>> {
		return this.http.put<ApiResponse<ProductoPromocionItem>>(buildApiUrl(API_ENDPOINTS.productPromotions.detail(id)), dto);
	}

	deleteProductPromotion(id: number): Observable<ApiResponse<null>> {
		return this.http.delete<ApiResponse<null>>(buildApiUrl(API_ENDPOINTS.productPromotions.detail(id)));
	}

	// ==================== PROMOTION EVENT DAYS ====================

	listPromocionEventoDias(): Observable<ApiResponse<PromotionEventDayItem[]>> {
		return this.http.get<ApiResponse<PromotionEventDayItem[]>>(this.promotionEventDaysUrl);
	}

	getPromocionEventoDiaById(id: number): Observable<ApiResponse<PromotionEventDayItem>> {
		return this.http.get<ApiResponse<PromotionEventDayItem>>(buildApiUrl(API_ENDPOINTS.promotionEventDays.detail(id)));
	}

	getPromotionsByEventDay(idEventoDiaSemana: number): Observable<ApiResponse<PromotionEventDayItem[]>> {
		return this.http.get<ApiResponse<PromotionEventDayItem[]>>(
			buildApiUrl(API_ENDPOINTS.promotionEventDays.byEventDay(idEventoDiaSemana))
		);
	}

	createPromocionEventoDia(dto: CreatePromotionEventDayRequestDto): Observable<ApiResponse<CreatePromotionEventDayResponseDto>> {
		return this.http.post<ApiResponse<CreatePromotionEventDayResponseDto>>(this.promotionEventDaysUrl, dto);
	}

	updatePromocionEventoDia(id: number, dto: UpdatePromotionEventDayRequestDto): Observable<ApiResponse<UpdatePromotionEventDayResponseDto>> {
		return this.http.put<ApiResponse<UpdatePromotionEventDayResponseDto>>(buildApiUrl(API_ENDPOINTS.promotionEventDays.detail(id)), dto);
	}

	deletePromocionEventoDia(id: number): Observable<ApiResponse<null>> {
		return this.http.delete<ApiResponse<null>>(buildApiUrl(API_ENDPOINTS.promotionEventDays.detail(id)));
	}

	// Métodos deprecated (mantener compatibilidad)
	getPromotionsByEventDay_deprecated(idEventoSemana: number): Observable<ApiResponse<PromotionsByEventDayResponse>> {
		return this.http.get<ApiResponse<PromotionsByEventDayResponse>>(
			buildApiUrl(API_ENDPOINTS.promotionEventDays.byEventDay(idEventoSemana))
		);
	}

	createPromotionEventDay(dto: CreatePromotionEventDayRequestDto): Observable<ApiResponse<PromotionEventDayItem>> {
		return this.http.post<ApiResponse<PromotionEventDayItem>>(this.promotionEventDaysUrl, dto);
	}

	updatePromotionEventDay(id: number, dto: UpdatePromotionEventDayRequestDto): Observable<ApiResponse<PromotionEventDayItem>> {
		return this.http.put<ApiResponse<PromotionEventDayItem>>(buildApiUrl(API_ENDPOINTS.promotionEventDays.detail(id)), dto);
	}

	deletePromotionEventDay(id: number): Observable<ApiResponse<null>> {
		return this.http.delete<ApiResponse<null>>(buildApiUrl(API_ENDPOINTS.promotionEventDays.detail(id)));
	}
}
