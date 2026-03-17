import { Component, OnInit, ViewChild } from "@angular/core";
import { TabItem } from "../../../../../shared/ui/ui-tabs/ui-tabs";
import { AdminFiltros, FiltroOpcion } from "../../../../../shared/ui/ui-admin-filter-panel/ui-admin-filter-panel";
import { AccionTabla, TablaColumnaConfig, TablaToggleChangeEvent } from "../../../../../shared/ui/ui-tabla/ui-tabla";
import { Promocion } from "../../../../../domain/events&Promotions/models/promocion.model";
import { Evento } from "../../../../../domain/events&Promotions/models/evento.model";
import { PromotionEventDayItem } from "../../../../../domain/events&Promotions/models/promotioneventodia.model";
import { EventsPromotionsFacade } from "../services/events-promotions.facade";
import { InventoryFacade } from "../../inventory/services/inventory.facade";
import { CreatePromotionRequestDto } from "../../../../../domain/events&Promotions/dtos/request/create-promotion.request.dto";
import { UpdatePromotionRequestDto } from "../../../../../domain/events&Promotions/dtos/request/update-promotion.request.dto";
import { CreateEventRequestDto } from "../../../../../domain/events&Promotions/dtos/request/create-event.request.dto";
import { UpdateEventRequestDto } from "../../../../../domain/events&Promotions/dtos/request/update-event.request.dto";
import { CreatePromotionEventDayRequestDto } from "../../../../../domain/events&Promotions/dtos/request/create-promotion-event-day.request.dto";
import { ProductsSectionComponent } from "../components/products-section/products-section";
import { DaysSectionComponent } from "../components/days-section/days-section";

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
	activo: boolean;
}

interface EventoViewModel {
	"ID": number;
	"Nombre": string;
	"Descripción": string;
	// Propiedades adicionales para acceso mediante notación de punto
	idEvento: number;
}

interface PromocionDelDiaViewModel {
	idPromocionEventoDia: number;
	idPromocion: number;
	idEventoDiaSemana: number;
	"Nombre": string;
	"Descripción": string;
	"% Descuento": string;
	"Fecha Inicio": string;
	"Fecha Fin": string;
}

interface EventoDiaSemanaViewModel {
	idEventoSemana: number;
	idEvento: number;
	"Fecha": string;
	"Hora Inicio": string;
	"Hora Fin": string;
	fecha?: string;
	horaInicio?: string;
	horaFin?: string;
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

	// === INDICADORES DE CARGA ===
	cargandoPromociones = false;
	cargandoEventos = false;

	// === FILTROS ===
	filtrosActuales: AdminFiltros | null = null;
	estadoOpciones: FiltroOpcion[] = [
		{ value: 'true', label: 'Activa' },
		{ value: 'false', label: 'Inactiva' }
	];

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
	columnasPromocionesConfig: TablaColumnaConfig[] = [
		{
			header: 'Estado',
			type: 'toggle',
			toggle: {
				trueLabel: 'Activa',
				falseLabel: 'Inactiva'
			}
		}
	];

	// === DATOS EVENTOS ===
	eventos: EventoViewModel[] = [];
	columnasEventos = ["ID", "Nombre", "Descripción", "Acciones"];

	// === REFERENCIAS A COMPONENTES ENCAPSULADOS ===
	@ViewChild(ProductsSectionComponent) productsSection!: ProductsSectionComponent;
	@ViewChild(DaysSectionComponent) daysSection!: DaysSectionComponent;

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

	// === ESTADOS DE PRODUCTOS (Delegados) ===
	mostrarModalProductosPromocion = false;
	productosPromocion: any[] = [];
	productosDisponibles: any[] = [];

	// === ESTADOS DE DÍAS (Delegados) ===
	mostrarModalDiasEvento = false;
	diasEvento: any[] = [];
	promocionesDisponibles: any[] = [];

