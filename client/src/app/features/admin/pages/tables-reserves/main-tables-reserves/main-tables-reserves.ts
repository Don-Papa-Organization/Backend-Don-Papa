import { Component, Inject, OnInit } from '@angular/core';
import { TablesReservesFacade } from '../services/tables-reserves.facade';
import type { TabItem } from '../../../../../shared/ui/ui-tabs/ui-tabs';
import type { MesaViewModel, ReservationViewModel } from '../services/tables-reserves.facade';
import type { CreateMesaRequestDto } from '../../../../../domain/tables&Reserves/dtos/request/create-mesa.request.dto';
import type { UpdateMesaRequestDto } from '../../../../../domain/tables&Reserves/dtos/request/update-mesa.request.dto';
import { AccionTabla } from '../../../../../shared/ui/ui-tabla/ui-tabla';

@Component({
  selector: 'app-main-tables-reserves',
  standalone: false,
  templateUrl: './main-tables-reserves.html',
  styleUrl: './main-tables-reserves.scss'
})
export class MainTablesReserves implements OnInit {

  accionesMesas: AccionTabla[] = [
    {
      urlIcono: "icons/editar.svg",
      accion: (registro: any) => this.onEditarMesa(registro)
    },
    {
      urlIcono: "icons/eliminar.svg",
      accion: (registro: any) => this.onEliminarMesa(registro)
    }
  ];

  accionesReservas: AccionTabla[] = [
    {
      urlIcono: "icons/eye.svg",
      accion: (registro: any) => this.onVerDetalleReserva(registro)
    },
    {
      urlIcono: "icons/eliminar.svg",
      accion: (registro: any) => this.onCancelarReserva(registro)
    }
  ];

  tabs: TabItem[] = [
    { id: 'mesas', label: 'Mesas' },
    { id: 'reservas', label: 'Reservas' }
  ];

  tabActiva: string = 'mesas';

  mesas: MesaViewModel[] = [];
  columnasMesas: string[] = ['idMesa', 'numero', 'tipo', 'estado', 'Acciones'];

  reservas: ReservationViewModel[] = [];
  columnasReservas: string[] = ['idReserva', 'fecha', 'hora', 'numeroMesa', 'tipoMesa', 'cantidadPersonas', 'estado', 'Acciones'];

  mostrarModalAgregarMesa = false;
  mostrarModalEditarMesa = false;
  mostrarModalEliminarMesa = false;

  mostrarModalDetalleReserva = false;
  mostrarModalCancelarReserva = false;

  mesaSeleccionada: MesaViewModel | null = null;
  reservaSeleccionada: ReservationViewModel | null = null;

  constructor(@Inject(TablesReservesFacade) private tablesReservesFacade: TablesReservesFacade) {}

  ngOnInit(): void {
    this.cargarMesas();
    this.cargarReservas();
  }

  cambiarTab(tabId: string): void {
    this.tabActiva = tabId;
  }

  onRecargar(): void {
    if (this.tabActiva === 'mesas') {
      this.cargarMesas();
      return;
    }

    this.cargarReservas();
  }

  cargarMesas(): void {
    this.tablesReservesFacade.getTables().subscribe({
      next: (mesas) => {
        this.mesas = mesas;
      },
      error: (error) => {
        console.error('Error al cargar mesas:', error);
      }
    });
  }

  cargarReservas(): void {
    this.tablesReservesFacade.getReservationsByStatus().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
      },
      error: (error) => {
        console.error('Error al cargar reservas:', error);
      }
    });
  }

  onAgregarMesa(): void {
    this.mostrarModalAgregarMesa = true;
  }

  onMesaCreada(dto: CreateMesaRequestDto): void {
    this.tablesReservesFacade.createTable(dto).subscribe({
      next: (response) => {
        if (response.success) {
          this.cargarMesas();
          this.cerrarModalAgregarMesa();
        }
      },
      error: (error) => {
        console.error('Error al crear mesa:', error);
      }
    });
  }

  onEditarMesa(registro: MesaViewModel): void {
    this.mesaSeleccionada = registro;
    this.mostrarModalEditarMesa = true;
  }

  onMesaActualizada(dto: UpdateMesaRequestDto): void {
    if (!this.mesaSeleccionada) return;

    this.tablesReservesFacade.updateTable(this.mesaSeleccionada.idMesa, dto).subscribe({
      next: (response) => {
        if (response.success) {
          this.cargarMesas();
          this.cerrarModalEditarMesa();
        }
      },
      error: (error) => {
        console.error('Error al actualizar mesa:', error);
      }
    });
  }

  onEliminarMesa(registro: MesaViewModel): void {
    this.mesaSeleccionada = registro;
    this.mostrarModalEliminarMesa = true;
  }

  confirmarEliminarMesa(): void {
    if (!this.mesaSeleccionada) return;

    this.tablesReservesFacade.deleteTable(this.mesaSeleccionada.idMesa).subscribe({
      next: (response) => {
        if (response.success) {
          this.cerrarModalEliminarMesa();
          this.cargarMesas();
        }
      },
      error: (error) => {
        console.error('Error al eliminar mesa:', error);
      }
    });
  }

  cerrarModalAgregarMesa(): void {
    this.mostrarModalAgregarMesa = false;
  }

  cerrarModalEditarMesa(): void {
    this.mostrarModalEditarMesa = false;
    this.mesaSeleccionada = null;
  }

  cerrarModalEliminarMesa(): void {
    this.mostrarModalEliminarMesa = false;
    this.mesaSeleccionada = null;
  }

  onVerDetalleReserva(registro: ReservationViewModel): void {
    this.reservaSeleccionada = registro;
    this.mostrarModalDetalleReserva = true;
  }

  cerrarModalDetalleReserva(): void {
    this.mostrarModalDetalleReserva = false;
    this.reservaSeleccionada = null;
  }

  onCancelarReserva(registro: ReservationViewModel): void {
    this.reservaSeleccionada = registro;
    this.mostrarModalCancelarReserva = true;
  }

  confirmarCancelacionReserva(): void {
    if (!this.reservaSeleccionada) return;

    this.tablesReservesFacade.cancelReservationByStaff(this.reservaSeleccionada.idReserva).subscribe({
      next: (response) => {
        if (response.success) {
          this.cerrarModalCancelarReserva();
          this.cargarReservas();
        }
      },
      error: (error) => {
        console.error('Error al cancelar reserva:', error);
      }
    });
  }

  cerrarModalCancelarReserva(): void {
    this.mostrarModalCancelarReserva = false;
    this.reservaSeleccionada = null;
  }
}
