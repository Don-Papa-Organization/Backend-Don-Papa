import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CreateEmployeeRequestDto } from '../../../../../../domain/users/dtos/request/create-employee.request.dto';

@Component({
  selector: 'app-agregar-employee-form',
  standalone: false,
  templateUrl: './agregar-employee-form.html',
  styleUrl: './agregar-employee-form.scss'
})
export class AgregarEmployeeForm {
  @Input() mostrar = false;
  @Input() showTextStyle = true;

  @Output() cerrar = new EventEmitter<void>();
  @Output() empleadoCreado = new EventEmitter<CreateEmployeeRequestDto>();

  formSubmitted = false;

  // Datos del formulario
  empleadoNuevo = {
    nombre: '',
    documento: '',
    correo: '',
    telefono: '',
    cargo: '',
    contrasena: '',
    confirmarContrasena: ''
  };

  /**
   * Maneja el guardado del formulario
   */
  onGuardar(): void {
    this.formSubmitted = true;
    const dto: CreateEmployeeRequestDto = {
      nombre: this.empleadoNuevo.nombre.trim(),
      documento: this.empleadoNuevo.documento.trim(),
      correo: this.empleadoNuevo.correo.trim(),
      telefono: this.empleadoNuevo.telefono.trim(),
      cargo: this.empleadoNuevo.cargo.trim(),
      contrasena: this.empleadoNuevo.contrasena
    };

    this.empleadoCreado.emit(dto);
    this.resetForm();
  }

  /**
   * Maneja el cierre del modal
   */
  onCerrar(): void {
    this.resetForm();
    this.cerrar.emit();
  }

  /**
   * Limpia el formulario
   */
  private resetForm(): void {
    this.formSubmitted = false;
    this.empleadoNuevo = {
      nombre: '',
      documento: '',
      correo: '',
      telefono: '',
      cargo: '',
      contrasena: '',
      confirmarContrasena: ''
    };
  }
}
