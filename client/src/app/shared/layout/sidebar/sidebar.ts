import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuItem } from '../../interfaces/menu-item';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  private static readonly DEFAULT_WIDTH = '16rem';

  @Input() menuItems: MenuItem[] = [];
  @Input() collapsed = false;
  @Input() titulo = 'Administración';
  @Input() showLogo = true;
  @Input() collapseMode: 'partial' | 'full' = 'partial';
  @Input() width: string = "16rem";
  @Output() toggleCollapsed = new EventEmitter<void>();

  onToggle(): void {
    this.toggleCollapsed.emit();
  }

  get isFullCollapsed(): boolean {
    return this.collapsed && this.collapseMode === 'full';
  }

}
