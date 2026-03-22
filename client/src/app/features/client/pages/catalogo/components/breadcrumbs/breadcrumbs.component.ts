import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  route?: string;
  queryParams?: Record<string, any>;
  active?: boolean;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.scss'
})
export class BreadcrumbsComponent {
  @Input() items: BreadcrumbItem[] = [];

  constructor(private router: Router) {}

  navigate(item: BreadcrumbItem): void {
    if (item.route && !item.active) {
      this.router.navigate([item.route], { queryParams: item.queryParams });
    }
  }

  get displayItems(): BreadcrumbItem[] {
    return this.items.length > 0 ? this.items : [{ label: 'Catálogo', active: true }];
  }
}
