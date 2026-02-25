import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { EventsPromotionsApi } from "../../../../../services/apis/events&Promotions.api";
import { Promocion } from "../../../../../domain/events&Promotions/models/promocion.model";
import { Evento } from "../../../../../domain/events&Promotions/models/evento.model";
import { CreatePromotionRequestDto } from "../../../../../domain/events&Promotions/dtos/request/create-promotion.request.dto";
import { UpdatePromotionRequestDto } from "../../../../../domain/events&Promotions/dtos/request/update-promotion.request.dto";
import { CreateEventRequestDto } from "../../../../../domain/events&Promotions/dtos/request/create-event.request.dto";
import { UpdateEventRequestDto } from "../../../../../domain/events&Promotions/dtos/request/update-event.request.dto";

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

	getPromociones(): Observable<PromocionViewModel[]> {
		return this.api.listPromotions().pipe(
			map((response) => {
				if (!response.data) return [];
				return response.data.map((promo) => this.mapPromocionToViewModel(promo));
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

	getEventos(): Observable<EventoViewModel[]> {
		return this.api.listEvents().pipe(
			map((response) => {
				if (!response.data) return [];
				return response.data.map((evento) => this.mapEventoToViewModel(evento));
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

	private formatDate(dateString: string): string {
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
