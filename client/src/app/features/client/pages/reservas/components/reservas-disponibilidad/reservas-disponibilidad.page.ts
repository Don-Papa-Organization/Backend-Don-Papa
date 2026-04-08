import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Mesa } from '../../../../../../domain/tables&Reserves/models/mesa.model';
import { CheckAvailabilityRequestDto } from '../../../../../../domain/tables&Reserves/dtos/request/check-availability.request.dto';
import { ReserveTableRequestDto } from '../../../../../../domain/tables&Reserves/dtos/request/reserve-table.request.dto';
import { AvailabilityDataDto } from '../../../../../../domain/tables&Reserves/dtos/response/check-availability.response.dto';
import { TablesReservesApi } from '../../../../../../services/apis/tables&Reserves.api';
import { SharedModule } from '../../../../../../shared/shared-module';
import { LayoutModule } from '../../../../../../shared/layout/layout-module';
import { UiDateTimePickerComponent } from '../../../../../../shared/ui/date-time-picker/date-time-picker.component';
import { UiReservationModalComponent } from '../../../../../../shared/ui/reservation-modal/reservation-modal.component';

interface ReservationContext {
  mesaSeleccionada: Mesa | null;
  horaInicio: string;
  fecha: string;
}

@Component({
  selector: 'app-reservas-disponibilidad',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    LayoutModule,
    UiDateTimePickerComponent,
    UiReservationModalComponent
  ],
  templateUrl: './reservas-disponibilidad.page.html',
  styleUrl: './reservas-disponibilidad.page.scss'
})
export class ReservasDisponibilidadPage implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  // Estado de fecha/hora
  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';

  vistaActiva: 'mapa' | 'cards' = 'mapa';
  viewTabs = [
    { id: 'cards', label: 'Ver Cards' },
    { id: 'mapa', label: 'Ver Mapa' }
  ];

  // Mesas disponibles
  mesasDisponibles: Mesa[] = [];
  mesasAgrupadas: { VIP: Mesa[], Salon: Mesa[], Barra: Mesa[] } = {
    VIP: [],
    Salon: [],
    Barra: []
  };

  // Estados de carga
  cargando = false;
  error: string | null = null;

  // Modal de reserva
  mostrarModal = false;
  reservationContext: ReservationContext = {
    mesaSeleccionada: null,
    horaInicio: '',
    fecha: ''
  };

  // Confirmación de reserva
  confirmandoReserva = false;

  constructor(private readonly tablesApi: TablesReservesApi) {}

  ngOnInit(): void {
    this.inicializarFechaHora();
    this.buscarDisponibilidad();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializar fecha a hoy y hora a (hora_actual + 1)
   */
  private inicializarFechaHora(): void {
    const ahora = new Date();
    
    // Fecha = hoy
    const year = ahora.getFullYear();
    const month = String(ahora.getMonth() + 1).padStart(2, '0');
    const day = String(ahora.getDate()).padStart(2, '0');
    this.fechaSeleccionada = `${year}-${month}-${day}`;

    // Hora = hora actual + 1 (redondeada a siguiente hora completa)
    let horaFutura = new Date(ahora);
    horaFutura.setHours(horaFutura.getHours() + 1);
    horaFutura.setMinutes(0);
    horaFutura.setSeconds(0);

    const horas = String(horaFutura.getHours()).padStart(2, '0');
    const minutos = String(horaFutura.getMinutes()).padStart(2, '0');
    this.horaSeleccionada = `${horas}:${minutos}`;
  }

  /**
   * Buscar disponibilidad de mesas
   */
  buscarDisponibilidad(): void {
    if (!this.fechaSeleccionada || !this.horaSeleccionada) {
      this.error = 'Por favor seleccione fecha y hora';
      return;
    }

    this.cargando = true;
    this.error = null;
    this.mesasDisponibles = [];
    this.mesasAgrupadas = { VIP: [], Salon: [], Barra: [] };

    const dto: CheckAvailabilityRequestDto = {
      fecha: this.fechaSeleccionada,
      hora: this.horaSeleccionada,
      cantidadPersonas: 1 // Para obtener todas las mesas disponibles
    };

    this.tablesApi
      .checkAvailability(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.error = response.message || 'No se pudo verificar disponibilidad';
            this.cargando = false;
            return;
          }

          this.mesasDisponibles = response.data?.mesasDisponibles || [];
          this.agruparMesasPorTipo();
          this.cargando = false;
        },
        error: (err) => {
          this.error = err?.message || 'Error al consultar disponibilidad';
          this.cargando = false;
        }
      });
  }

  /**
   * Agrupar mesas por tipo (excluye 'Varios')
   */
  private agruparMesasPorTipo(): void {
    this.mesasAgrupadas = {
      VIP: this.mesasDisponibles.filter(m => m.tipo === 'VIP'),
      Salon: this.mesasDisponibles.filter(m => m.tipo === 'Salon'),
      Barra: this.mesasDisponibles.filter(m => m.tipo === 'Barra')
    };
  }

  /**
   * Cuando se selecciona una mesa del grid
   */
  onMesaSeleccionada(mesa: Mesa): void {
    this.reservationContext = {
      mesaSeleccionada: mesa,
      horaInicio: this.horaSeleccionada,
      fecha: this.fechaSeleccionada
    };
    this.mostrarModal = true;
  }

  /**
   * Cuando se cierra el modal
   */
  onCerrarModal(): void {
    this.mostrarModal = false;
    this.reservationContext = {
      mesaSeleccionada: null,
      horaInicio: '',
      fecha: ''
    };
  }

  /**
   * Cuando se confirma la reserva en el modal
   */
  onConfirmarReserva(datos: {
    cantidadPersonas: number;
    horaFin: string;
  }): void {
    if (!this.reservationContext.mesaSeleccionada) return;

    this.confirmandoReserva = true;

    // Construir datetime completo para API
    const fechaHoraInicio = this.construirFechaReservaIso(this.fechaSeleccionada, this.horaSeleccionada);
    if (!fechaHoraInicio) {
      this.error = 'La fecha y hora seleccionadas no son válidas.';
      this.confirmandoReserva = false;
      return;
    }

    const dto: ReserveTableRequestDto = {
      idMesa: this.reservationContext.mesaSeleccionada.idMesa,
      fechaReserva: fechaHoraInicio,
      cantidadPersonas: datos.cantidadPersonas
    };

    this.tablesApi
      .reserveTable(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.error = response.message || 'Error al crear reserva';
            this.confirmandoReserva = false;
            return;
          }

          // Éxito: mostrar mensaje y recargar
          this.mostrarModal = false;
          this.confirmandoReserva = false;
          alert('¡Reserva confirmada!'); // TODO: reemplazar con toast
          this.buscarDisponibilidad();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Error al procesar reserva';
          this.confirmandoReserva = false;
        }
      });
  }

  private construirFechaReservaIso(fecha: string, hora: string): string | null {
    if (!fecha || !hora) return null;
    const localDateTime = new Date(`${fecha}T${hora}:00`);
    if (Number.isNaN(localDateTime.getTime())) return null;
    return localDateTime.toISOString();
  }

  /**
   * Cuando cambia fecha/hora
   */
  onFechaHoraActualizada(datos: { fecha: string; hora: string }): void {
    this.fechaSeleccionada = datos.fecha;
    this.horaSeleccionada = datos.hora;
    this.buscarDisponibilidad();
  }

  onVistaChange(tabId: string): void {
    this.vistaActiva = tabId === 'cards' ? 'cards' : 'mapa';
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
}
