import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TablesReservesApi } from '../../../../../../services/apis/tables&Reserves.api';
import { UsersApi } from '../../../../../../services/apis/users.api';
import { Mesa } from '../../../../../../domain/tables&Reserves/models/mesa.model';
import { AuthProfileResponseDto } from '../../../../../../domain/users/dtos/response/auth-profile.response.dto';
import { SharedModule } from '../../../../../../shared/shared-module';
import { UiReservationModalComponent } from '../../../../../../shared/ui/reservation-modal/reservation-modal.component';


@Component({
  selector: 'app-catalog-mesas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, UiReservationModalComponent],
  templateUrl: './catalog-mesas.page.html',
  styleUrl: './catalog-mesas.page.scss'
})
export class CatalogMesasPage implements OnInit, OnDestroy {
  vistaActiva: 'mapa' | 'cards' = 'mapa';

  zonaFiltro: string = 'todas';
  filtrosZona = [
    { id: 'todas', label: 'Todas' },
    { id: 'VIP', label: 'VIP' },
    { id: 'Salon', label: 'Salón' },
    { id: 'Barra', label: 'Barra' }
  ];

  mesas: Mesa[] = [];
  mesasFiltradas: Mesa[] = [];
  grupos: Record<'salon' | 'barra' | 'vip', Mesa[]> = {
    salon: [],
    barra: [],
    vip: []
  };
  isLoading = false;
  error: string | null = null;
  isEmpty = false;
  @Output() mesaSelected = new EventEmitter<Mesa>();
  private destroy$ = new Subject<void>();

  // ESTADO MODAL
  mesaSeleccionadaModal: Mesa | null = null;
  mostrarModalReserva = false;
  confirmandoReserva = false;

  // PERFIL BLOQUEO
  mostrarToastPerfil = false;
  readonly mensajePerfilIncompleto = 'Informacion de perfil incompleta, por favor completa tus datos antes de reservar';
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  // FILTROS
  fechaFiltro: string = '';
  horaFiltro: string = '';
  minDate: string = '';
  horasDisponibles: string[] = [];

  // INPUTS MODAL
  cantidadPersonasModal: number = 1;
  horaFinModal: string = '';
  horasFinDisponibles: { hora: string; disponible: boolean }[] = [];

  constructor(
    private tablesApi: TablesReservesApi,
    private usersApi: UsersApi,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.setearMinDate();
    this.generarHoras();
    this.cargarMesas();
  }

  setearMinDate(): void {
    const hoy = new Date();
    this.minDate = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
    this.fechaFiltro = this.minDate;
  }

  generarHoras(): void {
    this.horasDisponibles = [];
    for (let i = 12; i <= 23; i++) {
      this.horasDisponibles.push(`${String(i).padStart(2,'0')}:00`);
    }
  }

