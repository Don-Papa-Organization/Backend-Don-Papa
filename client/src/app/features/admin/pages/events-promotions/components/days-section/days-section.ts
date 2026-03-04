import { Component, EventEmitter, Input, Output } from "@angular/core";
import { AccionTabla } from "../../../../../../shared/ui/ui-tabla/ui-tabla";
import { EventsPromotionsFacade } from "../../services/events-promotions.facade";
import { Evento } from "../../../../../../domain/events&Promotions/models/evento.model";

@Component({
    selector: "app-days-section",
    templateUrl: "./days-section.html",
    styleUrls: ["./days-section.scss"],
    standalone: false
})
export class DaysSectionComponent {
    @Input() mostrar = false;
    @Input() eventoSeleccionado: Evento | null = null;
    @Input() diasEvento: any[] = [];
    @Input() promocionesDisponibles: any[] = [];

    @Output() cerrar = new EventEmitter<void>();
    @Output() recargarEvento = new EventEmitter<number>();

    columnasDiasEvento = ["Fecha", "Hora Inicio", "Hora Fin", "Acciones"];
    columnasPromocionesDelDia = ["Nombre", "Descripción", "% Descuento", "Fecha Inicio", "Fecha Fin", "Acciones"];

    // Estados de modales internos
    mostrarModalAgregarDia = false;
    mostrarModalEditarDia = false;
    mostrarModalEliminarDia = false;
    diaEventoSeleccionado: any = null;

    mostrarModalPromocionesDelDia = false;
    mostrarModalAgregarPromocionAlDia = false;
    mostrarModalEliminarPromocionDelDia = false;
    promocionDelDiaSeleccionada: any = null;
    promocionesDelDia: any[] = [];
    diaEventoSeleccionadoParaPromociones: any = null;

    accionesDiasEvento: AccionTabla[] = [
        {
            urlIcono: "icons/editar.svg",
            accion: (registro: any) => this.onEditarDiaEvento(registro)
        },
        {
            urlIcono: "icons/promotion.svg",
            accion: (registro: any) => this.onGestionarPromocionesDelDia(registro)
        },
        {
            urlIcono: "icons/eliminar.svg",
            accion: (registro: any) => this.onEliminarDiaEvento(registro)
        }
    ];

    accionesPromocionesDelDia: AccionTabla[] = [
        {
            urlIcono: "icons/eliminar.svg",
            accion: (registro: any) => this.onEliminarPromocionDelDia(registro)
        }
    ];

    constructor(private facade: EventsPromotionsFacade) { }

    onCerrar(): void {
        this.cerrar.emit();
    }

    // --- Días de Evento ---
    abrirModalAgregarDia(): void {
        this.mostrarModalAgregarDia = true;
    }

    onDiaAgregado(dto: any): void {
        this.facade.createEventDay(dto).subscribe({
            next: () => {
                this.mostrarModalAgregarDia = false;
                if (this.eventoSeleccionado) {
                    this.recargarEvento.emit(this.eventoSeleccionado.idEvento);
                }
            },
            error: (error) => console.error("Error al agregar día al evento:", error)
        });
    }

    onEditarDiaEvento(registro: any): void {
        this.diaEventoSeleccionado = registro;
        this.mostrarModalEditarDia = true;
    }

    onDiaEventoActualizado(dto: any): void {
        if (!this.diaEventoSeleccionado) return;
        this.facade.updateEventDay(this.diaEventoSeleccionado.idEventoSemana, dto).subscribe({
            next: () => {
                this.mostrarModalEditarDia = false;
                this.diaEventoSeleccionado = null;
                if (this.eventoSeleccionado) {
                    this.recargarEvento.emit(this.eventoSeleccionado.idEvento);
                }
            },
            error: (error) => console.error("Error al actualizar día del evento:", error)
        });
    }

    onEliminarDiaEvento(registro: any): void {
        this.diaEventoSeleccionado = registro;
        this.mostrarModalEliminarDia = true;
    }

    confirmarEliminacionDiaEvento(): void {
        if (!this.diaEventoSeleccionado) return;
        this.facade.deleteEventDay(this.diaEventoSeleccionado.idEventoSemana).subscribe({
            next: () => {
                this.mostrarModalEliminarDia = false;
                this.diaEventoSeleccionado = null;
                if (this.eventoSeleccionado) {
                    this.recargarEvento.emit(this.eventoSeleccionado.idEvento);
                }
            },
            error: (error) => console.error("Error al eliminar día del evento:", error)
        });
    }

    // --- Promociones del Día ---
    onGestionarPromocionesDelDia(registro: any): void {
        this.diaEventoSeleccionadoParaPromociones = registro;
        this.cargarPromocionesDelDia(registro.idEventoSemana);
    }

    private cargarPromocionesDelDia(idEventoSemana: number): void {
        this.facade.getPromotionsByEventDay(idEventoSemana).subscribe({
            next: (respuesta: any[]) => {
                this.facade.getPromociones().subscribe({
                    next: (promociones: any[]) => {
                        this.promocionesDelDia = respuesta.map((item: any) => {
                            const promo = promociones.find(p => p.idPromocion === item.idPromocion);
                            return {
                                ...item,
                                'Nombre': promo?.['Nombre'] || `Promoción #${item.idPromocion}`,
                                'Descripción': promo?.['Descripción'] || '',
                                '% Descuento': promo?.['Tipo'] || '-',
                                'Fecha Inicio': promo?.['Fecha Inicio'] || '-',
                                'Fecha Fin': promo?.['Fecha Fin'] || '-'
                            };
                        });
                        this.mostrarModalPromocionesDelDia = true;
                    }
                });
            }
        });
    }

    onPromocionAgregadaAlDia(dto: any): void {
        this.facade.createPromotionEventDay(dto).subscribe({
            next: () => {
                this.mostrarModalAgregarPromocionAlDia = false;
                if (this.diaEventoSeleccionadoParaPromociones) {
                    this.cargarPromocionesDelDia(this.diaEventoSeleccionadoParaPromociones.idEventoSemana);
                }
            }
        });
    }

    onEliminarPromocionDelDia(registro: any): void {
        this.promocionDelDiaSeleccionada = registro;
        this.mostrarModalEliminarPromocionDelDia = true;
    }

    confirmarEliminacionPromocionDelDia(): void {
        if (!this.promocionDelDiaSeleccionada) return;
        this.facade.deletePromotionEventDay(this.promocionDelDiaSeleccionada.idPromocionEventoDia).subscribe({
            next: () => {
                this.mostrarModalEliminarPromocionDelDia = false;
                this.promocionDelDiaSeleccionada = null;
                if (this.diaEventoSeleccionadoParaPromociones) {
                    this.cargarPromocionesDelDia(this.diaEventoSeleccionadoParaPromociones.idEventoSemana);
                }
            }
        });
    }
}
