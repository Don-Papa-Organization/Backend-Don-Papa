import { Component, Input, Output, EventEmitter, OnChanges } from "@angular/core";
import { UpdateProductPromoRequestDto } from "../../../../../../domain/events&Promotions/dtos/request/update-product-promo.request.dto";

@Component({
	selector: "app-editar-producto-form",
	templateUrl: "./editar-producto-form.html",
	standalone: false,
	styleUrls: ["./editar-producto-form.scss"]
})
export class EditarProductoForm implements OnChanges {
	@Input() mostrar: boolean = false;
	@Input() productoPromocion: any = null;

	@Output() cerrar = new EventEmitter<void>();
	@Output() productoActualizado = new EventEmitter<UpdateProductPromoRequestDto>();

	cantidadMinima: number = 1;
	precioPromocional: number | null = null;
	porcentajeDescuento: number | null = null;
	formSubmitted = false;

	ngOnChanges(): void {
		if (this.productoPromocion) {
			this.cantidadMinima = this.productoPromocion.cantidadMinima || 1;
			this.precioPromocional = this.productoPromocion.precioPromocional || null;
			this.porcentajeDescuento = this.productoPromocion.porcentajeDescuento || null;
		}
	}

	onSubmit(): void {
		this.formSubmitted = true;
		const dto: UpdateProductPromoRequestDto = {
			cantidadMinima: this.cantidadMinima
		};

		// Solo enviar uno de los dos campos según cual tenga valor
		if (this.precioPromocional !== null && this.precioPromocional > 0) {
			dto.precioPromocional = this.precioPromocional;
		} else if (this.porcentajeDescuento !== null && this.porcentajeDescuento > 0) {
			dto.porcentajeDescuento = this.porcentajeDescuento;
		}

		this.productoActualizado.emit(dto);
	}

	onCerrar(): void {
		this.formSubmitted = false;
		this.cerrar.emit();
	}
}
