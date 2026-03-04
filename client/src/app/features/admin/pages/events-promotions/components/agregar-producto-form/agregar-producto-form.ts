import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CreateProductPromoRequestDto } from "../../../../../../domain/events&Promotions/dtos/request/create-product-promo.request.dto";

@Component({
	selector: "app-agregar-producto-form",
	templateUrl: "./agregar-producto-form.html",
	standalone: false,
	styleUrls: ["./agregar-producto-form.scss"]
})
export class AgregarProductoForm {
	@Input() mostrar: boolean = false;
	@Input() productosOptions: any[] = [];
	@Input() promocionId: number | null = null;

	@Output() cerrar = new EventEmitter<void>();
	@Output() productoAgregado = new EventEmitter<CreateProductPromoRequestDto>();

	productoSeleccionadoId: number | null = null;
	cantidadMinima: number = 1;
	precioPromocional: number | null = null;
	porcentajeDescuento: number | null = null;

	onSubmit(): void {
		if (!this.productoSeleccionadoId || !this.promocionId) {
			console.error("Producto o promoción no seleccionados");
			return;
		}

		const dto: CreateProductPromoRequestDto = {
			idProducto: this.productoSeleccionadoId,
			idPromocion: this.promocionId,
			cantidadMinima: this.cantidadMinima
		};

		// Solo enviar uno de los dos campos según cual tenga valor
		if (this.precioPromocional !== null && this.precioPromocional > 0) {
			dto.precioPromocional = this.precioPromocional;
		} else if (this.porcentajeDescuento !== null && this.porcentajeDescuento > 0) {
			dto.porcentajeDescuento = this.porcentajeDescuento;
		}

		this.productoAgregado.emit(dto);
		this.limpiarFormulario();
	}

	limpiarFormulario(): void {
		this.productoSeleccionadoId = null;
		this.cantidadMinima = 1;
		this.precioPromocional = null;
		this.porcentajeDescuento = null;
	}

	onCerrar(): void {
		this.limpiarFormulario();
		this.cerrar.emit();
	}
}
