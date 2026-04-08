export interface ReserveTableRequestDto {
  idMesa: number;
  fechaReserva: string;
  cantidadPersonas: number;
  idCliente?: number;
}