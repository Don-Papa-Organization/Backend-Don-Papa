import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogMesasPage } from '../../catalogo/components/catalog-mesas/catalog-mesas.page';
import { ReservationHistoryPage } from '../components/reservation-history/reservation-history.page';
import { SharedModule } from '../../../../../shared/shared-module';
import type { TabItem } from '../../../../../shared/ui/ui-tabs/ui-tabs';

@Component({
  selector: 'app-main-reservas',
  standalone: true,
  imports: [CommonModule, CatalogMesasPage, ReservationHistoryPage, SharedModule],
  templateUrl: './main-reservas.component.html',
  styleUrl: './main-reservas.component.scss'
})
export class MainReservasComponent {
  tabs: TabItem[] = [
    { id: 'mesas', label: 'Mesas' },
    { id: 'mis-reservas', label: 'Mis reservas' }
  ];

  tabActiva = 'mesas';

  cambiarTab(tabId: string): void {
    this.tabActiva = tabId;
  }
}
