import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CreateMesaRequestDto } from '../../../../../../domain/tables&Reserves/dtos/request/create-mesa.request.dto';

@Component({
  selector: 'app-agregar-mesa-form',
  standalone: false,
  templateUrl: './agregar-mesa-form.html',
  styleUrl: './agregar-mesa-form.scss'
})
export class AgregarMesaForm {
  @Input() mostrar = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() mesaCreada = new EventEmitter<CreateMesaRequestDto>();

  mesaNueva: { numero: number | null; tipo: 'VIP' | 'Regular' | '' } = {
    numero: null,
    tipo: ''
  };

  tipoOptions = [
    { value: 'VIP', label: 'VIP' },
    { value: 'Regular', label: 'Regular' }
  ];

  tipoTouched = false;

  onGuardar(): void {
    this.tipoTouched = true;

    if (!this.mesaNueva.numero || !this.mesaNueva.tipo) return;

    const dto: CreateMesaRequestDto = {
      numero: Number(this.mesaNueva.numero),
      tipo: this.mesaNueva.tipo as 'VIP' | 'Regular'
    };

    this.mesaCreada.emit(dto);
    this.resetForm();
  }

  onCerrar(): void {
    this.resetForm();
    this.cerrar.emit();
  }

  onTipoTouched(): void {
    this.tipoTouched = true;
  }

  private resetForm(): void {
    this.mesaNueva = {
      numero: null,
      tipo: ''
    };
    this.tipoTouched = false;
  }
}
