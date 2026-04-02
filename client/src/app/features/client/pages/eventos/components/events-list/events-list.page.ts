import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventsPromotionsApi } from '../../../../../../services/apis/events&Promotions.api';
import { UpcomingEventoDto } from '../../../../../../domain/events&Promotions/dtos/response/list-upcoming-events.response.dto';
import { SharedModule } from '../../../../../../shared/shared-module';
import { LayoutModule } from '../../../../../../shared/layout/layout-module';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, LayoutModule],
  templateUrl: './events-list.page.html',
  styleUrl: './events-list.page.scss'
})
export class EventsListPage implements OnInit, OnDestroy {
  eventos: UpcomingEventoDto[] = [];
  eventosFiltered: UpcomingEventoDto[] = [];
  
  isLoading = false;
  error: string | null = null;
  isEmpty = false;
  
  busqueda: string = '';
  eventosMap: Map<number, string> = new Map();
  mode: 'public' | 'client' = 'client';

  private destroy$ = new Subject<void>();

  constructor(
    private eventsApi: EventsPromotionsApi,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['marketplaceMode'] === 'public' ? 'public' : 'client';
    this.cargarEventos();
  }

  irALogin(): void {
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: '/eventos' }
    });
  }

  irARegistro(): void {
    this.router.navigate(['/auth/register']);
  }

  cargarEventos(): void {
    this.isLoading = true;
    this.error = null;

    this.eventsApi.listUpcomingEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.eventos = response.data || [];
          this.eventosFiltered = this.eventos;
          this.isEmpty = this.eventos.length === 0;
          this.construirMapaEventos();
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'No se pudieron cargar los eventos. Por favor intente nuevamente.';
          this.isEmpty = true;
          this.isLoading = false;
        }
      });
  }

  construirMapaEventos(): void {
    const eventosUnicos = new Map<number, string>();
    this.eventos.forEach(e => {
      if (e.evento && e.evento.idEvento) {
        eventosUnicos.set(e.evento.idEvento, e.evento.nombre);
      }
    });
    this.eventosMap = eventosUnicos;
  }

  buscarEventos(): void {
    if (!this.busqueda.trim()) {
      this.eventosFiltered = this.eventos;
      return;
    }

    const searchTerm = this.busqueda.toLowerCase();
    this.eventosFiltered = this.eventos.filter(e => {
      const nombreEvento = e.evento?.nombre || '';
      const fecha = e.fecha || '';
      return nombreEvento.toLowerCase().includes(searchTerm) || 
             fecha.toLowerCase().includes(searchTerm);
    });
  }

  limpiarBusqueda(): void {
    this.busqueda = '';
    this.eventosFiltered = this.eventos;
  }

  verDetalle(idEvento: number | null | undefined): void {
    if (!idEvento) {
      this.error = 'No se puede acceder al detalle de este evento.';
      return;
    }

    const basePath = this.mode === 'public' ? '/eventos' : '/client/eventos';
    this.router.navigate([basePath, idEvento]);
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

  tienePromociones(evento: UpcomingEventoDto): boolean {
    return evento.promociones && evento.promociones.length > 0;
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

  obtenerNombreEvento(idEvento: number | null | undefined): string {
    if (!idEvento) return 'Evento disponible';
    return this.eventosMap.get(idEvento) || 'Evento disponible';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
