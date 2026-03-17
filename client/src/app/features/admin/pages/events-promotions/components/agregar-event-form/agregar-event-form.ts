import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgForm } from "@angular/forms";
import { CreateEventRequestDto } from "../../../../../../domain/events&Promotions/dtos/request/create-event.request.dto";

@Component({
	selector: "app-agregar-event-form",
	templateUrl: "./agregar-event-form.html",
	styleUrls: ["./agregar-event-form.scss"],
	standalone: false
})
export class AgregarEventForm {
	@Input() mostrar = false;
	@Output() cerrar = new EventEmitter<void>();
	@Output() eventoCreado = new EventEmitter<CreateEventRequestDto>();

	// Campos del formulario
	nombre = "";
	descripcion = "";
	formSubmitted = false;

	constructor() { }

	onCerrar(): void {
		this.limpiarFormulario();
		this.cerrar.emit();
	}

	onSubmit(): void {
		this.formSubmitted = true;
		if (!this.nombre || !this.descripcion) return;

		const dto: CreateEventRequestDto = {
			nombre: this.nombre,
			descripcion: this.descripcion
		};

		this.eventoCreado.emit(dto);
		this.limpiarFormulario();
	}

	private limpiarFormulario(): void {
		this.nombre = "";
		this.descripcion = "";
		this.formSubmitted = false;
	}
}
