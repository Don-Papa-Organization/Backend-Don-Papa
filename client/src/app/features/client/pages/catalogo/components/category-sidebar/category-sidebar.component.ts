import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CategoriaProducto } from '../../../../../../domain/inventory/models/categoriaProducto.model';

@Component({
  selector: 'app-category-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-sidebar.component.html',
  styleUrl: './category-sidebar.component.scss'
})
export class CategorySidebarComponent {
  @Input() categories: CategoriaProducto[] = [];
  @Input() selectedCategoryId: number | null = null;
  @Input() categoryCounts: Record<number, number> = {};
  @Input() loading = false;

  @Output() categorySelected = new EventEmitter<number | null>();

  expanded = true;

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }

  selectAll(): void {
    this.categorySelected.emit(null);
  }

  selectCategory(categoryId: number): void {
    this.categorySelected.emit(categoryId);
  }

  trackByCategory(_: number, category: CategoriaProducto): number {
    return category.idCategoria;
  }

  countFor(categoryId: number): number {
    return this.categoryCounts[categoryId] || 0;
  }

  iconFor(categoryName: string): string {
    const normalized = categoryName.trim().toUpperCase();
    const words = normalized.split(/\s+/).filter(Boolean);

    if (!words.length) {
      return 'CG';
    }

    if (words.length === 1) {
      return words[0].slice(0, 2);
    }

    return `${words[0][0]}${words[1][0]}`;
  }
}
