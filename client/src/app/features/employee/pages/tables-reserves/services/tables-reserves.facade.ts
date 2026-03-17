import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TablesReservesApi } from '../../../../../services/apis/tables&Reserves.api';
import { ApiResponse } from '../../../../../types/api-response.type';
import { Reserva } from '../../../../../domain/tables&Reserves/models/reserva.model';
import { Mesa, MesaEstado, MesaTipo } from '../../../../../domain/tables&Reserves/models/mesa.model';
import { DailyReservationsRequestDto } from '../../../../../domain/tables&Reserves/dtos/request/daily-reservations.request.dto';
import { DailyReservationsDataDto } from '../../../../../domain/tables&Reserves/dtos/response/daily-reservations.response.dto';
import { ListReservationsByStatusDataDto } from '../../../../../domain/tables&Reserves/dtos/response/list-reservations-by-status.response.dto';
import { UpdateMesaEstadoRequestDto } from '../../../../../domain/tables&Reserves/dtos/request/update-mesa-estado.request.dto';
import { ListMesasDataDto } from '../../../../../domain/tables&Reserves/dtos/response/list-mesas.response.dto';

export interface MesaPosViewModel {
  idMesa: number;
  nombreMesa: string;
  tipoNormalizado: 'salon' | 'barra' | 'vip' | 'varios' | 'otro';
  estadoRaw: MesaEstado;
  estadoVisual: 'Disponible' | 'Ocupada' | 'Otro';
}

export interface ReservaFloorPlan {
  idReserva: number;
  hora: string;
  cantidadPersonas: number;
}

@Injectable({
  providedIn: 'root'
})
export class TablesReservesFacade {
  constructor(private tablesReservesApi: TablesReservesApi) { }

  listTables(): Observable<ApiResponse<ListMesasDataDto>> {
    return this.tablesReservesApi.listTables();
  }

  getTablesForPos(): Observable<MesaPosViewModel[]> {
    return this.tablesReservesApi.listTables().pipe(
      map(response => {
        const mesas = response.data?.mesas ?? [];
        return mesas
          .map(mesa => this.mapMesaToPosViewModel(mesa))
          .sort((a, b) => a.idMesa - b.idMesa);
      })
    );
  }

  getDailyReservations(dto?: DailyReservationsRequestDto): Observable<ApiResponse<DailyReservationsDataDto>> {
    return this.tablesReservesApi.getDailyReservations(dto);
  }

  getDailyReservationsForPos(): Observable<Map<number, ReservaFloorPlan>> {
    const today = new Date();
    const fecha = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return this.tablesReservesApi.getDailyReservations({ fecha }).pipe(
      map(response => {
        const reservasPorMesa = new Map<number, ReservaFloorPlan>();
        const reservas = response.data?.reservas ?? [];
        for (const r of reservas) {
          const idMesa = Number(r.idMesa);
          if (Number.isFinite(idMesa) && idMesa > 0 && !reservasPorMesa.has(idMesa)) {
            reservasPorMesa.set(idMesa, {
              idReserva: r.idReserva,
              hora: r.hora ?? '',
              cantidadPersonas: r.cantidadPersonas ?? 0
            });
          }
        }
        return reservasPorMesa;
      })
    );
  }

  confirmReservation(idReserva: number): Observable<ApiResponse<Reserva>> {
    return this.tablesReservesApi.confirmReservation(idReserva);
  }

  listReservationsByStatus(estado?: string): Observable<ApiResponse<ListReservationsByStatusDataDto>> {
    return this.tablesReservesApi.listReservationsByStatus(estado);
  }

  updateTableStatus(idMesa: number, dto: UpdateMesaEstadoRequestDto): Observable<ApiResponse<Mesa>> {
    return this.tablesReservesApi.updateTableStatus(idMesa, dto);
  }

  private mapMesaToPosViewModel(mesa: Mesa): MesaPosViewModel {
    const tipo = String(mesa.tipo || '').toLowerCase();
    const estado = String(mesa.estado || '').toLowerCase();

    const tipoNormalizado: MesaPosViewModel['tipoNormalizado'] =
      tipo.includes('salon') ? 'salon'
      : tipo.includes('barra') ? 'barra'
      : tipo.includes('vip') ? 'vip'
      : tipo.includes('varios') ? 'varios'
      : 'otro';

    const estadoVisual: MesaPosViewModel['estadoVisual'] =
      estado === 'disponible' ? 'Disponible'
      : estado === 'ocupada' ? 'Ocupada'
      : 'Otro';

    return {
      idMesa: mesa.idMesa,
      nombreMesa: `Mesa ${mesa.numero}`,
      tipoNormalizado,
      estadoRaw: mesa.estado,
      estadoVisual
    };
  }
}
