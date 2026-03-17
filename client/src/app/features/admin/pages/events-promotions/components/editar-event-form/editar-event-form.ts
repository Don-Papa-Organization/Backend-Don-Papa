import { Component, EventEmitter, Input, Output, OnChanges } from "@angular/core";
import { NgForm } from "@angular/forms";
import { UpdateEventRequestDto } from "../../../../../../domain/events&Promotions/dtos/request/update-event.request.dto";
import { Evento } from "../../../../../../domain/events&Promotions/models/evento.model";

@Component({
	selector: "app-editar-event-form",
	templateUrl: "./editar-event-form.html",
	styleUrls: ["./editar-event-form.scss"],
	standalone: false
})
export class EditarEventForm implements OnChanges {
	@Input() mostrar = false;
	@Input() eventoSeleccionado: Evento | null = null;
	@Output() cerrar = new EventEmitter<void>();
	@Output() eventoActualizado = new EventEmitter<UpdateEventRequestDto>();

	// Campos del formulario
	nombre = "";
	descripcion = "";
	formSubmitted = false;

	constructor() { }

	ngOnChanges(): void {
		if (this.eventoSeleccionado) {
			this.cargarDatos();
		}
	}

	private cargarDatos(): void {
		if (!this.eventoSeleccionado) return;

		this.nombre = this.eventoSeleccionado.nombre;
		this.descripcion = this.eventoSeleccionado.descripcion;
	}

	onCerrar(): void {
		this.formSubmitted = false;
		this.cerrar.emit();
	}

	onSubmit(): void {
		this.formSubmitted = true;
		if (!this.nombre || !this.descripcion || !this.eventoSeleccionado) return;

		const dto: UpdateEventRequestDto = {
			nombre: this.nombre,
			descripcion: this.descripcion
		};

		this.eventoActualizado.emit(dto);
	}
}
