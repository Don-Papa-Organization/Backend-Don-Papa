import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CreateMesaRequestDto } from '../../../../../../domain/tables&Reserves/dtos/request/create-mesa.request.dto';
import { MesaTipo } from '../../../../../../types/mesa-tipo.type';

@Component({
  selector: 'app-agregar-mesa-form',
  standalone: false,
  templateUrl: './agregar-mesa-form.html',
  styleUrl: './agregar-mesa-form.scss'
})
export class AgregarMesaForm {
  @Input() mostrar = false;
  @Input() tipoOptions: Array<{ value: MesaTipo; label: string }> = [
    { value: 'VIP', label: 'VIP' },
    { value: 'Barra', label: 'Barra' },
    { value: 'Salon', label: 'Salon' },
    { value: 'Varios', label: 'Varios' },
  ];
  @Output() cerrar = new EventEmitter<void>();
  @Output() mesaCreada = new EventEmitter<CreateMesaRequestDto>();

  mesaNueva: { numero: number | null; tipo: MesaTipo | '' } = {
    numero: null,
    tipo: ''
  };

  formSubmitted = false;

  onGuardar(): void {
    this.formSubmitted = true;

    if (!this.mesaNueva.numero || !this.mesaNueva.tipo) return;

    const dto: CreateMesaRequestDto = {
      numero: Number(this.mesaNueva.numero),
      tipo: this.mesaNueva.tipo as MesaTipo
    };

    this.mesaCreada.emit(dto);
    this.resetForm();
  }

  onCerrar(): void {
    this.resetForm();
    this.cerrar.emit();
  }

  private resetForm(): void {
    this.mesaNueva = {
      numero: null,
      tipo: ''
    };
    this.formSubmitted = false;
  }
}
