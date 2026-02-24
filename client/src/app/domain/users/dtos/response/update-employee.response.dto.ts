import { ApiResponseDto } from "../../../../types/api-response.dto";
import { Empleado } from "../../models/empleado.model";

export interface UpdateEmployeeResponseData {
  id: number;
  nombre: string;
  documento: string;
  telefono: string;
  cargo: string;
  usuario: {
    correo: string;
    activo: boolean;
  };
}

export type UpdateEmployeeResponseDto = ApiResponseDto<UpdateEmployeeResponseData>;
