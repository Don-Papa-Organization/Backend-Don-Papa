import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TablesReservesApi } from '../../../../../../services/apis/tables&Reserves.api';
import { UsersApi } from '../../../../../../services/apis/users.api';
import { Mesa } from '../../../../../../domain/tables&Reserves/models/mesa.model';
import { AuthProfileResponseDto } from '../../../../../../domain/users/dtos/response/auth-profile.response.dto';
import { ReserveTableRequestDto } from '../../../../../../domain/tables&Reserves/dtos/request/reserve-table.request.dto';
import { SharedModule } from '../../../../../../shared/shared-module';

@Component({
  selector: 'app-reserve-table',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './reserve-table.page.html',
  styleUrl: './reserve-table.page.scss'
})
export class ReserveTablePage implements OnInit, OnDestroy {
  idMesa: number | null = null;
  mesa: Mesa | null = null;
  
  fechaReserva: string = '';
  cantidadPersonas: number = 1;
  
  isLoading = false;
  isSubmitting = false;
  error: string | null = null;
  success = false;
  mostrarToastBloqueoPerfil = false;
  readonly mensajePerfilIncompleto = 'Informacion de perfil incompleta o no diligenciada, por favor llena la informacion de tu perfil';

  personasOptions: number[] = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20];
  minDate: string = '';

  reservasCount = 0;

  private destroy$ = new Subject<void>();
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tablesApi: TablesReservesApi,
    private usersApi: UsersApi
  ) {}

  ngOnInit(): void {
    this.setearMinDate();
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.idMesa = params['idMesa'] ? +params['idMesa'] : null;
      if (this.idMesa) {
        this.cargarMesa();
        this.llenarDatosGuardados();
      }
    });
  }

  setearMinDate(): void {
    const hoy = new Date();
    const dd = String(hoy.getDate()).padStart(2, '0');
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const yyyy = hoy.getFullYear();
    this.minDate = `${yyyy}-${mm}-${dd}`;
  }

  cargarMesa(): void {
    if (!this.idMesa) return;
    
    this.isLoading = true;
    this.tablesApi.getTable(this.idMesa)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.mesa = response.data || null;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'No se pudo cargar la información de la mesa.';
          this.isLoading = false;
        }
      });
  }

  llenarDatosGuardados(): void {
    const mesaIdGuardada = sessionStorage.getItem('reserva_mesa_id');
    const fechaGuardada = sessionStorage.getItem('reserva_fecha');
    const horaGuardada = sessionStorage.getItem('reserva_hora');
    const personasGuardada = sessionStorage.getItem('reserva_personas');

    if (fechaGuardada) this.fechaReserva = fechaGuardada;
    if (personasGuardada) this.cantidadPersonas = +personasGuardada;

    // Limpiar session storage
    sessionStorage.removeItem('reserva_mesa_id');
    sessionStorage.removeItem('reserva_fecha');
    sessionStorage.removeItem('reserva_hora');
    sessionStorage.removeItem('reserva_personas');
  }

  confirmarReserva(): void {
    if (!this.fechaReserva || !this.cantidadPersonas || !this.idMesa) {
      this.error = 'Por favor, complete todos los campos.';
      return;
    }

    this.validarPerfilYReservar();
  }

  irACuentaPorBloqueo(): void {
    this.cerrarToastBloqueo();
    this.router.navigate(['/client/perfil']);
  }

  cerrarToastBloqueo(): void {
    this.mostrarToastBloqueoPerfil = false;
    this.clearToastTimer();
  }

  private validarPerfilYReservar(): void {
    this.error = null;

    this.usersApi
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profileResponse) => {
          if (!profileResponse.success || !profileResponse.data) {
            this.error = profileResponse.message || 'No se pudo validar el perfil para confirmar la reserva.';
            return;
          }

          if (!this.esPerfilCompleto(profileResponse.data)) {
            this.mostrarToastPerfilIncompleto();
            return;
          }

          const idCliente = this.obtenerIdCliente(profileResponse.data);
          if (!idCliente) {
            this.error = 'No se pudo identificar el cliente para confirmar la reserva.';
            return;
          }

          this.ejecutarConfirmacionReserva(idCliente);
        },
        error: (err) => {
          this.error = err?.error?.message || 'No se pudo validar el perfil para confirmar la reserva.';
        }
      });
  }

  private ejecutarConfirmacionReserva(idCliente: number): void {
    if (!this.idMesa) {
      this.error = 'No se encontro la mesa seleccionada para reservar.';
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const fechaReservaIso = this.construirFechaReservaIsoSeguro(this.fechaReserva);
    if (!fechaReservaIso) {
      this.error = 'Debes seleccionar una fecha válida para la reserva.';
      this.isSubmitting = false;
      return;
    }

    const dto: ReserveTableRequestDto = {
      idMesa: this.idMesa,
      fechaReserva: fechaReservaIso,
      cantidadPersonas: this.cantidadPersonas,
      idCliente
    };

    this.tablesApi.reserveTable(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.success = true;
          this.isSubmitting = false;
          setTimeout(() => {
            this.router.navigate(['/client/reservas/historial']);
          }, 2000);
        },
        error: (err) => {
          this.error = err?.error?.message || 'No se pudo completar la reserva. Por favor, intente nuevamente.';
          this.isSubmitting = false;
        }
      });
  }

  private construirFechaReservaIsoSeguro(fecha: string): string | null {
    if (!fecha) return null;

    const ahora = new Date();
    const esHoy = fecha === this.minDate;
    const horaBase = esHoy ? Math.min(23, ahora.getHours() + 1) : 19;
    const fechaHoraLocal = new Date(`${fecha}T${String(horaBase).padStart(2, '0')}:00:00`);

    if (Number.isNaN(fechaHoraLocal.getTime())) return null;
    return fechaHoraLocal.toISOString();
  }

  private obtenerIdCliente(profile: AuthProfileResponseDto): number | null {
    return typeof profile.id === 'number' && profile.id > 0 ? profile.id : null;
  }

  private esPerfilCompleto(profile: AuthProfileResponseDto): boolean {
    const nombre = profile.cliente?.nombre?.trim() || '';
    const direccion = profile.cliente?.direccion?.trim() || '';
    const telefono = profile.cliente?.telefono?.trim() || '';
    const telefonoValido = /^\d{10}$/.test(telefono);
    return !!nombre && !!direccion && telefonoValido;
  }

  private mostrarToastPerfilIncompleto(): void {
    this.mostrarToastBloqueoPerfil = true;
    this.clearToastTimer();

    this.toastTimer = setTimeout(() => {
      this.mostrarToastBloqueoPerfil = false;
      this.toastTimer = null;
    }, 5000);
  }

  private clearToastTimer(): void {
    if (!this.toastTimer) {
      return;
    }

    clearTimeout(this.toastTimer);
    this.toastTimer = null;
  }

  cancelar(): void {
    this.router.navigate(['/client/reservas/disponibilidad']);
  }

  ngOnDestroy(): void {
    this.clearToastTimer();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
