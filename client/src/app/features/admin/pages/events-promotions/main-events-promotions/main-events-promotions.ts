import { Component, OnInit } from "@angular/core";
import { TabItem } from "../../../../../shared/ui/ui-tabs/ui-tabs";
import { AccionTabla } from "../../../../../shared/ui/ui-tabla/ui-tabla";
import { Promocion } from "../../../../../domain/events&Promotions/models/promocion.model";
import { Evento } from "../../../../../domain/events&Promotions/models/evento.model";
import { EventsPromotionsFacade } from "../services/events-promotions.facade";
import { InventoryFacade } from "../../inventory/services/inventory.facade";
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

@Component({
	selector: "app-main-events-promotions",
	templateUrl: "./main-events-promotions.html",
	standalone: false,
	styleUrls: ["./main-events-promotions.scss"]
})
export class MainEventsPromotions implements OnInit {
	// === TABS ===
	tabs: TabItem[] = [
		{ id: "promociones", label: "Promociones" },
		{ id: "eventos", label: "Eventos" }
	];
	tabActiva: string = "promociones";

	// === DATOS PROMOCIONES ===
	promociones: PromocionViewModel[] = [];
	columnasPromociones = [
		"ID",
		"Nombre",
		"Descripción",
		"Fecha Inicio",
		"Fecha Fin",
		"Tipo",
		"Estado",
        "Acciones"
	];

	// === DATOS EVENTOS ===
	eventos: EventoViewModel[] = [];
	columnasEventos = ["ID", "Nombre", "Descripción", "Acciones"];

	// === ESTADOS DE MODALES - PROMOCIONES ===
	mostrarModalAgregarPromocion = false;
	mostrarModalEditarPromocion = false;
	mostrarModalEliminarPromocion = false;
	promocionSeleccionada: Promocion | null = null;

	// === ESTADOS DE MODALES - EVENTOS ===
	mostrarModalAgregarEvento = false;
	mostrarModalEditarEvento = false;
	mostrarModalEliminarEvento = false;
	eventoSeleccionado: Evento | null = null;

	// === ESTADOS DE MODALES - PRODUCTOS DE PROMOCIÓN ===
	mostrarModalProductosPromocion = false;
	productosPromocion: any[] = [];

	// === ESTADOS DE MODALES - DÍAS DE EVENTO ===
	mostrarModalDiasEvento = false;
	diasEvento: any[] = [];

	// === ESTADOS DE MODALES - AGREGAR PRODUCTO A PROMOCIÓN ===
	mostrarModalAgregarProducto = false;
	productosDisponibles: any[] = [];

	// === ESTADOS DE MODALES - AGREGAR DÍA A EVENTO ===
	mostrarModalAgregarDia = false;

	// === ACCIONES DE TABLA ===
	accionesPromociones: AccionTabla[] = [
		{
			urlIcono: "icons/editar.svg",
			accion: (registro: PromocionViewModel) => this.onEditarPromocion(registro)
		},
		{
			urlIcono: "icons/check.svg",
			accion: (registro: PromocionViewModel) => this.onTogglePromocionActiva(registro)
		},
		{
			urlIcono: "icons/eye.svg",
			accion: (registro: PromocionViewModel) => this.onGestionarProductosDePromocion(registro)
		},
		{
			urlIcono: "icons/eliminar.svg",
			accion: (registro: PromocionViewModel) => this.onEliminarPromocion(registro)
		}
	];

	accionesEventos: AccionTabla[] = [
		{
			urlIcono: "icons/editar.svg",
			accion: (registro: EventoViewModel) => this.onEditarEvento(registro)
		},
		{
			urlIcono: "icons/eye.svg",
			accion: (registro: EventoViewModel) => this.onGestionarDiasDeEvento(registro)
		},
		{
			urlIcono: "icons/eliminar.svg",
			accion: (registro: EventoViewModel) => this.onEliminarEvento(registro)
		}
	];

	constructor(
		private facade: EventsPromotionsFacade,
		private inventoryFacade: InventoryFacade
	) { }

	ngOnInit(): void {
		this.cargarPromociones();
		this.cargarEventos();
		this.cargarProductos();
	}

	// ==================== TABS ====================
	cambiarTab(tabId: string): void {
		this.tabActiva = tabId;
	}

	// ==================== PROMOCIONES ====================
	cargarPromociones(): void {
		this.facade.getPromociones().subscribe({
			next: (data) => {
				this.promociones = data;
			},
			error: (error) => console.error("Error al cargar promociones:", error)
		});
	}

	onAgregarPromocion(): void {
		this.mostrarModalAgregarPromocion = true;
	}

