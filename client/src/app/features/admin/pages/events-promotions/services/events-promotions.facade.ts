import { Injectable } from "@angular/core";
import { Observable, map, catchError, of } from "rxjs";
import { EventsPromotionsApi } from "../../../../../services/apis/events&Promotions.api";
import { Promocion } from "../../../../../domain/events&Promotions/models/promocion.model";
import { Evento } from "../../../../../domain/events&Promotions/models/evento.model";
import { PromotionEventDayItem } from "../../../../../domain/events&Promotions/models/promotioneventodia.model";
import { CreatePromotionRequestDto } from "../../../../../domain/events&Promotions/dtos/request/create-promotion.request.dto";
import { UpdatePromotionRequestDto } from "../../../../../domain/events&Promotions/dtos/request/update-promotion.request.dto";
import { CreateEventRequestDto } from "../../../../../domain/events&Promotions/dtos/request/create-event.request.dto";
import { UpdateEventRequestDto } from "../../../../../domain/events&Promotions/dtos/request/update-event.request.dto";
import { CreatePromotionEventDayRequestDto } from "../../../../../domain/events&Promotions/dtos/request/create-promotion-event-day.request.dto";
import { UpdatePromotionEventDayRequestDto } from "../../../../../domain/events&Promotions/dtos/request/update-promotion-event-day.request.dto";
import { CreatePromotionEventDayResponseDto } from "../../../../../domain/events&Promotions/dtos/response/create-promotion-event-day.response.dto";
import { UpdatePromotionEventDayResponseDto } from "../../../../../domain/events&Promotions/dtos/response/update-promotion-event-day.response.dto";
import { AdminFiltros } from "../../../../../shared/ui/ui-admin-filter-panel/ui-admin-filter-panel";

interface PromocionViewModel {
	"ID": number;
	"Nombre": string;
	"Descripción": string;
	"Fecha Inicio": string;
	"Fecha Fin": string;
	"Tipo": string;
	"Estado": string;
	// Propiedades adicionales para acceso mediante notación de punto
	idPromocion: number;
	activo: string;
}

interface EventoViewModel {
	"ID": number;
	"Nombre": string;
	"Descripción": string;
	// Propiedades adicionales para acceso mediante notación de punto
	idEvento: number;
}

@Injectable({ providedIn: "root" })
export class EventsPromotionsFacade {
	constructor(private api: EventsPromotionsApi) { }

	// ==================== PROMOCIONES ====================

	getPromociones(filtros?: AdminFiltros): Observable<PromocionViewModel[]> {
		return this.api.listPromotions().pipe(
			map((response) => {
				if (!response.data) return [];
				let promociones = response.data;

				if (filtros) {
					if (filtros.busqueda) {
						const term = filtros.busqueda.toLowerCase();
						promociones = promociones.filter(p =>
							p.nombre.toLowerCase().includes(term) ||
							p.descripcion.toLowerCase().includes(term)
						);
					}
					if (filtros.estado !== null && filtros.estado !== undefined) {
						promociones = promociones.filter(p => p.activo === (filtros.estado === 'true' || filtros.estado === true));
					}
					if (filtros.fechaInicio) {
						const fInicio = new Date(filtros.fechaInicio);
						promociones = promociones.filter(p => new Date(p.fechaInicio) >= fInicio);
					}
					if (filtros.fechaFin) {
						const fFin = new Date(filtros.fechaFin);
						promociones = promociones.filter(p => new Date(p.fechaFin) <= fFin);
					}
				}

				return promociones.map((promo) => this.mapPromocionToViewModel(promo));
			})
		);
	}

	getPromocionById(id: number): Observable<Promocion> {
		return this.api.getPromotion(id).pipe(
			map((response) => {
				if (!response.data) throw new Error("Promoción no encontrada");
				return response.data;
			})
		);
	}

	createPromocion(dto: CreatePromotionRequestDto): Observable<Promocion> {
		return this.api.createPromotion(dto).pipe(
			map((response) => {
				if (!response.data) throw new Error("Error al crear promoción");
				return response.data;
			})
		);
	}

