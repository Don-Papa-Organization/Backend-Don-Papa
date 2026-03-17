import { MesaTipo } from '../../../types/mesa-tipo.type';
export type { MesaTipo } from '../../../types/mesa-tipo.type';

export type MesaEstado = 'Disponible' | 'Reservada' | 'Ocupada' | 'Fuera de servicio';

export interface Mesa {
    idMesa: number;
    numero: number;
    tipo: MesaTipo;
    estado: MesaEstado;
}