/**
 * DTO para solicitudes de actualización de empleado
 * Todos los campos son opcionales para permitir actualizaciones parciales
 */
export interface UpdateEmployeeRequestDto {
  nombre?: string;
  documento?: string;
  correo?: string;
  telefono?: string;
  cargo?: string;
  tipoUsuario?: string; // 'cliente' | 'empleado' | 'administrador'
  contrasena?: string;
}
