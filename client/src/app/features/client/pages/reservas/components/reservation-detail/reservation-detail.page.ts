import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TablesReservesApi } from '../../../../../../services/apis/tables&Reserves.api';
import { ReservationStatusDataDto } from '../../../../../../domain/tables&Reserves/dtos/response/reservation-status.response.dto';
import { SharedModule } from '../../../../../../shared/shared-module';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './reservation-detail.page.html',
  styleUrl: './reservation-detail.page.scss'
})
export class ReservationDetailPage implements OnInit, OnDestroy {
  idReserva: number | null = null;
  reserva: ReservationStatusDataDto | null = null;
  
  isLoading = false;
  isCancelling = false;
  error: string | null = null;
  cancelSuccess = false;
  cancelError: string | null = null;

  showCancelConfirm = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tablesApi: TablesReservesApi
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.idReserva = params['idReserva'] ? +params['idReserva'] : null;
      if (this.idReserva) {
        this.cargarDetalles();
      }
    });
  }

  cargarDetalles(): void {
    if (!this.idReserva) return;

    this.isLoading = true;
    this.error = null;

    this.tablesApi.getReservationStatus(this.idReserva)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.reserva = response.data || null;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'No se pudo cargar los detalles de la reserva.';
          this.isLoading = false;
        }
      });
  }

  abrirConfirmacionCancelacion(): void {
    this.showCancelConfirm = true;
  }

  cerrarConfirmacionCancelacion(): void {
    this.showCancelConfirm = false;
  }

  confirmarCancelacion(): void {
    if (!this.idReserva || this.isCancelling) return;

    this.isCancelling = true;
    this.cancelError = null;

    this.tablesApi.cancelReservation(this.idReserva)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.cancelSuccess = true;
          this.isCancelling = false;
          this.showCancelConfirm = false;
          setTimeout(() => {
            this.router.navigate(['/client/reservas/historial']);
          }, 2000);
        },
        error: (err) => {
          this.cancelError = err?.error?.message || 'No se pudo cancelar la reserva. Por favor, intente nuevamente.';
          this.isCancelling = false;
        }
      });
  }

  volverAlHistorial(): void {
    this.router.navigate(['/client/reservas/historial']);
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

  puedeCancel(): boolean {
    return this.reserva?.estado === 'pendiente' || this.reserva?.estado === 'confirmada';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
