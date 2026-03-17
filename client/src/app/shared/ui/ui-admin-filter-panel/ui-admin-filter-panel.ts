import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface AdminFiltros {
  busqueda: string;
  estado: any;
  fechaInicio: string;
  fechaFin: string;
  [key: string]: any;
}

export interface FiltroOpcion {
  value: any;
  label: string;
}

@Component({
  selector: 'app-ui-admin-filter-panel',
  standalone: false,
  templateUrl: './ui-admin-filter-panel.html',
  styleUrl: './ui-admin-filter-panel.scss'
})

export class UiAdminFilterPanel implements OnInit, OnDestroy {
  @Input() estadoOpciones: FiltroOpcion[] = [];
  @Input() mostrarFechas: boolean = true;
  @Input() mostrarEstado: boolean = true;
  @Input() labelBusqueda: string = 'Buscar';
  @Input() placeholderBusqueda: string = 'Escribe para buscar...';
  @Input() debounceTime: number = 500; // Tiempo de espera en ms antes de aplicar búsqueda
  @Input() tituloInput: string = "estado"

  @Output() filtrosAplicados = new EventEmitter<AdminFiltros>();
  @Output() filtrosLimpiados = new EventEmitter<void>();

  mostrarModal: boolean = false;
  private busquedaSubject = new Subject<string>();

  filtros: AdminFiltros = {
    busqueda: '',
    estado: null,
    fechaInicio: '',
    fechaFin: ''
  };

  get hayFiltrosActivos(): boolean {
    return !!(
      this.filtros.busqueda ||
      this.filtros.estado ||
      this.filtros.fechaInicio ||
      this.filtros.fechaFin
    );
  }

  ngOnInit(): void {
    // Configurar debounce para la búsqueda
    this.busquedaSubject.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged()
    ).subscribe(() => {
      this.aplicarFiltros();
    });
  }

  ngOnDestroy(): void {
    this.busquedaSubject.complete();
  }

  onBusquedaChange(): void {
    // Emitir el cambio al subject para aplicar debounce
    this.busquedaSubject.next(this.filtros.busqueda);
  }

  abrirModal(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  aplicarFiltros(): void {
    this.filtrosAplicados.emit({ ...this.filtros });
  }

  aplicarFiltrosAvanzados(): void {
    this.filtrosAplicados.emit({ ...this.filtros });
    this.cerrarModal();
  }

  limpiarFiltrosAvanzados(): void {
    // Solo limpiar filtros avanzados, no la búsqueda
    this.filtros.estado = null;
    this.filtros.fechaInicio = '';
    this.filtros.fechaFin = '';
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtros = {
      busqueda: '',
      estado: null,
      fechaInicio: '',
      fechaFin: ''
    };
    this.filtrosLimpiados.emit();
  }
}
