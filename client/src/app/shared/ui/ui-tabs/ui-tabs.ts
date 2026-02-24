import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
}

@Component({
  selector: 'app-ui-tabs',
  standalone: false,
  templateUrl: './ui-tabs.html',
  styleUrl: './ui-tabs.scss'
})
export class UiTabs {
  @Input() tabItems: TabItem[] = [];
  @Input() tabActiva: string = '';
  @Output() tabChange = new EventEmitter<string>();

  onTabChange(tabId: string): void {
    this.tabActiva = tabId;
    this.tabChange.emit(tabId);
  }
}
