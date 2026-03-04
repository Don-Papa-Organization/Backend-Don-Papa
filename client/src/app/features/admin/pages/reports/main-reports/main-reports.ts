import { Component, OnInit } from "@angular/core";
import { ReportsFacade } from "../services/reports.facade";
import { TabItem } from "../../../../../shared/ui/ui-tabs/ui-tabs";
import { AccionTabla } from "../../../../../shared/ui/ui-tabla/ui-tabla";
import { AdminFiltros } from "../../../../../shared/ui/ui-admin-filter-panel/ui-admin-filter-panel";

interface BitacoraViewModel {
	"ID": number;
	"Empleado": string;
	"Descripción": string;
	"Fecha": string;
	"Tipo": string;
	"Acciones"?: string;
	// Propiedades adicionales para acceso
	idBitacora?: number;
	idEmpleado?: number;
}

interface VentaViewModel {
	"ID": number;
	"Pedido": string;
	"Monto": string;
	"Fecha": string;
	"Cliente": string;
	"Estado": string;
	"Acciones"?: string;
	// Propiedades adicionales para acceso
	idPedido?: number;
}

@Component({
	selector: "app-main-reports",
	templateUrl: "./main-reports.html",
	standalone: false,
	styleUrls: ["./main-reports.scss"]
})
export class MainReports implements OnInit {
	// === TABS ===
	tabs: TabItem[] = [
		{ id: "bitacora", label: "Bitácora de Incidencias" },
		{ id: "ventas", label: "Reporte de Ventas" }
	];
	tabActiva: string = "bitacora";

	// === INDICADORES DE CARGA ===
	cargandoBitacora = false;
	cargandoVentas = false;

	// === DATOS BITÁCORA ===
	bitacoraItems: BitacoraViewModel[] = [];
	columnasBitacora = ["ID", "Empleado", "Descripción", "Fecha", "Tipo", "Acciones"];

	// === DATOS VENTAS ===
	ventasItems: VentaViewModel[] = [];
	columnasVentas = ["ID", "Pedido", "Monto", "Fecha", "Cliente", "Estado", "Acciones"];

	// === FILTROS ===
	filtrosActuales: AdminFiltros | null = null;

	// === ESTADOS DE MODALES ===
	mostrarModalDetalleBitacora = false;
	mostrarModalDetalleVenta = false;
	registroSeleccionado: any = null;

	// === ACCIONES DE TABLA ===
	accionesBitacora: AccionTabla[] = [
		{
			urlIcono: "icons/eye.svg",
			accion: (registro: BitacoraViewModel) => this.onVerDetalleBitacora(registro)
		}
	];

	accionesVentas: AccionTabla[] = [
		{
			urlIcono: "icons/eye.svg",
			accion: (registro: VentaViewModel) => this.onVerDetalleVenta(registro)
		}
	];

	constructor(private facade: ReportsFacade) {}

	ngOnInit(): void {
		this.cargarReportes();
	}

	// ==================== TABS ====================
	cambiarTab(tabId: string): void {
		this.tabActiva = tabId;
	}

	// ==================== CARGA GENERAL ====================
	cargarReportes(): void {
		this.cargarBitacora();
		this.cargarVentas();
	}

	// ==================== FILTROS ====================
	onFiltrosAplicados(filtros: AdminFiltros): void {
		this.filtrosActuales = filtros;
		this.aplicarFiltros();
	}

	onFiltrosLimpiados(): void {
		this.filtrosActuales = null;
		this.cargarReportes();
	}

