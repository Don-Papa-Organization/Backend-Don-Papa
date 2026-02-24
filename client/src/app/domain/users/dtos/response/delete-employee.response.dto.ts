import { ApiResponseDto } from "../../../../types/api-response.dto";

export interface DeleteEmployeeResponseData {
  empleadoId: number;
}

export type DeleteEmployeeResponseDto = ApiResponseDto<DeleteEmployeeResponseData>;
