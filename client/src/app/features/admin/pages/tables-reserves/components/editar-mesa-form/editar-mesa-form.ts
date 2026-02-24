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
  @Output() cerrar = new EventEmitter<void>();
  @Output() mesaActualizada = new EventEmitter<UpdateMesaRequestDto>();

  mesaEditada: { numero: number | null; tipo: MesaTipo | ''; estado: MesaEstado | '' } = {
    numero: null,
    tipo: '',
    estado: ''
  };

  tipoOptions = [
    { value: 'VIP', label: 'VIP' },
    { value: 'Regular', label: 'Regular' }
  ];

  estadoOptions = [
    { value: 'Disponible', label: 'Disponible' },
    { value: 'Reservada', label: 'Reservada' },
    { value: 'Ocupada', label: 'Ocupada' },
    { value: 'Fuera de servicio', label: 'Fuera de servicio' }
  ];

  tipoTouched = false;
  estadoTouched = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['registroSeleccionado'] && this.registroSeleccionado) {
      this.mesaEditada = {
        numero: this.registroSeleccionado.numero,
        tipo: this.registroSeleccionado.tipo,
        estado: this.registroSeleccionado.estado
      };
      this.tipoTouched = false;
      this.estadoTouched = false;
    }
  }

  onGuardar(): void {
    this.tipoTouched = true;
    this.estadoTouched = true;

    if (!this.mesaEditada.numero || !this.mesaEditada.tipo || !this.mesaEditada.estado) return;

    const dto: UpdateMesaRequestDto = {
      numero: Number(this.mesaEditada.numero),
      tipo: this.mesaEditada.tipo as 'VIP' | 'Regular',
      estado: this.mesaEditada.estado as any
    };

    this.mesaActualizada.emit(dto);
  }

  onCerrar(): void {
    this.cerrar.emit();
  }

  onTipoTouched(): void {
    this.tipoTouched = true;
  }

  onEstadoTouched(): void {
    this.estadoTouched = true;
  }
}