  aplicarFiltro(): void {
    if (!this.fechaFiltro) return;

    if (!this.horaFiltro) {
      this.cargarMesas();
      return;
    }

    this.isLoading = true;
    this.tablesApi.checkAvailability({
      fecha: this.fechaFiltro,
      hora: this.horaFiltro,
      cantidadPersonas: 1
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.mesas = response.data?.mesasDisponibles || [];
        this.mesasFiltradas = [...this.mesas];
        this.isEmpty = this.mesas.length === 0;
        this.isLoading = false;
        this.agruparMesasPorTipo();
      },
      error: () => {
        this.error = 'Error al verificar disponibilidad.';
        this.isLoading = false;
      }
    });
  }

  limpiarFiltro(): void {
    this.fechaFiltro = this.minDate;
    this.horaFiltro = '';
    this.cargarMesas();
  }

  onVistaChange(tabId: string): void {
    this.vistaActiva = tabId === 'cards' ? 'cards' : 'mapa';
  }

  obtenerDetalleEstado(mesa: Mesa): string {
    if (mesa.estado === 'Reservada') {
      return this.horaFiltro ? `Reservada para ${this.horaFiltro}` : 'Reservada todo el día';
    }

    if (mesa.estado === 'Disponible') {
      return this.horaFiltro ? `Disponible para ${this.horaFiltro}` : 'Disponible todo el día';
    }

    return this.obtenerLabelEstado(mesa.estado);
  }

  cargarMesas(): void {
    this.isLoading = true;
    this.error = null;
    this.tablesApi.listTables()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.mesas = response.data?.mesas || [];
          this.mesasFiltradas = [...this.mesas];
          this.isEmpty = this.mesas.length === 0;
          this.isLoading = false;
          this.agruparMesasPorTipo();
        },
        error: (err) => {
          this.error = 'No se pudieron cargar las mesas. Por favor, intente nuevamente.';
          this.isEmpty = true;
          this.isLoading = false;
        }
      });
  }

  agruparMesasPorTipo(): void {
    this.grupos = {
      salon: [],
      barra: [],
      vip: []
    };
    
    for (const mesa of this.mesas) {
      if (mesa.tipo === 'Salon') this.grupos.salon.push(mesa);
      else if (mesa.tipo === 'Barra') this.grupos.barra.push(mesa);
      else if (mesa.tipo === 'VIP') this.grupos.vip.push(mesa);
      // Ignorar 'Varios'
    }
  }

  filtrarPorZona(zona: string): void {
    this.zonaFiltro = zona;
    if (zona === 'todas') {
      this.mesasFiltradas = [...this.mesas];
    } else {
      this.mesasFiltradas = this.mesas.filter(m => {
        const tipoNorm = m.tipo.toLowerCase().trim();
        const zonaNorm = zona.toLowerCase().trim();
        return tipoNorm === zonaNorm;
      });
    }
  }

  obtenerColorEstado(estado: string): string {
    switch (estado) {
      case 'Disponible': return '#4CAF50';
      case 'Reservada': return '#FF9800';
      case 'Ocupada': return '#f44336';
      case 'Fuera de servicio': return '#999999';
      default: return '#cccccc';
    }
  }

  obtenerLabelEstado(estado: string): string {
    switch (estado) {
      case 'Disponible': return 'Disponible';
      case 'Reservada': return 'Reservada';
      case 'Ocupada': return 'Ocupada';
      case 'Fuera de servicio': return 'Fuera de servicio';
      default: return estado;
    }
  }

  onMesaClick(mesa: Mesa): void {
    if (mesa.estado !== 'Disponible') return;

    this.mesaSeleccionadaModal = mesa;
    this.mostrarModalReserva = true;
    this.cantidadPersonasModal = 1;
    this.horaFinModal = '';
    this.generarHorasFin();
  }

  onCardClick(mesa: Mesa): void {
    this.onMesaClick(mesa);
  }

  generarHorasFin(): void {
    if (!this.horaFiltro) return;
    const [hh] = this.horaFiltro.split(':').map(Number);
    this.horasFinDisponibles = [];
    for (let h = hh + 1; h <= 23; h++) {
      this.horasFinDisponibles.push({
        hora: `${String(h).padStart(2,'0')}:00`,
        disponible: true
      });
    }
    if (this.horasFinDisponibles.length > 0) {
      this.horaFinModal = this.horasFinDisponibles[0].hora;
    }
  }

  cerrarModalReserva(): void {
    this.mostrarModalReserva = false;
    this.mesaSeleccionadaModal = null;
  }

  confirmarReservaModal(data: { cantidadPersonas: number; horaFin: string; fecha: string; horaInicio: string }): void {
    if (!this.mesaSeleccionadaModal) return;

    this.usersApi.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profileResponse) => {
          if (!profileResponse.success || !profileResponse.data || !this.esPerfilCompleto(profileResponse.data)) {
            this.mostrarToastPerfilIncompleto();
            return;
          }
          this.ejecutarConfirmacionReserva(data);
        },
        error: () => {
          this.mostrarToastPerfilIncompleto();
        }
      });
  }

  private esPerfilCompleto(profile: AuthProfileResponseDto): boolean {
    const nombre = profile.cliente?.nombre?.trim() || '';
    const direccion = profile.cliente?.direccion?.trim() || '';
    const telefono = profile.cliente?.telefono?.trim() || '';
    const telefonoValido = /^\d{10}$/.test(telefono);
    return !!nombre && !!direccion && telefonoValido;
  }

  private ejecutarConfirmacionReserva(data: { cantidadPersonas: number; horaFin: string; fecha: string; horaInicio: string }): void {
    if (!this.mesaSeleccionadaModal || !data.fecha || !data.horaInicio) return;

    this.confirmandoReserva = true;
    const fechaHora = `${data.fecha}T${data.horaInicio}:00`;
    this.fechaFiltro = data.fecha;
    this.horaFiltro = data.horaInicio;

    this.tablesApi.reserveTable({
      idMesa: this.mesaSeleccionadaModal.idMesa,
      fechaReserva: fechaHora,
      cantidadPersonas: data.cantidadPersonas
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.confirmandoReserva = false;
        if (response.success) {
          this.cerrarModalReserva();
          this.aplicarFiltro();
        }
      },
      error: () => {
        this.confirmandoReserva = false;
      }
    });
  }

  private mostrarToastPerfilIncompleto(): void {
    this.mostrarToastPerfil = true;
    this.clearToastTimer();
    this.toastTimer = setTimeout(() => {
      this.mostrarToastPerfil = false;
      this.toastTimer = null;
    }, 5000);
  }

  private clearToastTimer(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
  }

  ngOnDestroy(): void {
    this.clearToastTimer();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
