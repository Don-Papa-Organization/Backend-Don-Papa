import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { TablesReservesApi } from '../../../../../../services/apis/tables&Reserves.api';
import { CheckAvailabilityRequestDto } from '../../../../../../domain/tables&Reserves/dtos/request/check-availability.request.dto';
import { AvailabilityDataDto } from '../../../../../../domain/tables&Reserves/dtos/response/check-availability.response.dto';
import { Mesa } from '../../../../../../domain/tables&Reserves/models/mesa.model';
import { selectIsAuthenticated } from '../../../../../../domain/auth/state/auth.selectors';
import { SharedModule } from '../../../../../../shared/shared-module';

@Component({
  selector: 'app-mesas-check-availability',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './mesas-check-availability.page.html',
  styleUrl: './mesas-check-availability.page.scss'
})
export class MesasCheckAvailabilityPage implements OnInit, OnDestroy {
  fecha: string = '';
  hora: string = '';
  cantidadPersonas: number = 1;
  
  availability: AvailabilityDataDto | null = null;
  isLoading = false;
  error: string | null = null;
  isEmpty = false;
  buscaRealizada = false;

  minDate: string = '';
  horasDisponibles: string[] = [];
  personasOptions: number[] = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20];

  isAuthenticated = false;
  private destroy$ = new Subject<void>();

  constructor(
    private tablesApi: TablesReservesApi,
    private store: Store,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setearMinDate();
    this.generarHoras();
    this.verificarAutenticacion();
  }

  setearMinDate(): void {
    const hoy = new Date();
    const dd = String(hoy.getDate()).padStart(2, '0');
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const yyyy = hoy.getFullYear();
    this.minDate = `${yyyy}-${mm}-${dd}`;
    if (!this.fecha) this.fecha = this.minDate;
  }

  generarHoras(): void {
    this.horasDisponibles = [];
    for (let i = 12; i <= 23; i++) {
      this.horasDisponibles.push(`${String(i).padStart(2, '0')}:00`);
      this.horasDisponibles.push(`${String(i).padStart(2, '0')}:30`);
    }
  }

  verificarAutenticacion(): void {
    this.store.select(selectIsAuthenticated)
      .pipe(takeUntil(this.destroy$))
      .subscribe((autenticado: boolean) => {
        this.isAuthenticated = autenticado;
      });
  }

  buscarDisponibilidad(): void {
    if (!this.fecha || !this.hora || !this.cantidadPersonas) {
      this.error = 'Por favor, complete todos los campos.';
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.buscaRealizada = false;

    const dto: CheckAvailabilityRequestDto = {
      fecha: this.fecha,
      hora: this.hora,
      cantidadPersonas: this.cantidadPersonas
    };

    this.tablesApi.checkAvailability(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.availability = response.data;
          this.isEmpty = !this.availability?.mesasDisponibles?.length;
          this.buscaRealizada = true;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'No se pudo verificar la disponibilidad. Por favor, intente nuevamente.';
          this.isEmpty = true;
          this.buscaRealizada = true;
          this.isLoading = false;
        }
      });
  }

  seleccionarMesa(mesa: Mesa): void {
    if (!this.isAuthenticated) {
      // Guardar contexto y redirigir a login
      sessionStorage.setItem('reserva_mesa_id', mesa.idMesa.toString());
      sessionStorage.setItem('reserva_fecha', this.fecha);
      sessionStorage.setItem('reserva_hora', this.hora);
      sessionStorage.setItem('reserva_personas', this.cantidadPersonas.toString());
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/client/reservas/confirmar/' + mesa.idMesa } });
    } else {
      // Llevar al formulario de confirmación
      this.router.navigate(['/client/reservas/confirmar', mesa.idMesa], {
        state: {
          mesa,
          fecha: this.fecha,
          hora: this.hora,
          cantidadPersonas: this.cantidadPersonas
        }
      });
    }
  }

  limpiarFormulario(): void {
    this.fecha = this.minDate;
    this.hora = '';
    this.cantidadPersonas = 1;
    this.availability = null;
    this.buscaRealizada = false;
    this.error = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
