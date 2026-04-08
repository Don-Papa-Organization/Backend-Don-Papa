import { Component, Inject, OnInit } from '@angular/core';
import { TablesReservesFacade } from '../services/tables-reserves.facade';
import type { TabItem } from '../../../../../shared/ui/ui-tabs/ui-tabs';
import type { MesaViewModel, ReservationViewModel } from '../services/tables-reserves.facade';
import type { CreateMesaRequestDto } from '../../../../../domain/tables&Reserves/dtos/request/create-mesa.request.dto';
import type { UpdateMesaRequestDto } from '../../../../../domain/tables&Reserves/dtos/request/update-mesa.request.dto';
import { AccionTabla } from '../../../../../shared/ui/ui-tabla/ui-tabla';
import { MESA_TIPOS, MesaTipo } from '../../../../../types/mesa-tipo.type';

type ReservaStaffForm = {
  idMesa: number | null;
  idCliente: number | null;
  fecha: string;
  hora: string;
  cantidadPersonas: number;
};

@Component({
  selector: 'app-main-tables-reserves',
  standalone: false,
  templateUrl: './main-tables-reserves.html',
  styleUrl: './main-tables-reserves.scss'
})
export class MainTablesReserves implements OnInit {

  tipoOptions: Array<{ value: MesaTipo; label: string }> = MESA_TIPOS.map(tipo => ({
    value: tipo,
    label: tipo
  }));

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

  // === INDICADORES DE CARGA ===
  cargandoMesas = false;
  cargandoReservas = false;

  mesas: MesaViewModel[] = [];
  columnasMesas: string[] = ['idMesa', 'Numero', 'Tipo', 'Estado', 'Acciones'];

  reservas: ReservationViewModel[] = [];
  columnasReservas: string[] = ['idReserva', 'Fecha', 'Hora', 'numeroMesa', 'tipoMesa', 'cantidadPersonas', 'Estado', 'Acciones'];

  mostrarModalAgregarMesa = false;
  mostrarModalEditarMesa = false;
  mostrarModalEliminarMesa = false;

  mostrarModalDetalleReserva = false;
  mostrarModalCancelarReserva = false;
  mostrarModalAgregarReserva = false;

  mesaSeleccionada: MesaViewModel | null = null;
  reservaSeleccionada: ReservationViewModel | null = null;

  reservaForm: ReservaStaffForm = {
    idMesa: null,
    idCliente: null,
    fecha: '',
    hora: '19:00',
    cantidadPersonas: 2
  };
  formSubmitted = false;
  reservaFormError = '';

  constructor(@Inject(TablesReservesFacade) private tablesReservesFacade: TablesReservesFacade) { }

  ngOnInit(): void {
    this.cargarTiposMesa();
    this.cargarMesas();
    this.cargarReservas();
  }

  cargarTiposMesa(): void {
    this.tablesReservesFacade.getTableTypes().subscribe({
      next: (response) => {
        const tipos = (response.data?.tipos ?? []).filter(Boolean) as MesaTipo[];
        if (tipos.length) {
          this.tipoOptions = tipos.map(tipo => ({ value: tipo, label: tipo }));
        }
      },
      error: (error) => {
        console.error('Error al cargar tipos de mesa:', error);
      }
    });
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
    this.cargandoMesas = true;
    this.tablesReservesFacade.getTables().subscribe({
      next: (mesas) => {
        this.mesas = mesas;
        this.cargandoMesas = false;
      },
      error: (error) => {
        console.error('Error al cargar mesas:', error);
        this.cargandoMesas = false;
      }
    });
  }

