import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventsPromotionsApi } from '../../../../../../services/apis/events&Promotions.api';
import { EventoDetalleDto } from '../../../../../../domain/events&Promotions/dtos/response/get-event-detail.response.dto';
import { SharedModule } from '../../../../../../shared/shared-module';
import { LayoutModule } from '../../../../../../shared/layout/layout-module';

@Component({
  selector: 'app-events-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, LayoutModule],
  templateUrl: './events-detail.page.html',
  styleUrl: './events-detail.page.scss'
})
export class EventsDetailPage implements OnInit, OnDestroy {
  evento: EventoDetalleDto | null = null;
  
  isLoading = false;
  error: string | null = null;
  mode: 'public' | 'client' = 'client';

  private destroy$ = new Subject<void>();
  private idEvento: number | null = null;

  constructor(
    private eventsApi: EventsPromotionsApi,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['marketplaceMode'] === 'public' ? 'public' : 'client';
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params.get('idEvento');
        if (id && !isNaN(+id)) {
          this.idEvento = +id;
          this.cargarDetalle();
        } else {
          this.error = 'Evento no encontrado.';
        }
      });
  }

  cargarDetalle(): void {
    if (!this.idEvento) {
      this.error = 'ID de evento inválido.';
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.eventsApi.getEventDetail(this.idEvento)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.evento = response.data || null;
          if (!this.evento) {
            this.error = 'Evento no encontrado.';
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'No se pudo cargar el detalle del evento. Por favor intente nuevamente.';
          this.isLoading = false;
        }
      });
  }

  formatearFecha(fecha: string): string {
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return fecha;
    }
  }

  formatearHora(hora: string): string {
    try {
      if (hora.length === 5 && hora.includes(':')) {
        return hora;
      }
      return new Date(`2000-01-01T${hora}`).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return hora;
    }
  }

  volver(): void {
    this.router.navigate([this.mode === 'public' ? '/eventos' : '/client/eventos']);
  }

  irALogin(): void {
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: '/eventos' }
    });
  }

  irARegistro(): void {
    this.router.navigate(['/auth/register']);
  }


  tieneRestricciones(): boolean {
    return !!(this.evento?.restricciones && this.evento.restricciones.length > 0);
  }

  tieneHorarios(): boolean {
    return !!(this.evento?.horarios && this.evento.horarios.length > 0);
  }

  getDay(fecha: string): string {
    try {
      return new Date(fecha).getDate().toString();
    } catch {
      return '';
    }
  }

  getMonth(fecha: string): string {
    try {
      const month = new Date(fecha).toLocaleDateString('es-ES', { month: 'short' });
      return month.charAt(0).toUpperCase() + month.slice(1);
    } catch {
      return '';
    }
  }

  obtenerPromocionesDeHorario(horarios: any[]): any[] {
    const promociones: any[] = [];
    horarios.forEach(h => {
      if (h.promociones) {
        promociones.push(...h.promociones);
      }
    });
    return [...new Map(promociones.map(p => [p.id, p])).values()];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
