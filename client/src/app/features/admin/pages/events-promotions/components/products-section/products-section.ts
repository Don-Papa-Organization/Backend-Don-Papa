import { Component, EventEmitter, Input, Output } from "@angular/core";
import { AccionTabla } from "../../../../../../shared/ui/ui-tabla/ui-tabla";
import { EventsPromotionsFacade } from "../../services/events-promotions.facade";
import { Promocion } from "../../../../../../domain/events&Promotions/models/promocion.model";

@Component({
    selector: "app-products-section",
    templateUrl: "./products-section.html",
    styleUrls: ["./products-section.scss"],
    standalone: false
})
export class ProductsSectionComponent {
    @Input() mostrar = false;
    @Input() promocionSeleccionada: Promocion | null = null;
    @Input() productosPromocion: any[] = [];
    @Input() productosDisponibles: any[] = [];

    @Output() cerrar = new EventEmitter<void>();
    @Output() recargarPromocion = new EventEmitter<number>();

    columnasProductosPromocion = ["Nombre", "Precio", "Cant. Mínima", "Precio Promo", "% Descuento", "Acciones"];

    // Estados de modales internos
    mostrarModalAgregarProducto = false;
    mostrarModalEditarProductoPromocion = false;
    mostrarModalEliminarProductoPromocion = false;
    productoPromocionSeleccionado: any = null;

    accionesProductosPromocion: AccionTabla[] = [
        {
            urlIcono: "icons/editar.svg",
            accion: (registro: any) => this.onEditarProductoPromocion(registro)
        },
        {
            urlIcono: "icons/eliminar.svg",
            accion: (registro: any) => this.onEliminarProductoPromocion(registro)
        }
    ];

    constructor(private facade: EventsPromotionsFacade) { }

    onCerrar(): void {
        this.cerrar.emit();
    }

    abrirModalAgregarProducto(): void {
        this.mostrarModalAgregarProducto = true;
    }

    onProductoAgregado(dto: any): void {
        this.facade.createProductPromotion(dto).subscribe({
            next: () => {
                this.mostrarModalAgregarProducto = false;
                if (this.promocionSeleccionada) {
                    this.recargarPromocion.emit(this.promocionSeleccionada.idPromocion);
                }
            },
            error: (error: any) => console.error("Error al agregar producto a promoción:", error)
        });
    }

    onEditarProductoPromocion(registro: any): void {
        this.productoPromocionSeleccionado = registro;
        this.mostrarModalEditarProductoPromocion = true;
    }

    onProductoPromocionActualizado(dto: any): void {
        if (!this.productoPromocionSeleccionado) return;
        this.facade.updateProductPromotion(this.productoPromocionSeleccionado.idProductoPromocion, dto).subscribe({
            next: () => {
                this.mostrarModalEditarProductoPromocion = false;
                this.productoPromocionSeleccionado = null;
                if (this.promocionSeleccionada) {
                    this.recargarPromocion.emit(this.promocionSeleccionada.idPromocion);
                }
            },
            error: (error: any) => console.error("Error al actualizar producto de promoción:", error)
        });
    }

    onEliminarProductoPromocion(registro: any): void {
        this.productoPromocionSeleccionado = registro;
        this.mostrarModalEliminarProductoPromocion = true;
    }

    confirmarEliminacionProductoPromocion(): void {
        if (!this.productoPromocionSeleccionado) return;
        this.facade.deleteProductPromotion(this.productoPromocionSeleccionado.idProductoPromocion).subscribe({
            next: () => {
                this.mostrarModalEliminarProductoPromocion = false;
                this.productoPromocionSeleccionado = null;
                if (this.promocionSeleccionada) {
                    this.recargarPromocion.emit(this.promocionSeleccionada.idPromocion);
                }
            },
            error: (error) => console.error("Error al eliminar producto de promoción:", error)
        });
    }
}
