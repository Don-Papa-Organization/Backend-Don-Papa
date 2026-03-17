import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UpdateEmployeeRequestDto } from '../../../../../../domain/users/dtos/request/update-employee.request.dto';
import { EmployeeViewModel } from '../../services/users.facade';

@Component({
  selector: 'app-actualizar-employee-form',
  standalone: false,
  templateUrl: './actualizar-employee-form.html',
  styleUrl: './actualizar-employee-form.scss'
})
export class ActualizarEmployeeForm {
  @Input() mostrar = false;
  @Input() empleado: EmployeeViewModel | null = null;

  @Output() cerrar = new EventEmitter<void>();
  @Output() empleadoActualizado = new EventEmitter<UpdateEmployeeRequestDto>();

  formSubmitted = false;

  // Datos del formulario
  empleadoActual = {
    nombre: '',
    documento: '',
    correo: '',
    telefono: '',
    cargo: '',
    contrasena: '',
    confirmarContrasena: ''
  };

  ngOnChanges(): void {
    if (this.mostrar && this.empleado) {
      this.cargarDatos();
    }
  }

  /**
   * Carga los datos del empleado en el formulario
   */
  cargarDatos(): void {
    if (!this.empleado) return;
    
    this.empleadoActual = {
      nombre: this.empleado.nombre,
      documento: this.empleado.documento,
      correo: this.empleado.correo,
      telefono: this.empleado.telefono,
      cargo: this.empleado.cargo,
      contrasena: '',
      confirmarContrasena: ''
    };
  }

  /**
   * Maneja el guardado del formulario
   */
  onGuardar(): void {
    this.formSubmitted = true;
    const dto: UpdateEmployeeRequestDto = {
      nombre: this.empleadoActual.nombre.trim(),
      documento: this.empleadoActual.documento.trim(),
      correo: this.empleadoActual.correo.trim(),
      telefono: this.empleadoActual.telefono.trim(),
      cargo: this.empleadoActual.cargo.trim()
    };

    // Agregar contraseña solo si se proporciona
    if (this.empleadoActual.contrasena) {
      dto.contrasena = this.empleadoActual.contrasena;
    }

    this.empleadoActualizado.emit(dto);
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
    this.empleadoActual = {
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
