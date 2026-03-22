import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Type definitions (replicate from mesa.model to avoid path resolution issues)
type MesaTipo = 'VIP' | 'Barra' | 'Salon' | 'Varios';
type MesaEstado = 'Disponible' | 'Reservada' | 'Ocupada' | 'Fuera de servicio';

interface Mesa {
    idMesa: number;
    numero: number;
    tipo: MesaTipo;
    estado: MesaEstado;
}

@Component({
  selector: 'app-ui-mesas-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mesas-grid.component.html',
  styleUrl: './mesas-grid.component.scss'
})
export class UiMesasGridComponent {
  @Input() mesasAgrupadas: { [key: string]: Mesa[] } = {};
  @Output() mesaSeleccionada = new EventEmitter<Mesa>();

  tiposOrden = ['Barra', 'VIP', 'Salon'];

  onClickMesa(mesa: Mesa): void {
    if (mesa.estado === 'Disponible') {
      this.mesaSeleccionada.emit(mesa);
    }
  }

  /**
   * Retorna class CSS según estado de la mesa
   */
  getEstadoClass(estado: MesaEstado): string {
    switch (estado) {
      case 'Disponible':
        return 'estado-disponible';
      case 'Ocupada':
        return 'estado-ocupada';
      case 'Reservada':
        return 'estado-reservada';
      case 'Fuera de servicio':
        return 'estado-fuera-servicio';
      default:
        return '';
    }
  }

  /**
   * Label del estado
   */
  getEstadoLabel(estado: MesaEstado): string {
    switch (estado) {
      case 'Disponible':
        return '✓ Disponible';
      case 'Ocupada':
        return '× Ocupada';
      case 'Reservada':
        return '⊕ Reservada';
      case 'Fuera de servicio':
        return '⚠ Fuera de servicio';
      default:
        return estado;
    }
  }

  /**
   * Determina si la mesa es clickeable
   */
  isClickeable(mesa: Mesa): boolean {
    return mesa.estado === 'Disponible';
  }
}
