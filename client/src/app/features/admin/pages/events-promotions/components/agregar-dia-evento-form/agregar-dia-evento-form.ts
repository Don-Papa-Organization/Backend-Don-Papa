import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CreateEventDayRequestDto } from "../../../../../../domain/events&Promotions/dtos/request/create-event-day.request.dto";

@Component({
	selector: "app-agregar-dia-evento-form",
	templateUrl: "./agregar-dia-evento-form.html",
	standalone: false,
	styleUrls: ["./agregar-dia-evento-form.scss"]
})
export class AgregarDiaEventoForm {
	@Input() mostrar: boolean = false;
	@Input() eventoId: number | null = null;

	@Output() cerrar = new EventEmitter<void>();
	@Output() diaAgregado = new EventEmitter<CreateEventDayRequestDto>();

	fecha: string = "";
	horaInicio: string = "09:00";
	horaFin: string = "18:00";
	formSubmitted = false;

	onSubmit(): void {
		this.formSubmitted = true;
		if (!this.fecha || !this.eventoId) {
			console.error("Fecha o evento no configurados");
			return;
		}

		const dto: CreateEventDayRequestDto = {
			idEvento: this.eventoId,
			fecha: this.fecha,
			horaInicio: this.horaInicio,
			horaFin: this.horaFin
		};

		this.diaAgregado.emit(dto);
		this.limpiarFormulario();
	}

	limpiarFormulario(): void {
		this.fecha = "";
		this.horaInicio = "09:00";
		this.horaFin = "18:00";
		this.formSubmitted = false;
	}

	onCerrar(): void {
		this.limpiarFormulario();
		this.cerrar.emit();
	}
}
