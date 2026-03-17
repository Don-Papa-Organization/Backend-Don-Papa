import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ui-pos-table-card',
  standalone: false,
  templateUrl: './ui-pos-table-card.html',
  styleUrl: './ui-pos-table-card.scss'
})
export class UiPosTableCard {
  @Input() numeroMesa = '';
  @Input() estadoVisual: 'Disponible' | 'Ocupada' | 'Otro' = 'Otro';
  @Input() tipoMesa: 'salon' | 'barra' | 'vip' | 'varios' | 'otro' = 'otro';
  @Input() tiempoOcupada = '--:--';
  @Input() density: 'default' | 'compact' = 'default';

  @Output() abrir = new EventEmitter<void>();

  get tableImageClass(): string {
    return `mesa-img--${this.tipoMesa}`;
  }

  get hostClasses(): string[] {
    return [
      `mesa-card--density-${this.density}`,
      this.estadoVisual === 'Ocupada' ? 'mesa-card--ocupada' : '',
      this.estadoVisual === 'Disponible' ? 'mesa-card--disponible' : ''
    ].filter(Boolean);
  }

  onCardKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.abrir.emit();
    }
  }
}
