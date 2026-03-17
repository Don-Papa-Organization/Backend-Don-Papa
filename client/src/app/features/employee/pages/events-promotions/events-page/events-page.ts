import { Component, OnInit } from '@angular/core';
import { EventsPromotionsFacade } from '../services/events-promotions.facade';
import { UpcomingEventoDto } from '../../../../../domain/events&Promotions/dtos/response/list-upcoming-events.response.dto';
import { EventoDetalleDto } from '../../../../../domain/events&Promotions/dtos/response/get-event-detail.response.dto';
import { Promocion } from '../../../../../domain/events&Promotions/models/promocion.model';
import { Evento } from '../../../../../domain/events&Promotions/models/evento.model';

@Component({
  selector: 'app-events-page',
  standalone: false,
  templateUrl: './events-page.html',
  styleUrl: './events-page.scss'
})
export class EventsPageComponent implements OnInit {
  private readonly fechaLargaFormatter = new Intl.DateTimeFormat('es-CO', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  private readonly fechaCortaFormatter = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // ── Próximos eventos ─────────────────────────────────────────
  eventosProximos: UpcomingEventoDto[] = [];
  cargandoEventos = true;
  errorEventos = '';

  // ── Búsqueda ─────────────────────────────────────────────────
  busqueda = '';
  resultadosBusqueda: Evento[] = [];
  buscando = false;
  modoResultados = false;

  // ── Promociones activas ──────────────────────────────────────
  promociones: Promocion[] = [];
  cargandoPromociones = true;
  errorPromociones = '';

  // ── Modal evento ─────────────────────────────────────────────
  detalleEvento: EventoDetalleDto | null = null;
  mostrarModalEvento = false;
  cargandoDetalle = false;

  // ── Modal promoción ──────────────────────────────────────────
  detallePromocion: Promocion | null = null;
  mostrarModalPromocion = false;
  cargandoDetallePromo = false;

  constructor(private facade: EventsPromotionsFacade) {}

  ngOnInit(): void {
    this.cargarEventosProximos();
    this.cargarPromociones();
  }

  cargarEventosProximos(): void {
    this.cargandoEventos = true;
    this.errorEventos = '';
    this.facade.listUpcomingEvents().subscribe({
      next: (response) => {
        this.eventosProximos = response.data ?? [];
        this.cargandoEventos = false;
      },
      error: () => {
        this.errorEventos = 'No se pudieron cargar los eventos.';
        this.cargandoEventos = false;
      }
    });
  }

  cargarPromociones(): void {
    this.cargandoPromociones = true;
    this.errorPromociones = '';
    this.facade.listActivePromotions(true).subscribe({
      next: (response) => {
        this.promociones = response.data ?? [];
        this.cargandoPromociones = false;
      },
      error: () => {
        this.errorPromociones = 'No se pudieron cargar las promociones.';
        this.cargandoPromociones = false;
      }
    });
  }

  buscarEventos(): void {
    const q = this.busqueda.trim();
    if (!q) {
      this.modoResultados = false;
      this.resultadosBusqueda = [];
      return;
    }
    this.buscando = true;
    this.modoResultados = true;
    this.facade.searchEvents({ busqueda: q }).subscribe({
      next: (response) => {
        this.resultadosBusqueda = response.data ?? [];
        this.buscando = false;
      },
      error: () => {
        this.resultadosBusqueda = [];
        this.buscando = false;
      }
    });
  }

  limpiarBusqueda(): void {
    this.busqueda = '';
    this.modoResultados = false;
    this.resultadosBusqueda = [];
  }

  verDetalleEvento(idEvento: number): void {
    this.cargandoDetalle = true;
    this.mostrarModalEvento = true;
    this.detalleEvento = null;
    this.facade.getEventDetail(idEvento).subscribe({
      next: (response) => {
        this.detalleEvento = response.data ?? null;
        this.cargandoDetalle = false;
      },
      error: () => {
        this.cargandoDetalle = false;
        this.mostrarModalEvento = false;
      }
    });
  }

  cerrarModalEvento(): void {
    this.mostrarModalEvento = false;
    this.detalleEvento = null;
  }

  verDetallePromocion(idPromocion: number): void {
    this.cargandoDetallePromo = true;
    this.mostrarModalPromocion = true;
    this.detallePromocion = null;
    this.facade.getPromotion(idPromocion).subscribe({
      next: (response) => {
        this.detallePromocion = response.data ?? null;
        this.cargandoDetallePromo = false;
      },
      error: () => {
        this.cargandoDetallePromo = false;
        this.mostrarModalPromocion = false;
      }
    });
  }

  cerrarModalPromocion(): void {
    this.mostrarModalPromocion = false;
    this.detallePromocion = null;
  }

  formatFechaEventoCard(fecha: string | null | undefined): string {
    const parsed = this.parseDate(fecha);
    if (!parsed) {
      return fecha || '--';
    }

    return this.fechaLargaFormatter.format(parsed);
  }

  formatHoraCorta(hora: string | null | undefined): string {
    if (!hora) {
      return '--:--';
    }

    const horaLimpia = String(hora).trim();

    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(horaLimpia)) {
      const partes = horaLimpia.split(':');
      const hh = partes[0].padStart(2, '0');
      const mm = partes[1] || '00';
      return `${hh}:${mm}`;
    }

    const parsed = new Date(horaLimpia);
    if (Number.isNaN(parsed.getTime())) {
      return horaLimpia;
    }

    return parsed.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  formatRangoFechasPromocion(fechaInicio: string | null | undefined, fechaFin: string | null | undefined): string {
    const inicio = this.parseDate(fechaInicio);
    const fin = this.parseDate(fechaFin);

    if (!inicio && !fin) {
      return '--';
    }

    if (inicio && fin) {
      return `${this.fechaCortaFormatter.format(inicio)} - ${this.fechaCortaFormatter.format(fin)}`;
    }

    return this.fechaCortaFormatter.format((inicio || fin) as Date);
  }

  formatFechaModal(fecha: string | null | undefined): string {
    return this.formatFechaEventoCard(fecha);
  }

  formatFechaCortaModal(fecha: string | null | undefined): string {
    const parsed = this.parseDate(fecha);
    if (!parsed) {
      return fecha || '--';
    }

    return this.fechaCortaFormatter.format(parsed);
  }

  private parseDate(fecha: string | null | undefined): Date | null {
    if (!fecha) {
      return null;
    }

    const raw = String(fecha).trim();
    const safeRaw = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00` : raw;
    const parsed = new Date(safeRaw);

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  }
}
