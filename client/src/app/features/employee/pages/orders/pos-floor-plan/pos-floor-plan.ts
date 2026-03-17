import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MesaEnriquecida } from '../main-orders/main-orders';

@Component({
  selector: 'app-pos-floor-plan',
  standalone: false,
  templateUrl: './pos-floor-plan.html',
  styleUrl: './pos-floor-plan.scss'
})
export class PosFloorPlanComponent {
  @Input() grupos: Record<'salon' | 'barra' | 'vip' | 'varios', MesaEnriquecida[]> = {
    salon: [],
    barra: [],
    vip: [],
    varios: []
  };

  @Output() mesaClick = new EventEmitter<MesaEnriquecida>();
  @Output() mesaToggleEstado = new EventEmitter<MesaEnriquecida>();
  @Output() confirmarReserva = new EventEmitter<number>();
}
