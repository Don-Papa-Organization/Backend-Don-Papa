import { Component, Input, Output, EventEmitter } from '@angular/core';

export type PosFloorMesaZona = 'salon' | 'barra' | 'vip' | 'varios';
export type PosFloorMesaEstado = 'Disponible' | 'Ocupada' | 'Otro';

@Component({
  selector: 'app-ui-pos-floor-mesa',
  standalone: false,
  templateUrl: './ui-pos-floor-mesa.html',
  styleUrl: './ui-pos-floor-mesa.scss'
})
export class UiPosFloorMesa {
  @Input({ required: true }) nombreMesa!: string;
  /** Zona que controla la forma y posición visual de la mesa en el plano */
  @Input() zona: PosFloorMesaZona = 'salon';
  @Input() estadoVisual: PosFloorMesaEstado = 'Disponible';
  @Input() tiempoOcupada: string = '--:--';
  @Input() tieneReserva = false;
  @Input() franjaReserva = '';
  @Input() puedeConfirmar = false;
  @Input() idReserva: number | null = null;

  @Output() mesaClick = new EventEmitter<void>();
  @Output() estadoToggle = new EventEmitter<void>();
  @Output() confirmarReserva = new EventEmitter<number>();

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.mesaClick.emit();
    }
  }

  onToggleEstado(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.estadoToggle.emit();
  }

  onConfirmarReserva(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.idReserva !== null) {
      this.confirmarReserva.emit(this.idReserva);
    }
  }
}
