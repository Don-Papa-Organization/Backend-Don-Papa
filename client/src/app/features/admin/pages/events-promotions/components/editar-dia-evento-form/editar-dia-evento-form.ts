import { Component, Input, Output, EventEmitter, OnChanges } from "@angular/core";
import { UpdateEventDayRequestDto } from "../../../../../../domain/events&Promotions/dtos/request/update-event-day.request.dto";

@Component({
	selector: "app-editar-dia-evento-form",
	templateUrl: "./editar-dia-evento-form.html",
	standalone: false,
	styleUrls: ["./editar-dia-evento-form.scss"]
})
export class EditarDiaEventoForm implements OnChanges {
	@Input() mostrar: boolean = false;
	@Input() diaEvento: any = null;

	@Output() cerrar = new EventEmitter<void>();
	@Output() diaActualizado = new EventEmitter<UpdateEventDayRequestDto>();

	fecha: string = "";
	horaInicio: string = "09:00";
	horaFin: string = "18:00";
	formSubmitted = false;

	ngOnChanges(): void {
		if (this.diaEvento) {
			this.fecha = this.diaEvento.fecha || "";
			this.horaInicio = this.diaEvento.horaInicio || "09:00";
			this.horaFin = this.diaEvento.horaFin || "18:00";
		}
	}

	onSubmit(): void {
		this.formSubmitted = true;
		if (!this.fecha) {
			console.error("La fecha es requerida");
			return;
		}

		const dto: UpdateEventDayRequestDto = {
			fecha: this.fecha,
			horaInicio: this.horaInicio,
			horaFin: this.horaFin
		};

		this.diaActualizado.emit(dto);
	}

	onCerrar(): void {
		this.formSubmitted = false;
		this.cerrar.emit();
	}
}
