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
    this.router.navigate(['/client/reservas/disponibilidad']);
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