	onEditarPromocion(registro: PromocionViewModel): void {
		this.facade.getPromocionById(registro.idPromocion).subscribe({
			next: (promocion) => {
				this.promocionSeleccionada = promocion;
				this.mostrarModalEditarPromocion = true;
			},
			error: (error) => console.error("Error al cargar promoción:", error)
		});
	}

	onEliminarPromocion(registro: PromocionViewModel): void {
		this.facade.getPromocionById(registro.idPromocion).subscribe({
			next: (promocion) => {
				this.promocionSeleccionada = promocion;
				this.mostrarModalEliminarPromocion = true;
			},
			error: (error) => console.error("Error al cargar promoción:", error)
		});
	}

	onPromocionCreada(dto: CreatePromotionRequestDto): void {
		this.facade.createPromocion(dto).subscribe({
			next: () => {
				this.mostrarModalAgregarPromocion = false;
				this.cargarPromociones();
			},
			error: (error) => console.error("Error al crear promoción:", error)
		});
	}

	onPromocionActualizada(dto: UpdatePromotionRequestDto): void {
		if (!this.promocionSeleccionada) return;
		this.facade.updatePromocion(this.promocionSeleccionada.idPromocion, dto).subscribe({
			next: () => {
				this.mostrarModalEditarPromocion = false;
				this.promocionSeleccionada = null;
				this.cargarPromociones();
			},
			error: (error) => console.error("Error al actualizar promoción:", error)
		});
	}

	onTogglePromocionActiva(registro: PromocionViewModel): void {
		const nuevoEstado = registro.activo === "Inactiva";
		this.facade.togglePromotionActive(registro.idPromocion, nuevoEstado).subscribe({
			next: () => {
				this.cargarPromociones();
			},
			error: (error) => console.error("Error al cambiar estado de promoción:", error)
		});
	}

	onGestionarProductosDePromocion(registro: PromocionViewModel): void {
		this.facade.getProductPromotions().subscribe({
			next: (productos) => {
				// Filtrar productos asociados a esta promoción
				this.productosPromocion = productos.filter(
					(p: any) => p.idPromocion === registro.idPromocion
				);
				this.promocionSeleccionada = null;
				this.facade.getPromocionById(registro.idPromocion).subscribe({
					next: (promocion) => {
						this.promocionSeleccionada = promocion;
						this.mostrarModalProductosPromocion = true;
					},
					error: (error) => console.error("Error al cargar promoción:", error)
				});
			},
			error: (error) => console.error("Error al cargar productos de promoción:", error)
		});
	}

	cerrarModalProductosPromocion(): void {
		this.mostrarModalProductosPromocion = false;
		this.productosPromocion = [];
		this.promocionSeleccionada = null;
	}

	abrirModalAgregarProducto(): void {
		if (!this.promocionSeleccionada) return;
		// Cargar productos disponibles
		this.facade.getPromociones().subscribe({
			next: () => {
				// Obtener lista de todos los productos (puedes usar un endpoint específico si existe)
				this.mostrarModalAgregarProducto = true;
			},
			error: (error) => console.error("Error al cargar productos:", error)
		});
	}

	onProductoAgregado(dto: any): void {
		this.facade.createProductPromotion(dto).subscribe({
			next: () => {
				this.mostrarModalAgregarProducto = false;
				// Recargar productos de la promoción
				if (this.promocionSeleccionada) {
					this.onGestionarProductosDePromocion({
						"ID": this.promocionSeleccionada.idPromocion,
						"Nombre": this.promocionSeleccionada.nombre,
						"Descripción": this.promocionSeleccionada.descripcion || "",
						"Fecha Inicio": "",
						"Fecha Fin": "",
						"Tipo": "",
						"Estado": "",
						idPromocion: this.promocionSeleccionada.idPromocion,
						activo: ""
					});
				}
			},
			error: (error) => console.error("Error al agregar producto a promoción:", error)
		});
	}

	cerrarModalAgregarProducto(): void {
		this.mostrarModalAgregarProducto = false;
	}

	confirmarEliminacionPromocion(): void {
		if (!this.promocionSeleccionada) return;

		this.facade.deletePromocion(this.promocionSeleccionada.idPromocion).subscribe({
			next: () => {
				this.mostrarModalEliminarPromocion = false;
				this.promocionSeleccionada = null;
				this.cargarPromociones();
			},
			error: (error) => console.error("Error al eliminar promoción:", error)
		});
	}

	cerrarModalEliminarPromocion(): void {
		this.mostrarModalEliminarPromocion = false;
		this.promocionSeleccionada = null;
	}