	// ==================== BITÁCORA ====================
	cargarBitacora(): void {
		this.cargandoBitacora = true;
		const filtros: any = {};

		if (this.filtrosActuales) {
			// Buscar por ID de empleado en el campo de búsqueda
			if (this.filtrosActuales.busqueda) {
				const idEmpleado = parseInt(this.filtrosActuales.busqueda);
				if (!isNaN(idEmpleado)) {
					filtros.idEmpleado = idEmpleado;
				}
			}
			
			// Filtros de fecha
			if (this.filtrosActuales.fechaInicio) {
				filtros.fechaInicio = this.filtrosActuales.fechaInicio;
			}
			if (this.filtrosActuales.fechaFin) {
				filtros.fechaFin = this.filtrosActuales.fechaFin;
			}
		}

		this.facade.searchBitacora(filtros).subscribe({
			next: (data: any) => {
				console.log("Bitácora cargada:", data);
				this.bitacoraItems = this.mapearBitacora(data.incidentes || []);
				this.cargandoBitacora = false;
			},
			error: (error) => {
				console.error("Error al cargar bitácora:", error);
				this.cargandoBitacora = false;
			}
		});
	}

	onVerDetalleBitacora(registro: BitacoraViewModel): void {
		this.registroSeleccionado = registro;
		this.mostrarModalDetalleBitacora = true;
	}

	cerrarModalDetalleBitacora(): void {
		this.mostrarModalDetalleBitacora = false;
		this.registroSeleccionado = null;
	}

	// ==================== VENTAS ====================
	cargarVentas(): void {
		this.cargandoVentas = true;
		const filtros: any = {};

		if (this.filtrosActuales) {
			if (this.filtrosActuales.fechaInicio) {
				filtros.fechaInicio = this.filtrosActuales.fechaInicio;
			}
			if (this.filtrosActuales.fechaFin) {
				filtros.fechaFin = this.filtrosActuales.fechaFin;
			}
		}

		this.facade.getSalesHistory(filtros).subscribe({
			next: (data: any) => {
				console.log("Historial de ventas cargado:", data);
				this.ventasItems = this.mapearVentas(data.ventas || []);
				this.cargandoVentas = false;
			},
			error: (error) => {
				console.error("Error al cargar ventas:", error);
				this.cargandoVentas = false;
			}
		});
	}

	onVerDetalleVenta(registro: VentaViewModel): void {
		this.registroSeleccionado = registro;
		this.mostrarModalDetalleVenta = true;

		// Cargar detalles de la venta
		if (registro.idPedido) {
			this.facade.getSaleDetail(registro.idPedido).subscribe({
				next: (detalle: any) => {
					this.registroSeleccionado = { ...registro, ...detalle };
					console.log("Detalle de venta:", this.registroSeleccionado);
				},
				error: (error) => console.error("Error al cargar detalle de venta:", error)
			});
		}
	}

	cerrarModalDetalleVenta(): void {
		this.mostrarModalDetalleVenta = false;
		this.registroSeleccionado = null;
	}

	// ==================== APLICAR FILTROS ====================
	aplicarFiltros(): void {
		this.cargarBitacora();
		this.cargarVentas();
	}

	// ==================== MAPEOS ====================
	private mapearBitacora(items: any[]): BitacoraViewModel[] {
		return items.map((item: any) => ({
			"ID": item.idBitacora || item.id,
			"Empleado": item.empleado?.nombre || item.empleadoNombre || "-",
			"Descripción": item.descripcion || item.detalle || "-",
			"Fecha": this.formatearFecha(item.fecha),
			"Tipo": item.tipo || "Incidente",
			idBitacora: item.idBitacora || item.id,
			idEmpleado: item.idEmpleado
		}));
	}

	private mapearVentas(items: any[]): VentaViewModel[] {
		return items.map((item: any) => ({
			"ID": item.idPedido || item.id,
			"Pedido": `#${item.idPedido || item.id}`,
			"Monto": `$${item.monto || item.total || 0}`,
			"Fecha": this.formatearFecha(item.fecha),
			"Cliente": item.cliente?.nombre || item.clienteNombre || "-",
			"Estado": item.estado || "Completado",
			idPedido: item.idPedido || item.id
		}));
	}

	private formatearFecha(fecha: string | undefined): string {
		if (!fecha) return "-";
		try {
			return new Date(fecha).toLocaleDateString("es-ES");
		} catch {
			return fecha || "-";
		}
	}
}
