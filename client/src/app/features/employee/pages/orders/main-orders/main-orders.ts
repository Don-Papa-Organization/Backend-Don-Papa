import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { MesaPosViewModel, ReservaFloorPlan, TablesReservesFacade } from '../../tables-reserves/services/tables-reserves.facade';
import { OrdersFacade } from '../services/orders.facade';
import { Pedido } from '../../../../../domain/orders/models/pedido.model';
import { PosPreferencesService } from '../services/pos-preferences.service';

export interface MesaEnriquecida extends MesaPosViewModel {
  fechaPedido: string | null;
  tiempoOcupada: string;
  reservaHoy: ReservaFloorPlan | null;
}

@Component({
  selector: 'app-main-orders',
  standalone: false,
  templateUrl: './main-orders.html',
  styleUrl: './main-orders.scss'
})
export class MainOrdersComponent implements OnInit, OnDestroy {
  cargando = false;
  grupos: Record<'salon' | 'barra' | 'vip' | 'varios', MesaEnriquecida[]> = { salon: [], barra: [], vip: [], varios: [] };
  mensajeEstadoMesa = '';

  readonly gruposOrden: Array<'salon' | 'barra' | 'vip' | 'varios'> = ['salon', 'barra', 'vip', 'varios'];
  private pedidosAbiertosPorMesa = new Map<number, Pedido>();

  private reloadSub?: Subscription;

  constructor(
    private tablesReservesFacade: TablesReservesFacade,
    private ordersFacade: OrdersFacade,
    private router: Router,
    private posPreferences: PosPreferencesService
  ) { }

  ngOnInit(): void {
    this.cargarMesas();
    this.reloadSub = this.posPreferences.reload$.subscribe(() => this.cargarMesas());
  }

  ngOnDestroy(): void {
    this.reloadSub?.unsubscribe();
  }

  cargarMesas(): void {
    this.cargando = true;
    this.grupos = { salon: [], barra: [], vip: [], varios: [] };

    forkJoin([
      this.tablesReservesFacade.getTablesForPos(),
      this.ordersFacade.getOpenOrders(),
      this.tablesReservesFacade.getDailyReservationsForPos()
    ]).subscribe({
      next: ([mesas, openOrders, reservasPorMesa]: [MesaPosViewModel[], Pedido[], Map<number, ReservaFloorPlan>]) => {
        this.pedidosAbiertosPorMesa = new Map<number, Pedido>();
        for (const pedido of openOrders) {
          const idMesa = Number(pedido.idMesa);
          if (Number.isFinite(idMesa) && idMesa > 0) {
            this.pedidosAbiertosPorMesa.set(idMesa, pedido);
          }
        }

        const enriched: MesaEnriquecida[] = mesas.map(mesa => {
          const pedido = this.pedidosAbiertosPorMesa.get(mesa.idMesa) || null;
          const reservaHoy = reservasPorMesa.get(mesa.idMesa) ?? null;

          let estadoVisual = mesa.estadoVisual;
          let estadoRaw = mesa.estadoRaw;

          if (pedido) {
            estadoVisual = 'Ocupada';
            estadoRaw = 'Ocupada';
          } else if (reservaHoy?.esActivaPorHorario) {
            estadoVisual = 'Otro';
            estadoRaw = 'Reservada';
          } else {
            estadoVisual = 'Disponible';
            estadoRaw = 'Disponible';
          }

          return {
            ...mesa,
            estadoRaw,
            estadoVisual,
            fechaPedido: pedido?.fechaPedido || null,
            tiempoOcupada: pedido?.fechaPedido ? this.calcularTiempoOcupada(pedido.fechaPedido) : '--:--',
            reservaHoy
          };
        });

        this.grupos = { salon: [], barra: [], vip: [], varios: [] };
        for (const mesa of enriched) {
          if (mesa.tipoNormalizado === 'salon' || mesa.tipoNormalizado === 'barra' || mesa.tipoNormalizado === 'vip' || mesa.tipoNormalizado === 'varios') {
            this.grupos[mesa.tipoNormalizado].push(mesa);
          }
        }

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar mesas POS:', err);
        this.mensajeEstadoMesa = 'No fue posible cargar el estado de mesas.';
        this.cargando = false;
      }
    });
  }

  abrirMesa(mesa: MesaEnriquecida): void {
    this.router.navigate(['/employee/orders/table', mesa.idMesa]);
  }

  cambiarEstadoMesa(mesa: MesaEnriquecida): void {
    const tienePedidoAbierto = this.pedidosAbiertosPorMesa.has(mesa.idMesa);
    const nuevoEstado = mesa.estadoVisual === 'Ocupada' ? 'Disponible' : 'Ocupada';

    if (tienePedidoAbierto && nuevoEstado === 'Disponible') {
      this.mensajeEstadoMesa = `No se puede marcar ${mesa.nombreMesa} como disponible porque tiene un pedido abierto.`;
      return;
    }

    this.tablesReservesFacade.updateTableStatus(mesa.idMesa, { estado: nuevoEstado }).subscribe({
      next: () => {
        this.mensajeEstadoMesa = `${mesa.nombreMesa} actualizada a ${nuevoEstado}.`;
        this.cargarMesas();
      },
      error: (error) => {
        console.error('Error al actualizar estado de mesa:', error);
        this.mensajeEstadoMesa = `No se pudo actualizar ${mesa.nombreMesa}.`;
      }
    });
  }

  onConfirmarReserva(idReserva: number): void {
    const reserva = Array.from(this.grupos.salon)
      .concat(this.grupos.barra, this.grupos.vip, this.grupos.varios)
      .map(mesa => mesa.reservaHoy)
      .find(item => item?.idReserva === idReserva) || null;

    if (reserva && !reserva.puedeConfirmar) {
      this.mensajeEstadoMesa = 'La reserva solo puede confirmarse dentro de los 20 minutos previos a su hora.';
      return;
    }

    this.tablesReservesFacade.confirmReservation(idReserva).subscribe({
      next: () => {
        this.mensajeEstadoMesa = 'Reserva confirmada correctamente.';
        this.cargarMesas();
      },
      error: (error) => {
        console.error('Error al confirmar reserva:', error);
        this.mensajeEstadoMesa = 'No se pudo confirmar la reserva.';
      }
    });
  }

  onCancelarReserva(idReserva: number): void {
    this.tablesReservesFacade.cancelReservationByStaff(idReserva).subscribe({
      next: () => {
        this.mensajeEstadoMesa = 'Reserva cancelada correctamente.';
        this.cargarMesas();
      },
      error: (error) => {
        console.error('Error al cancelar reserva:', error);
        this.mensajeEstadoMesa = 'No se pudo cancelar la reserva.';
      }
    });
  }

  private calcularTiempoOcupada(fechaPedido: string): string {
    const diff = Date.now() - new Date(fechaPedido).getTime();
    if (isNaN(diff) || diff < 0) return '--:--';
    const totalMin = Math.floor(diff / 60000);
    const horas = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    return horas > 0 ? `${horas}h ${String(mins).padStart(2, '0')}m` : `${mins}m`;
  }
}