	// === ACCIONES DE TABLA ===
	accionesPromociones: AccionTabla[] = [
		{
			urlIcono: "icons/editar.svg",
			accion: (registro: PromocionViewModel) => this.onEditarPromocion(registro)
		},
		{
			urlIcono: "icons/product.svg",
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
			urlIcono: "icons/calendar.svg",
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
		this.cargandoPromociones = true;
		this.facade.getPromociones(this.filtrosActuales || undefined).subscribe({
			next: (data) => {
				this.promociones = data;
				this.cargandoPromociones = false;
			},
			error: (error) => {
				console.error("Error al cargar promociones:", error);
				this.cargandoPromociones = false;
			}
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
		const nuevoEstado = !registro.activo;
		this.facade.togglePromotionActive(registro.idPromocion, nuevoEstado).subscribe({
			next: () => {
				this.cargarPromociones();
			},
			error: (error) => console.error("Error al cambiar estado de promoción:", error)
		});
	}

	onEstadoPromocionToggle(event: TablaToggleChangeEvent): void {
		if (event.columna.toLowerCase() !== 'estado') {
			return;
		}

		const registro = event.registro as PromocionViewModel;
		if (!registro?.idPromocion) {
			return;
		}

		this.facade.togglePromotionActive(registro.idPromocion, event.nextValue).subscribe({
			next: () => {
				registro.activo = event.nextValue;
				registro['Estado'] = event.nextValue ? 'Activa' : 'Inactiva';
			},
			error: (error) => {
				console.error('Error al cambiar estado de promoción desde tabla:', error);
				this.cargarPromociones();
			}
		});
	}

	onGestionarProductosDePromocion(registro: PromocionViewModel): void {
		this.facade.getPromocionById(registro.idPromocion).subscribe({
			next: (promocion) => {
				this.promocionSeleccionada = promocion;
				this.facade.getProductsByPromotion(registro.idPromocion).subscribe({
					next: (respuesta: any) => {
						this.productosPromocion = (respuesta.productos || []).map((item: any) => ({
							idProductoPromocion: item.idProductoPromocion,
							idProducto: item.idProducto,
							idPromocion: item.idPromocion,
							"Nombre": item.detalleProducto?.nombre || `Producto #${item.idProducto}`,
							"Precio": `$${item.detalleProducto?.precio || 0}`,
							"Cant. Mínima": item.cantidadMinima,
							"Precio Promo": item.precioPromocional ? `$${item.precioPromocional}` : '-',
							"% Descuento": item.porcentajeDescuento ? `${item.porcentajeDescuento}%` : '-',
							nombre: item.detalleProducto?.nombre || `Producto #${item.idProducto}`,
							precio: item.detalleProducto?.precio || 0,
							descripcion: item.detalleProducto?.descripcion || '-',
							cantidadMinima: item.cantidadMinima,
							precioPromocional: item.precioPromocional,
							porcentajeDescuento: item.porcentajeDescuento
						}));
						this.mostrarModalProductosPromocion = true;
					}
				});
			}
		});
	}

	onRecargarProductosDePromocion(idPromocion: number): void {
		this.onGestionarProductosDePromocion({ idPromocion } as any);
	}

	// ==================== EVENTOS ====================
	cargarEventos(): void {
		this.cargandoEventos = true;
		this.facade.getEventos(this.filtrosActuales || undefined).subscribe({
			next: (data) => {
				this.eventos = data;
				this.cargandoEventos = false;
			},
			error: (error) => {
				console.error("Error al cargar eventos:", error);
				this.cargandoEventos = false;
			}
		});
	}

	/**
	 * Carga la lista de productos disponibles para el combobox
	 */
	private cargarProductos(): void {
		this.inventoryFacade.getProductsWithCategories().subscribe({
			next: (productos: any[]) => {
				console.log('Productos recibidos:', productos);
				this.productosDisponibles = productos
					.filter((p: any) => p.activo !== false && p.activo !== 0)
					.map((producto: any) => ({
						value: producto.idProducto,
						label: `${producto.nombre} - $${producto.precio}`
					}));
				console.log('Opciones mapeadas:', this.productosDisponibles);
			},
			error: (error: any) => {
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
			next: (dias: any[]) => {
				this.diasEvento = dias.map((dia: any) => ({
					idEventoSemana: dia.idEventoSemana,
					idEvento: dia.idEvento,
					"Fecha": this.facade.formatDate(dia.fecha),
					"Hora Inicio": dia.horaInicio,
					"Hora Fin": dia.horaFin,
					fecha: dia.fecha,
					horaInicio: dia.horaInicio,
					horaFin: dia.horaFin
				}));
				this.facade.getEventoById(registro.idEvento).subscribe({
					next: (evento) => {
						this.eventoSeleccionado = evento;
						this.facade.getPromociones().subscribe({
							next: (promociones) => {
								this.promocionesDisponibles = promociones
									.filter(p => p.activo)
									.map(p => ({ value: p.idPromocion, label: p["Nombre"] }));
								this.mostrarModalDiasEvento = true;
							}
						});
					}
				});
			}
		});
	}

	onRecargarEvento(idEvento: number): void {
		this.onGestionarDiasDeEvento({ idEvento } as any);
	}

	confirmarEliminacionPromocion(): void {
		if (!this.promocionSeleccionada) return;
		this.facade.deletePromocion(this.promocionSeleccionada.idPromocion).subscribe({
			next: () => {
				this.mostrarModalEliminarPromocion = false;
				this.promocionSeleccionada = null;
				this.cargarPromociones();
			}
		});
	}

	cerrarModalEliminarPromocion(): void {
		this.mostrarModalEliminarPromocion = false;
		this.promocionSeleccionada = null;
	}

	private formatearFecha(fecha: string | undefined): string {
		if (!fecha) return '-';
		try {
			return new Date(fecha).toLocaleDateString('es-ES');
		} catch {
			return fecha;
		}
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

	// ==================== FILTROS ====================

	onFiltrosAplicados(filtros: AdminFiltros): void {
		this.filtrosActuales = filtros;
		this.onRecargar();
	}

	onFiltrosLimpiados(): void {
		this.filtrosActuales = null;
		this.onRecargar();
	}

	onRecargar(): void {
		if (this.tabActiva === 'promociones') {
			this.cargarPromociones();
		} else {
			this.cargarEventos();
		}
	}
}
