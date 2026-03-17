import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UpdateMesaRequestDto } from '../../../../../../domain/tables&Reserves/dtos/request/update-mesa.request.dto';
import { MesaEstado, MesaTipo } from '../../../../../../domain/tables&Reserves/models/mesa.model';
import { MesaViewModel } from '../../services/tables-reserves.facade';

@Component({
  selector: 'app-editar-mesa-form',
  standalone: false,
  templateUrl: './editar-mesa-form.html',
  styleUrl: './editar-mesa-form.scss'
})
export class EditarMesaForm implements OnChanges {
  @Input() mostrar = false;
  @Input() registroSeleccionado: MesaViewModel | null = null;
  @Input() tipoOptions: Array<{ value: MesaTipo; label: string }> = [
    { value: 'VIP', label: 'VIP' },
    { value: 'Barra', label: 'Barra' },
    { value: 'Salon', label: 'Salon' },
    { value: 'Varios', label: 'Varios' },
  ];
  @Output() cerrar = new EventEmitter<void>();
  @Output() mesaActualizada = new EventEmitter<UpdateMesaRequestDto>();

  mesaEditada: { numero: number | null; tipo: MesaTipo | ''; estado: MesaEstado | '' } = {
    numero: null,
    tipo: '',
    estado: ''
  };

  estadoOptions = [
    { value: 'Disponible', label: 'Disponible' },
    { value: 'Reservada', label: 'Reservada' },
    { value: 'Ocupada', label: 'Ocupada' },
    { value: 'Fuera de servicio', label: 'Fuera de servicio' }
  ];

  formSubmitted = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['registroSeleccionado'] && this.registroSeleccionado) {
      this.mesaEditada = {
        numero: this.registroSeleccionado.numero,
        tipo: this.registroSeleccionado.tipo,
        estado: this.registroSeleccionado.estado
      };
      this.formSubmitted = false;
    }
  }

  onGuardar(): void {
    this.formSubmitted = true;

    if (!this.mesaEditada.numero || !this.mesaEditada.tipo || !this.mesaEditada.estado) return;

    const dto: UpdateMesaRequestDto = {
      numero: Number(this.mesaEditada.numero),
      tipo: this.mesaEditada.tipo as MesaTipo,
      estado: this.mesaEditada.estado as any
    };

    this.mesaActualizada.emit(dto);
  }

  onCerrar(): void {
    this.cerrar.emit();
  }
}