	updatePromocion(id: number, dto: UpdatePromotionRequestDto): Observable<Promocion> {
		return this.api.updatePromotion(id, dto).pipe(
			map((response) => {
				if (!response.data) throw new Error("Error al actualizar promoción");
				return response.data;
			})
		);
	}

	deletePromocion(id: number): Observable<void> {
		return this.api.deletePromotion(id).pipe(map(() => { }));
	}

	// ==================== EVENTOS ====================

	getEventos(filtros?: AdminFiltros): Observable<EventoViewModel[]> {
		return this.api.listEvents().pipe(
			map((response) => {
				if (!response.data) return [];
				let eventos = response.data;

				if (filtros) {
					if (filtros.busqueda) {
						const term = filtros.busqueda.toLowerCase();
						eventos = eventos.filter(e =>
							e.nombre.toLowerCase().includes(term) ||
							e.descripcion.toLowerCase().includes(term)
						);
					}
				}

				return eventos.map((evento) => this.mapEventoToViewModel(evento));
			})
		);
	}

	getEventoById(id: number): Observable<Evento> {
		return this.api.getEvent(id).pipe(
			map((response) => {
				if (!response.data) throw new Error("Evento no encontrado");
				return response.data;
			})
		);
	}

	createEvento(dto: CreateEventRequestDto): Observable<Evento> {
		return this.api.createEvent(dto).pipe(
			map((response) => {
				if (!response.data) throw new Error("Error al crear evento");
				return response.data;
			})
		);
	}

	updateEvento(id: number, dto: UpdateEventRequestDto): Observable<Evento> {
		return this.api.updateEvent(id, dto).pipe(
			map((response) => {
				if (!response.data) throw new Error("Error al actualizar evento");
				return response.data;
			})
		);
	}

	deleteEvento(id: number): Observable<void> {
		return this.api.deleteEvent(id).pipe(map(() => { }));
	}

	togglePromotionActive(id: number, activo: boolean): Observable<Promocion> {
		return this.api.togglePromotionActive(id, { activo }).pipe(
			map((response) => {
				if (!response.data) throw new Error("Error al cambiar estado de promoción");
				return response.data;
			})
		);
	}

	// ==================== EVENT DAYS ====================

	getEventDays(idEvento: number): Observable<any[]> {
		return this.api.listEventDays(idEvento).pipe(
			map((response) => response.data || [])
		);
	}

	createEventDay(dto: any): Observable<any> {
		return this.api.createEventDay(dto).pipe(
			map((response) => response.data)
		);
	}

	updateEventDay(id: number, dto: any): Observable<any> {
		return this.api.updateEventDay(id, dto).pipe(
			map((response) => response.data)
		);
	}

	deleteEventDay(id: number): Observable<void> {
		return this.api.deleteEventDay(id).pipe(map(() => { }));
	}

	// ==================== PRODUCT PROMOTIONS ====================

	getProductPromotions(): Observable<any[]> {
		return this.api.listProductPromotions().pipe(
			map((response) => response.data || [])
		);
	}

	getProductsByPromotion(idPromocion: number): Observable<any> {
		return this.api.getProductsByPromotion(idPromocion).pipe(
			map((response) => response.data)
		);
	}

	createProductPromotion(dto: any): Observable<any> {
		return this.api.createProductPromotion(dto).pipe(
			map((response) => response.data)
		);
	}

	updateProductPromotion(id: number, dto: any): Observable<any> {
		return this.api.updateProductPromotion(id, dto).pipe(
			map((response) => response.data)
		);
	}

	deleteProductPromotion(id: number): Observable<void> {
		return this.api.deleteProductPromotion(id).pipe(map(() => { }));
	}

	// ==================== PROMOTION EVENT DAYS ====================

	listPromocionEventoDias(): Observable<PromotionEventDayItem[]> {
		return this.api.listPromocionEventoDias().pipe(
			map((response) => response.data || [])
		);
	}

