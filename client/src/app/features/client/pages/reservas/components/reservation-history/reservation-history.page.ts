import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TablesReservesApi } from '../../../../../../services/apis/tables&Reserves.api';
import { ReservationHistoryItemDto } from '../../../../../../domain/tables&Reserves/dtos/response/reservation-history.response.dto';
import { SharedModule } from '../../../../../../shared/shared-module';

@Component({
  selector: 'app-reservation-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './reservation-history.page.html',
  styleUrl: './reservation-history.page.scss'
})
export class ReservationHistoryPage implements OnInit, OnDestroy {
  reservas: ReservationHistoryItemDto[] = [];
  reservasFiltered: ReservationHistoryItemDto[] = [];
  isLoading = false;
  error: string | null = null;
  isEmpty = false;
  processingReservationId: number | null = null;
  reservaPendienteCancelar: ReservationHistoryItemDto | null = null;

  filtroEstado: string = '';
  estadosDisponibles: string[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private tablesApi: TablesReservesApi,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.isLoading = true;
    this.error = null;
    
    this.tablesApi.getReservationHistory()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.reservas = response.data?.reservas || [];
          this.reservasFiltered = this.reservas;
          this.isEmpty = this.reservas.length === 0;
          this.isLoading = false;
          this.extraerEstados();
        },
        error: (err) => {
          this.error = 'No se pudo cargar el historial de reservas. Por favor, intente nuevamente.';
          this.isEmpty = true;
          this.isLoading = false;
        }
      });
  }

  extraerEstados(): void {
    const estados = new Set<string>(this.reservas.map(r => r.estado));
    this.estadosDisponibles = Array.from(estados).sort();
  }

  filtrarPorEstado(): void {
    if (!this.filtroEstado) {
      this.reservasFiltered = this.reservas;
    } else {
      this.reservasFiltered = this.reservas.filter(r => r.estado === this.filtroEstado);
    }
  }

  verDetalles(idReserva: number): void {
    this.router.navigate(['/client/reservas/detalle', idReserva]);
  }

  irAReservar(): void {
    this.router.navigate(['/client/reservas']);
  }

  solicitarCancelarReserva(reserva: ReservationHistoryItemDto): void {
    this.reservaPendienteCancelar = reserva;
  }

  cerrarModalCancelar(): void {
    this.reservaPendienteCancelar = null;
  }

  confirmarCancelacionReserva(): void {
    if (!this.reservaPendienteCancelar) return;
    this.cancelarReserva(this.reservaPendienteCancelar.idReserva);
    this.reservaPendienteCancelar = null;
  }

  cancelarReserva(idReserva: number): void {
    if (this.processingReservationId !== null) return;

    this.processingReservationId = idReserva;
    this.tablesApi.cancelReservation(idReserva)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.processingReservationId = null;
          this.cargarHistorial();
        },
        error: () => {
          this.error = 'No se pudo cancelar la reserva. Intenta nuevamente.';
          this.processingReservationId = null;
        }
      });
  }

  confirmarReserva(idReserva: number): void {
    if (this.processingReservationId !== null) return;

    this.processingReservationId = idReserva;
    this.tablesApi.confirmReservation(idReserva)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.processingReservationId = null;
          this.cargarHistorial();
        },
        error: (err) => {
          this.error = err?.error?.message || 'No se pudo confirmar la reserva. Intenta nuevamente.';
          this.processingReservationId = null;
        }
      });
  }

  puedeConfirmar(estado: string): boolean {
    return estado.toLowerCase() === 'pendiente';
  }

  puedeCancelar(estado: string): boolean {
    const estadoNormalizado = estado.toLowerCase();
    return estadoNormalizado === 'pendiente' || estadoNormalizado === 'confirmada';
  }

  estaProcesando(idReserva: number): boolean {
    return this.processingReservationId === idReserva;
  }

  obtenerColorEstado(estado: string): string {
    switch (estado) {
      case 'pendiente': return '#FF9800';
      case 'confirmada': return '#4CAF50';
      case 'cancelada': return '#f44336';
      default: return '#cccccc';
    }
  }

  obtenerLabelEstado(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'confirmada': return 'Confirmada';
      case 'cancelada': return 'Cancelada';
      default: return estado;
    }
  }

  formatearFecha(fecha: string): string {
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return fecha;
    }
  }

  formatearHora(fecha: string): string {
    try {
      return new Date(fecha).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '--:--';
    }
  }

  resumenReservaParaModal(reserva: ReservationHistoryItemDto | null): string {
    if (!reserva) return '';
    return `Mesa #${reserva.numeroMesa} · ${this.formatearFecha(reserva.fechaReserva)} ${this.formatearHora(reserva.fechaReserva)}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
