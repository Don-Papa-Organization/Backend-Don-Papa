import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ui-icon-button',
  standalone: false,
  templateUrl: './ui-icon-button.html',
  styleUrl: './ui-icon-button.scss'
})

export class UiIconButton {
  @Input() texto = "";
  @Input() urlIcono = "";
  @Input() link = "";
  @Input() exactMatch = false;

  @Output() action = new EventEmitter<void>();

  @Input() sidebarStyles: boolean = false;
  @Input() customClass: string = "link";
  @Input() fullWidth: boolean = false;
  @Input() showBorder: boolean = false;
  @Input() customHeight: string = "auto";
  @Input() iconSize: string = '40px';
  @Input() hideUnderline: boolean = false;

  onClick(): void {
    this.action.emit();
  }

}
