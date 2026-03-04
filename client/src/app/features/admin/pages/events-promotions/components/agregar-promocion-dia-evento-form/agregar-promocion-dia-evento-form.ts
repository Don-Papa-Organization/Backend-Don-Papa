import { Component, Input, Output, EventEmitter, OnChanges } from "@angular/core";
import { CreatePromotionEventDayRequestDto } from "../../../../../../domain/events&Promotions/dtos/request/create-promotion-event-day.request.dto";

@Component({
	selector: "app-agregar-promocion-dia-evento-form",
	templateUrl: "./agregar-promocion-dia-evento-form.html",
	standalone: false,
	styleUrls: ["./agregar-promocion-dia-evento-form.scss"]
})
export class AgregarPromocionDiaEventoForm implements OnChanges {
	@Input() mostrar: boolean = false;
	@Input() promocionesOptions: any[] = [];
	@Input() diaEventoId: number | null = null;

	@Output() cerrar = new EventEmitter<void>();
	@Output() promocionAgregada = new EventEmitter<CreatePromotionEventDayRequestDto>();

	promocionSeleccionadaId: any = null;

	ngOnChanges(): void {
		console.log('AgregarPromocionDiaEventoForm recibió:', { 
			mostrar: this.mostrar, 
			diaEventoId: this.diaEventoId,
			promocionesOptions: this.promocionesOptions,
			promocionSeleccionadaId: this.promocionSeleccionadaId
		});
	}

	onSubmit(): void {
		console.log('onSubmit - Estado actual:', { 
			promocionSeleccionadaId: this.promocionSeleccionadaId, 
			diaEventoId: this.diaEventoId,
			tipo_promocion: typeof this.promocionSeleccionadaId
		});

		// El combobox puede retornar el objeto completo o solo el value
		let idPromocion = this.promocionSeleccionadaId;
		if (idPromocion && typeof idPromocion === 'object' && 'value' in idPromocion) {
			idPromocion = idPromocion.value;
		}

		console.log('idPromocion extraído:', idPromocion);

		if (!idPromocion || !this.diaEventoId) {
			console.error("Promoción o día de evento no seleccionados", {
				idPromocion,
				diaEventoId: this.diaEventoId
			});
			return;
		}

		const dto: CreatePromotionEventDayRequestDto = {
			idPromocion: idPromocion,
			idEventoDiaSemana: this.diaEventoId
		};

		console.log('Emitiendo promocionAgregada con dto:', dto);
		this.promocionAgregada.emit(dto);
		this.limpiarFormulario();
	}

	limpiarFormulario(): void {
		this.promocionSeleccionadaId = null;
	}

	onCerrar(): void {
		this.limpiarFormulario();
		this.cerrar.emit();
	}
}

