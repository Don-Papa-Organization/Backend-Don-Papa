import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EventsPromotionsApi } from '../../../../../services/apis/events&Promotions.api';
import { ApiResponse } from '../../../../../types/api-response.type';
import { Promocion } from '../../../../../domain/events&Promotions/models/promocion.model';
import { UpcomingEventoDto } from '../../../../../domain/events&Promotions/dtos/response/list-upcoming-events.response.dto';
import { EventoDetalleDto } from '../../../../../domain/events&Promotions/dtos/response/get-event-detail.response.dto';
import { SearchEventsRequestDto } from '../../../../../domain/events&Promotions/dtos/request/search-events.request.dto';
import { Evento } from '../../../../../domain/events&Promotions/models/evento.model';

@Injectable({
  providedIn: 'root'
})
export class EventsPromotionsFacade {
  constructor(private eventsPromotionsApi: EventsPromotionsApi) { }

  listPromotions(): Observable<ApiResponse<Promocion[]>> {
    return this.eventsPromotionsApi.listPromotions();
  }

  getPromotion(id: number): Observable<ApiResponse<Promocion>> {
    return this.eventsPromotionsApi.getPromotion(id);
  }

  listActivePromotions(activas: boolean): Observable<ApiResponse<Promocion[]>> {
    return this.eventsPromotionsApi.listActivePromotions(activas);
  }

  listUpcomingEvents(): Observable<ApiResponse<UpcomingEventoDto[]>> {
    return this.eventsPromotionsApi.listUpcomingEvents();
  }

  getEventDetail(id: number): Observable<ApiResponse<EventoDetalleDto>> {
    return this.eventsPromotionsApi.getEventDetail(id);
  }

  searchEvents(dto: SearchEventsRequestDto): Observable<ApiResponse<Evento[]>> {
    return this.eventsPromotionsApi.searchEvents(dto);
  }
}
