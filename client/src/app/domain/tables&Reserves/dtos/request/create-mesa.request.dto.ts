import { MesaTipo } from '../../../../types/mesa-tipo.type';

export interface CreateMesaRequestDto {
  numero: number;
  tipo: MesaTipo;
}