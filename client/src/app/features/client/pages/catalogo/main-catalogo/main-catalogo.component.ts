import { Component } from '@angular/core';
import { CatalogMarketplacePage } from '../components/catalog-marketplace/catalog-marketplace.page';

@Component({
  selector: 'app-main-catalogo',
  standalone: true,
  imports: [CatalogMarketplacePage],
  templateUrl: './main-catalogo.component.html',
  styleUrl: './main-catalogo.component.scss'
})
export class MainCatalogoComponent {}