	getPromocionEventoDiaById(id: number): Observable<PromotionEventDayItem> {
		return this.api.getPromocionEventoDiaById(id).pipe(
			map((response) => {
				if (!response.data) throw new Error("Relación no encontrada");
				return response.data;
			})
		);
	}

	getPromotionsByEventDay(idEventoDiaSemana: number): Observable<PromotionEventDayItem[]> {
		return this.api.getPromotionsByEventDay(idEventoDiaSemana).pipe(
			map((response) => {
				console.log('Facade - respuesta del API:', response);
				console.log('Facade - response.data:', response.data);
				return response.data || [];
			}),
			catchError((error) => {
				console.error('El endpoint de promociones por día no está disponible en el backend:', error);
				return of([]);
			})
		);
	}

	createPromocionEventoDia(dto: CreatePromotionEventDayRequestDto): Observable<CreatePromotionEventDayResponseDto> {
		return this.api.createPromocionEventoDia(dto).pipe(
			map((response) => {
				if (!response.data) throw new Error("Error al crear la relación");
				return response.data;
			})
		);
	}

	updatePromocionEventoDia(id: number, dto: UpdatePromotionEventDayRequestDto): Observable<UpdatePromotionEventDayResponseDto> {
		return this.api.updatePromocionEventoDia(id, dto).pipe(
			map((response) => {
				if (!response.data) throw new Error("Error al actualizar la relación");
				return response.data;
			})
		);
	}

	deletePromocionEventoDia(id: number): Observable<void> {
		return this.api.deletePromocionEventoDia(id).pipe(map(() => { }));
	}

	// Métodos deprecated (mantener compatibilidad)
	getPromotionsByEventDay_deprecated(idEventoSemana: number): Observable<any> {
		return this.api.getPromotionsByEventDay_deprecated(idEventoSemana).pipe(
			map((response) => response.data)
		);
	}

	createPromotionEventDay(dto: CreatePromotionEventDayRequestDto): Observable<PromotionEventDayItem | null> {
		return this.api.createPromotionEventDay(dto).pipe(
			map((response) => response.data)
		);
	}

	updatePromotionEventDay(id: number, dto: UpdatePromotionEventDayRequestDto): Observable<PromotionEventDayItem | null> {
		return this.api.updatePromotionEventDay(id, dto).pipe(
			map((response) => response.data)
		);
	}

	deletePromotionEventDay(id: number): Observable<void> {
		return this.api.deletePromotionEventDay(id).pipe(map(() => { }));
	}

	// ==================== MAPPERS ====================

	private mapPromocionToViewModel(promo: Promocion): PromocionViewModel {
		return {
			"ID": promo.idPromocion,
			"Nombre": promo.nombre,
			"Descripción": promo.descripcion,
			"Fecha Inicio": this.formatDate(promo.fechaInicio),
			"Fecha Fin": this.formatDate(promo.fechaFin),
			"Tipo": this.formatTipoPromocion(promo.tipoPromocion),
			"Estado": promo.activo ? "Activa" : "Inactiva",
			// Propiedades adicionales para acceso mediante notación de punto
			idPromocion: promo.idPromocion,
			activo: promo.activo ? "Activa" : "Inactiva"
		};
	}

	private mapEventoToViewModel(evento: Evento): EventoViewModel {
		return {
			"ID": evento.idEvento,
			"Nombre": evento.nombre,
			"Descripción": evento.descripcion,
			// Propiedades adicionales para acceso mediante notación de punto
			idEvento: evento.idEvento
		};
	}

	private formatTipoPromocion(tipo: string): string {
		const tipos: Record<string, string> = {
			porcentaje: "Porcentaje",
			precio_fijo: "Precio Fijo"
		};
		return tipos[tipo] || tipo;
	}

	public formatDate(dateString: string): string {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString("es-ES", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit"
			});
		} catch {
			return dateString;
		}
	}
}
