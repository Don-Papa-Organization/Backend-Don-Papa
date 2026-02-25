import { Component, EventEmitter, Input, Output, OnChanges } from "@angular/core";
import { NgForm } from "@angular/forms";
import { UpdatePromotionRequestDto } from "../../../../../../domain/events&Promotions/dtos/request/update-promotion.request.dto";
import { Promocion, TipoPromocion } from "../../../../../../domain/events&Promotions/models/promocion.model";

interface TipoPromocionOption {
	value: TipoPromocion;
	label: string;
}

@Component({
	selector: "app-editar-promotion-form",
	templateUrl: "./editar-promotion-form.html",
	styleUrls: ["./editar-promotion-form.scss"],
	standalone: false
})
export class EditarPromotionForm implements OnChanges {
	@Input() mostrar = false;
	@Input() promocionSeleccionada: Promocion | null = null;
	@Output() cerrar = new EventEmitter<void>();
	@Output() promocionActualizada = new EventEmitter<UpdatePromotionRequestDto>();

	// Campos del formulario
	nombre = "";
	descripcion = "";
	fechaInicio = "";
	fechaFin = "";
	activo = true;
	tipoPromocionSeleccionado: TipoPromocion | null = null;

	// Opciones de tipo de promoción
	tiposPromocionOptions: TipoPromocionOption[] = [
		{ value: "porcentaje", label: "Porcentaje" },
		{ value: "precio_fijo", label: "Precio Fijo" }
	];

	constructor() { }

	ngOnChanges(): void {
		if (this.promocionSeleccionada) {
			this.cargarDatos();
		}
	}

	private cargarDatos(): void {
		if (!this.promocionSeleccionada) return;

		this.nombre = this.promocionSeleccionada.nombre;
		this.descripcion = this.promocionSeleccionada.descripcion;
		this.fechaInicio = this.formatDateForInput(this.promocionSeleccionada.fechaInicio);
		this.fechaFin = this.formatDateForInput(this.promocionSeleccionada.fechaFin);
		this.tipoPromocionSeleccionado = this.promocionSeleccionada.tipoPromocion;
		this.activo = this.promocionSeleccionada.activo;
	}

	private formatDateForInput(dateString: string): string {
		try {
			const date = new Date(dateString);
			return date.toISOString().split("T")[0];
		} catch {
			return "";
		}
	}

	onCerrar(): void {
		this.cerrar.emit();
	}

	onSubmit(): void {
		if (!this.promocionSeleccionada || !this.tipoPromocionSeleccionado) return;

		const dto: UpdatePromotionRequestDto = {
			nombre: this.nombre,
			descripcion: this.descripcion,
			fechaInicio: this.fechaInicio,
			fechaFin: this.fechaFin,
			tipoPromocion: this.tipoPromocionSeleccionado,
			activo: this.activo
		};

		this.promocionActualizada.emit(dto);
	}
}
