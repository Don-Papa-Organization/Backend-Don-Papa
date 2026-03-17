import { MesaTipo } from '../../../../types/mesa-tipo.type';

export interface UpdateMesaRequestDto {
  numero?: number;
  tipo?: MesaTipo;
  estado?: 'Disponible' | 'Reservada' | 'Ocupada' | 'Fuera de servicio';
}