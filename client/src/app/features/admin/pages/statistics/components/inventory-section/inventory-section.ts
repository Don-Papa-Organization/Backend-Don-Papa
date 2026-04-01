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

  // Nuevos inputs para gráficos de pastel
  @Input() top5Labels: string[] = [];
  @Input() top5Data: number[] = [];
  @Input() top3ProductsWithComparison: Array<{id: number, name: string, sales: number, totalSales: number}> = [];
  @Input() totalSales: number = 0;

  topProductsPage = 1;
  topProductsPageSize = 5;

  deadStockPage = 1;
  deadStockPageSize = 10;

  get paginatedTopProducts(): Array<Record<string, string | number>> {
    const start = (this.topProductsPage - 1) * this.topProductsPageSize;
    return this.topProductsRows.slice(start, start + this.topProductsPageSize);
  }

  get topProductsTotalPages(): number {
    return Math.ceil(this.topProductsRows.length / this.topProductsPageSize);
  }

  get topProductsHasMore(): boolean {
    return this.topProductsPage < this.topProductsTotalPages;
  }

  nextTopProducts(): void {
    if (this.topProductsHasMore) this.topProductsPage++;
  }

  prevTopProducts(): void {
    if (this.topProductsPage > 1) this.topProductsPage--;
  }

  get paginatedDeadStock(): Array<Record<string, string | number>> {
    const start = (this.deadStockPage - 1) * this.deadStockPageSize;
    return this.deadStockRows.slice(start, start + this.deadStockPageSize);
  }

  get deadStockTotalPages(): number {
    return Math.ceil(this.deadStockRows.length / this.deadStockPageSize);
  }

  get deadStockHasMore(): boolean {
    return this.deadStockPage < this.deadStockTotalPages;
  }

  nextDeadStock(): void {
    if (this.deadStockHasMore) this.deadStockPage++;
  }

  prevDeadStock(): void {
    if (this.deadStockPage > 1) this.deadStockPage--;
  }
}