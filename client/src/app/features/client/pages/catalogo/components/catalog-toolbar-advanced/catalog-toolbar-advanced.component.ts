import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type ViewMode = 'grid' | 'large-grid';
export type SortBy = 'relevancia' | 'precio-asc' | 'precio-desc' | 'nombre-asc' | 'nombre-desc' | 'reciente';

interface SortOption {
  value: SortBy;
  label: string;
}

@Component({
  selector: 'app-catalog-toolbar-advanced',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalog-toolbar-advanced.component.html',
  styleUrl: './catalog-toolbar-advanced.component.scss'
})
export class CatalogToolbarAdvancedComponent {
  @Input() viewMode: ViewMode = 'grid';
  @Input() sortBy: SortBy = 'relevancia';
  @Input() filtrosActivos = 0;
  @Input() totalProductos = 0;

  @Output() viewModeChange = new EventEmitter<ViewMode>();
  @Output() sortByChange = new EventEmitter<SortBy>();
  @Output() filtrosToggle = new EventEmitter<void>();
  @Output() limpiarFiltros = new EventEmitter<void>();

  sortOptions: SortOption[] = [
    { value: 'relevancia', label: 'Relevancia' },
    { value: 'precio-asc', label: 'Precio (menor a mayor)' },
    { value: 'precio-desc', label: 'Precio (mayor a menor)' },
    { value: 'nombre-asc', label: 'Nombre (A-Z)' },
    { value: 'nombre-desc', label: 'Nombre (Z-A)' },
    { value: 'reciente', label: 'Más recientes' }
  ];

  onSortChange(value: SortBy): void {
    this.sortBy = value;
    this.sortByChange.emit(value);
  }

  onSortChangeEvent(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.onSortChange(select.value as SortBy);
  }

  onFiltrosToggle(): void {
    this.filtrosToggle.emit();
  }

  onLimpiarFiltros(): void {
    this.limpiarFiltros.emit();
  }

  trackBySort(index: number, option: SortOption): SortBy {
    return option.value;
  }
}
