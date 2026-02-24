import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TablesReservesApi } from '../../../../../services/apis/tables&Reserves.api';
import { CreateMesaRequestDto } from '../../../../../domain/tables&Reserves/dtos/request/create-mesa.request.dto';
import { UpdateMesaRequestDto } from '../../../../../domain/tables&Reserves/dtos/request/update-mesa.request.dto';
import { ListMesasDataDto } from '../../../../../domain/tables&Reserves/dtos/response/list-mesas.response.dto';
import { ListReservationsByStatusDataDto, ReservationStatusListItemDto } from '../../../../../domain/tables&Reserves/dtos/response/list-reservations-by-status.response.dto';
import { ApiResponse } from '../../../../../types/api-response.type';
import { Mesa, MesaEstado, MesaTipo } from '../../../../../domain/tables&Reserves/models/mesa.model';
import { Reserva } from '../../../../../domain/tables&Reserves/models/reserva.model';

export interface MesaViewModel {
  idMesa: number;
  numero: number;
  tipo: MesaTipo;
  estado: MesaEstado;
}

export interface ReservationViewModel {
  idReserva: number;
  fecha: string;
  hora: string;
  numeroMesa: number | string;
  tipoMesa: string;
  cantidadPersonas: number;
  estado: string;
  idCliente: number;
}

@Injectable({
  providedIn: 'root'
})
export class TablesReservesFacade {
  constructor(private tablesReservesApi: TablesReservesApi) {}

  getTables(): Observable<MesaViewModel[]> {
    return this.tablesReservesApi.listTables().pipe(
      map(response => this.mapMesasToViewModels(response.data))
    );
  }

  getReservationsByStatus(estado?: string): Observable<ReservationViewModel[]> {
    return this.tablesReservesApi.listReservationsByStatus(estado).pipe(
      map(response => this.mapReservationsToViewModels(response.data))
    );
  }

  createTable(dto: CreateMesaRequestDto): Observable<ApiResponse<Mesa>> {
    return this.tablesReservesApi.createTable(dto);
  }

  updateTable(idMesa: number, dto: UpdateMesaRequestDto): Observable<ApiResponse<Mesa>> {
    return this.tablesReservesApi.updateTable(idMesa, dto);
  }

  deleteTable(idMesa: number): Observable<ApiResponse<null>> {
    return this.tablesReservesApi.deleteTable(idMesa);
  }

  cancelReservationByStaff(idReserva: number): Observable<ApiResponse<Reserva>> {
    return this.tablesReservesApi.cancelReservationByStaff(idReserva);
  }

  private mapMesasToViewModels(data?: ListMesasDataDto | null): MesaViewModel[] {
    const mesas = data?.mesas ?? [];
    return mesas
      .map((mesa) => ({
        idMesa: mesa.idMesa,
        numero: mesa.numero,
        tipo: mesa.tipo,
        estado: mesa.estado
      }))
      .sort((a, b) => a.idMesa - b.idMesa);
  }

  private mapReservationsToViewModels(data?: ListReservationsByStatusDataDto | null): ReservationViewModel[] {
    const reservas = data?.reservas ?? [];
    return reservas
      .map((reserva) => this.mapReservationToViewModel(reserva))
      .sort((a, b) => a.idReserva - b.idReserva);
  }

  private mapReservationToViewModel(reserva: ReservationStatusListItemDto): ReservationViewModel {
    const fecha = reserva.fecha ?? reserva.fechaReserva ?? 'N/A';
    const hora = reserva.hora ?? 'N/A';
    const numeroMesa = reserva.numeroMesa ?? reserva.mesa?.numero ?? reserva.idMesa ?? 'N/A';
    const tipoMesa = reserva.tipoMesa ?? reserva.mesa?.tipo ?? 'N/A';

    return {
      idReserva: reserva.idReserva,
      fecha,
      hora,
      numeroMesa,
      tipoMesa,
      cantidadPersonas: reserva.cantidadPersonas,
      estado: reserva.estado,
      idCliente: reserva.idCliente
    };
  }
}
