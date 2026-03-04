import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-inventory-section',
  standalone: false,
  templateUrl: './inventory-section.html',
  styleUrl: './inventory-section.scss'
})
export class InventorySectionComponent {
  @Input() topProductsLoading = false;
  @Input() topProductsError: string | null = null;
  @Input() topProductsRows: Array<Record<string, string | number>> = [];

  @Input() deadStockLoading = false;
  @Input() deadStockError: string | null = null;
  @Input() deadStockRows: Array<Record<string, string | number>> = [];
}