	// ==================== EVENTOS ====================
	cargarEventos(): void {
		this.facade.getEventos().subscribe({
			next: (data) => {
				this.eventos = data;
			},
			error: (error) => console.error("Error al cargar eventos:", error)
		});
	}

	/**
	 * Carga la lista de productos disponibles para el combobox
	 */
	private cargarProductos(): void {
		this.inventoryFacade.getProductsWithCategories().subscribe({
			next: (productos) => {
				console.log('Productos recibidos:', productos);
				this.productosDisponibles = productos
					.filter((p: any) => p.activo !== false && p.activo !== 0)
					.map((producto: any) => ({
						value: producto.idProducto,
						label: `${producto.nombre} - $${producto.precio}`
					}));
				console.log('Opciones mapeadas:', this.productosDisponibles);
			},
			error: (error) => {
				console.error('Error al cargar productos:', error);
			}
		});
	}

	onAgregarEvento(): void {
		this.mostrarModalAgregarEvento = true;
	}

	onEditarEvento(registro: EventoViewModel): void {
		this.facade.getEventoById(registro.idEvento).subscribe({
			next: (evento) => {
				this.eventoSeleccionado = evento;
				this.mostrarModalEditarEvento = true;
			},
			error: (error) => console.error("Error al cargar evento:", error)
		});
	}

	onEliminarEvento(registro: EventoViewModel): void {
		this.facade.getEventoById(registro.idEvento).subscribe({
			next: (evento) => {
				this.eventoSeleccionado = evento;
				this.mostrarModalEliminarEvento = true;
			},
			error: (error) => console.error("Error al cargar evento:", error)
		});
	}

	onEventoCreado(dto: CreateEventRequestDto): void {
		this.facade.createEvento(dto).subscribe({
			next: () => {
				this.mostrarModalAgregarEvento = false;
				this.cargarEventos();
			},
			error: (error) => console.error("Error al crear evento:", error)
		});
	}

	onEventoActualizado(dto: UpdateEventRequestDto): void {
		if (!this.eventoSeleccionado) return;
		this.facade.updateEvento(this.eventoSeleccionado.idEvento, dto).subscribe({
			next: () => {
				this.mostrarModalEditarEvento = false;
				this.eventoSeleccionado = null;
				this.cargarEventos();
			},
			error: (error) => console.error("Error al actualizar evento:", error)
		});
	}

	onGestionarDiasDeEvento(registro: EventoViewModel): void {
		this.facade.getEventDays(registro.idEvento).subscribe({
			next: (dias) => {
				this.diasEvento = dias;
				this.eventoSeleccionado = null;
				this.facade.getEventoById(registro.idEvento).subscribe({
					next: (evento) => {
						this.eventoSeleccionado = evento;
						this.mostrarModalDiasEvento = true;
					},
					error: (error) => console.error("Error al cargar evento:", error)
				});
			},
			error: (error) => console.error("Error al cargar días del evento:", error)
		});
	}

	cerrarModalDiasEvento(): void {
		this.mostrarModalDiasEvento = false;
		this.diasEvento = [];
		this.eventoSeleccionado = null;
	}

	abrirModalAgregarDia(): void {
		if (!this.eventoSeleccionado) return;
		this.mostrarModalAgregarDia = true;
	}

	onDiaAgregado(dto: any): void {
		this.facade.createEventDay(dto).subscribe({
			next: () => {
				this.mostrarModalAgregarDia = false;
				// Recargar días del evento
				if (this.eventoSeleccionado) {
					this.onGestionarDiasDeEvento({
						"ID": this.eventoSeleccionado.idEvento,
						"Nombre": this.eventoSeleccionado.nombre,
						"Descripción": this.eventoSeleccionado.descripcion || "",
						idEvento: this.eventoSeleccionado.idEvento
					});
				}
			},
			error: (error) => console.error("Error al agregar día al evento:", error)
		});
	}

	cerrarModalAgregarDia(): void {
		this.mostrarModalAgregarDia = false;
	}

	confirmarEliminacionEvento(): void {
		if (!this.eventoSeleccionado) return;

		this.facade.deleteEvento(this.eventoSeleccionado.idEvento).subscribe({
			next: () => {
				this.mostrarModalEliminarEvento = false;
				this.eventoSeleccionado = null;
				this.cargarEventos();
			},
			error: (error) => console.error("Error al eliminar evento:", error)
		});
	}

	cerrarModalEliminarEvento(): void {
		this.mostrarModalEliminarEvento = false;
		this.eventoSeleccionado = null;
	}
}
