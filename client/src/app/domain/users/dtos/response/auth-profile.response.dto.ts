import { TipoUsuario } from "../../../../types/tipo.usuario";

export interface AuthProfileResponseDto {
  id: number;
  correo: string;
  tipoUsuario: TipoUsuario;
  activo: boolean;
  cliente?: {
    nombre?: string;
    telefono?: string;
    direccion?: string;
  };
  empleado?: {
    nombre?: string;
    telefono?: string;
    documento?: string;
    cargo?: string;
  };
}