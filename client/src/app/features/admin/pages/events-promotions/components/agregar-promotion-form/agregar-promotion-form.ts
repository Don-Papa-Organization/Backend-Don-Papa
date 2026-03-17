import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgForm } from "@angular/forms";
import { CreatePromotionRequestDto } from "../../../../../../domain/events&Promotions/dtos/request/create-promotion.request.dto";
import { TipoPromocion } from "../../../../../../domain/events&Promotions/models/promocion.model";

interface TipoPromocionOption {
	value: TipoPromocion;
	label: string;
}

@Component({
	selector: "app-agregar-promotion-form",
	templateUrl: "./agregar-promotion-form.html",
	styleUrls: ["./agregar-promotion-form.scss"],
	standalone: false
})
export class AgregarPromotionForm {
	@Input() mostrar = false;
	@Output() cerrar = new EventEmitter<void>();
	@Output() promocionCreada = new EventEmitter<CreatePromotionRequestDto>();

	// Campos del formulario
	nombre = "";
	descripcion = "";
	fechaInicio = "";
	fechaFin = "";
	tipoPromocionSeleccionado: TipoPromocion | null = null;
	formSubmitted = false;

	// Opciones de tipo de promoción
	tiposPromocionOptions: TipoPromocionOption[] = [
		{ value: "porcentaje", label: "Porcentaje" },
		{ value: "precio_fijo", label: "Precio Fijo" }
	];

	constructor() { }

	onCerrar(): void {
		this.limpiarFormulario();
		this.cerrar.emit();
	}

	onSubmit(): void {
		this.formSubmitted = true;
		if (!this.nombre || !this.descripcion || !this.fechaInicio || !this.fechaFin || !this.tipoPromocionSeleccionado) return;

		const dto: CreatePromotionRequestDto = {
			nombre: this.nombre,
			descripcion: this.descripcion,
			fechaInicio: this.fechaInicio,
			fechaFin: this.fechaFin,
			tipoPromocion: this.tipoPromocionSeleccionado
		};

		this.promocionCreada.emit(dto);
		this.limpiarFormulario();
	}

	private limpiarFormulario(): void {
		this.nombre = "";
		this.descripcion = "";
		this.fechaInicio = "";
		this.fechaFin = "";
		this.tipoPromocionSeleccionado = null;
		this.formSubmitted = false;
	}
}
