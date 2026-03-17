import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ui-pos-topbar',
  standalone: false,
  templateUrl: './ui-pos-topbar.html',
  styleUrl: './ui-pos-topbar.scss'
})
export class UiPosTopbar {
  @Input() autoPrint = true;
  @Input() sidebarOpen = false;

  @Output() recargar = new EventEmitter<void>();
  @Output() autoPrintChange = new EventEmitter<boolean>();
  @Output() logout = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();

  onAutoPrintChange(value: boolean): void {
    this.autoPrint = value;
    this.autoPrintChange.emit(value);
  }
}