  cargarReservas(): void {
    this.cargandoReservas = true;
    this.tablesReservesFacade.getReservationsByStatus().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.cargandoReservas = false;
      },
      error: (error) => {
        console.error('Error al cargar reservas:', error);
        this.cargandoReservas = false;
      }
    });
  }

  onAgregarMesa(): void {
    this.mostrarModalAgregarMesa = true;
  }

  onAgregarReserva(): void {
    const ahora = new Date();
    const hoy = this.formatDateLocal(ahora);
    const horaMinima = this.formatTimeLocal(ahora);
    this.reservaForm = {
      idMesa: this.mesas.find((m) => m.estado === 'Disponible')?.idMesa ?? null,
      idCliente: null,
      fecha: hoy,
      hora: horaMinima,
      cantidadPersonas: 2
    };
    this.formSubmitted = false;
    this.reservaFormError = '';
    this.mostrarModalAgregarReserva = true;
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

  cerrarModalAgregarReserva(): void {
    this.mostrarModalAgregarReserva = false;
    this.formSubmitted = false;
    this.reservaFormError = '';
  }

  confirmarAgregarReserva(): void {
    this.formSubmitted = true;
    this.reservaFormError = '';

    const idMesa = Number(this.reservaForm.idMesa);
    const idCliente = Number(this.reservaForm.idCliente);
    const idClienteEsValido = Number.isFinite(idCliente) && idCliente > 0;
    const cantidadPersonas = Number(this.reservaForm.cantidadPersonas);

    if (!idMesa || !this.reservaForm.fecha || !this.reservaForm.hora || !cantidadPersonas) {
      this.reservaFormError = 'Completa los campos obligatorios para crear la reserva.';
      return;
    }

    if (cantidadPersonas > this.maxPersonasSegunMesa) {
      this.reservaFormError = `Máximo ${this.maxPersonasSegunMesa} personas permitidas para ${this.tipoMesaSeleccionada}.`;
      return;
    }

    if (!this.fechaHoraReservaEsValida) {
      this.reservaFormError = 'No puedes registrar una reserva en una fecha/hora anterior a la actual.';
      return;
    }

    const fechaReserva = `${this.reservaForm.fecha}T${this.reservaForm.hora}:00`;

    this.tablesReservesFacade.createReservationByStaff({
      idMesa,
      ...(idClienteEsValido ? { idCliente } : {}),
      fechaReserva,
      cantidadPersonas
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.cerrarModalAgregarReserva();
          this.cargarMesas();
          this.cargarReservas();
        }
      },
      error: (error) => {
        console.error('Error al crear reserva:', error);
        const backendMessage = String(error?.error?.message || error?.error?.error || error?.message || '').trim();
        this.reservaFormError = backendMessage || 'No se pudo crear la reserva. Verifica fecha, hora y capacidad de la mesa.';
      }
    });
  }

  get fechaMinimaReserva(): string {
    return this.formatDateLocal(new Date());
  }

  get horaMinimaReserva(): string {
    if (this.reservaForm.fecha !== this.fechaMinimaReserva) {
      return '00:00';
    }
    return this.formatTimeLocal(new Date());
  }

  get fechaHoraReservaEsValida(): boolean {
    if (!this.reservaForm.fecha || !this.reservaForm.hora) {
      return false;
    }

    const fechaHoraReserva = new Date(`${this.reservaForm.fecha}T${this.reservaForm.hora}:00`);
    if (Number.isNaN(fechaHoraReserva.getTime())) {
      return false;
    }

    return fechaHoraReserva.getTime() >= Date.now();
  }

  get mesaReservaOptions(): Array<{ value: number; label: string }> {
    return this.mesas
      .filter((mesa) => mesa.estado === 'Disponible')
      .map((mesa) => ({
        value: mesa.idMesa,
        label: `Mesa ${mesa.numero} (${mesa.tipo}) - ${mesa.estado}`
      }));
  }

  get reservaFormValida(): boolean {
    return Boolean(
      Number(this.reservaForm.idMesa) > 0 &&
      this.reservaForm.fecha &&
      this.reservaForm.hora &&
      Number(this.reservaForm.cantidadPersonas) > 0 &&
      Number(this.reservaForm.cantidadPersonas) <= this.maxPersonasSegunMesa
    );
  }

  get tipoMesaSeleccionada(): string | null {
    if (!this.reservaForm.idMesa) return null;
    const mesa = this.mesas.find((m) => m.idMesa === this.reservaForm.idMesa);
    return mesa?.tipo ?? null;
  }

  get maxPersonasSegunMesa(): number {
    const tipo = this.tipoMesaSeleccionada;
    switch (tipo) {
      case 'VIP':
        return 4;
      case 'Salon':
        return 4;
      case 'Barra':
        return 1;
      default:
        return 999;
    }
  }

  private formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatTimeLocal(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
