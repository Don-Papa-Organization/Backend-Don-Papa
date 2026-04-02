import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { TablesReservesApi } from '../../../../../../services/apis/tables&Reserves.api';
import { CheckAvailabilityRequestDto } from '../../../../../../domain/tables&Reserves/dtos/request/check-availability.request.dto';
import { AvailabilityDataDto } from '../../../../../../domain/tables&Reserves/dtos/response/check-availability.response.dto';
import { Mesa } from '../../../../../../domain/tables&Reserves/models/mesa.model';
import { selectIsAuthenticated } from '../../../../../../domain/auth/state/auth.selectors';
import { SharedModule } from '../../../../../../shared/shared-module';
import { LayoutModule } from '../../../../../../shared/layout/layout-module';

@Component({
  selector: 'app-mesas-check-availability',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, LayoutModule],
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
  mode: 'public' | 'client' = 'client';
  isPublicMode = false;
  estadoSeleccionado = '';
  tableSearchId = '';
  mesasListado: Mesa[] = [];
  mesaDetalle: Mesa | null = null;
  loadingMesas = false;
  loadingDetalle = false;
  errorMesas: string | null = null;
  errorDetalle: string | null = null;
  readonly estadosMesa = ['Disponible', 'Reservada', 'Ocupada', 'Fuera de servicio'];
  private destroy$ = new Subject<void>();

  constructor(
    private tablesApi: TablesReservesApi,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['marketplaceMode'] === 'public' ? 'public' : 'client';
    this.isPublicMode = this.mode === 'public';
    this.setearMinDate();
    this.generarHoras();
    this.verificarAutenticacion();
    this.cargarMesas();
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
    if (this.isPublicMode) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/reservas' } });
      return;
    }

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

  irALogin(): void {
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: '/reservas' }
    });
  }

  irARegistro(): void {
    this.router.navigate(['/auth/register']);
  }

  cargarMesas(): void {
    this.loadingMesas = true;
    this.errorMesas = null;

    this.tablesApi.listTables()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.errorMesas = response.message || 'No se pudieron cargar las mesas.';
            this.mesasListado = [];
            this.loadingMesas = false;
            return;
          }

          this.mesasListado = response.data.mesas || [];
          this.loadingMesas = false;
        },
        error: () => {
          this.errorMesas = 'No se pudieron cargar las mesas.';
          this.mesasListado = [];
          this.loadingMesas = false;
        }
      });
  }

  filtrarMesasPorEstado(): void {
    this.loadingMesas = true;
    this.errorMesas = null;

    const request$ = this.estadoSeleccionado
      ? this.tablesApi.listTablesByStatus(this.estadoSeleccionado)
      : this.tablesApi.listTables();

    request$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.errorMesas = response.message || 'No se pudieron filtrar las mesas.';
            this.mesasListado = [];
            this.loadingMesas = false;
            return;
          }

          this.mesasListado = response.data.mesas || [];
          this.loadingMesas = false;
        },
        error: () => {
          this.errorMesas = 'No se pudieron filtrar las mesas.';
          this.mesasListado = [];
          this.loadingMesas = false;
        }
      });
  }

  buscarMesaPorId(): void {
    const idMesa = Number(this.tableSearchId);
    if (!idMesa) {
      this.errorDetalle = 'Ingresa un id de mesa valido.';
      this.mesaDetalle = null;
      return;
    }

    this.loadingDetalle = true;
    this.errorDetalle = null;

    this.tablesApi.getTable(idMesa)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.errorDetalle = response.message || 'No se encontro la mesa.';
            this.mesaDetalle = null;
            this.loadingDetalle = false;
            return;
          }

          this.mesaDetalle = response.data;
          this.loadingDetalle = false;
        },
        error: () => {
          this.errorDetalle = 'No se pudo consultar la mesa.';
          this.mesaDetalle = null;
          this.loadingDetalle = false;
        }
      });
  }

  limpiarFormulario(): void {
    this.fecha = this.minDate;
    this.hora = '';
    this.cantidadPersonas = 1;
    this.availability = null;
    this.buscaRealizada = false;
    this.error = null;
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
