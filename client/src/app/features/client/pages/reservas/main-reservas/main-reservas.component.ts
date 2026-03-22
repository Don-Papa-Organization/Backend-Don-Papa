import { Component } from '@angular/core';
import { CatalogMesasPage } from '../../catalogo/components/catalog-mesas/catalog-mesas.page';

@Component({
  selector: 'app-main-reservas',
  standalone: true,
  imports: [CatalogMesasPage],
  templateUrl: './main-reservas.component.html',
  styleUrl: './main-reservas.component.scss'
})
export class MainReservasComponent {}
