import { Component, Input, Output, EventEmitter } from '@angular/core';

const DEFAULT_BUTTON_COLOR = '#D4AF37';

@Component({
  selector: 'ui-button',
  standalone: false,
  templateUrl: './ui-button.html',
  styleUrl: './ui-button.scss'
})
export class UiButton {
  @Input() texto!: string;
  @Output() accion = new EventEmitter<void>();

  @Input() customWidth: string = 'fit-content';
  @Input() tipo: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;
  @Input() borderRadius: string = '5px';
  @Input() variant: 'brand' | 'danger' | 'neutral' | 'success' | 'info' = 'brand';
  @Input() appearance: 'solid' | 'outline' = 'solid';
  @Input() size: 'default' | 'compact' = 'default';
  @Input() fullWidth = false;
  @Input() noBackgroundColor: boolean = false;
  @Input() backgroundColor: string = DEFAULT_BUTTON_COLOR;

  get borderColor(): string {
    return this.resolvedToneColor;
  }

  get currentBackgroundColor(): string {
    return this.isOutlineAppearance ? 'transparent' : this.resolvedToneColor;
  }

  get buttonClasses(): string[] {
    return [
      `ui-btn--${this.variant}`,
      `ui-btn--${this.size}`,
      this.isOutlineAppearance ? 'no-background' : '',
      this.fullWidth ? 'ui-btn--full-width' : ''
    ].filter(Boolean);
  }

  get buttonStyles(): Record<string, string> {
    return {
      width: this.customWidth,
      'border-radius': this.borderRadius,
      'background-color': this.currentBackgroundColor,
      'border-color': this.borderColor,
      '--ui-btn-tone': this.resolvedToneColor,
      '--ui-btn-text-color': this.currentTextColor,
      '--ui-btn-hover-text-color': this.hoverTextColor
    };
  }

  get isOutlineAppearance(): boolean {
    return this.noBackgroundColor || this.appearance === 'outline';
  }

  private get resolvedToneColor(): string {
    if (this.backgroundColor !== DEFAULT_BUTTON_COLOR) {
      return this.backgroundColor;
    }

    switch (this.variant) {
      case 'danger':
        return '#EF4444';
      case 'neutral':
        return '#2B1D13';
      case 'success':
        return '#2ecc71';
      case 'info':
        return '#3B82F6';
      case 'brand':
      default:
        return DEFAULT_BUTTON_COLOR;
    }
  }

  private get currentTextColor(): string {
    if (this.isOutlineAppearance) {
      return '#FFFFFF';
    }

    return this.resolveContrastColor(this.resolvedToneColor);
  }

  private get hoverTextColor(): string {
    return this.resolveContrastColor(this.resolvedToneColor);
  }

  private resolveContrastColor(color: string): string {
    const normalized = color.trim().toUpperCase();
    return normalized === DEFAULT_BUTTON_COLOR || normalized === '#FFFFFF'
      ? '#000000'
      : '#FFFFFF';
  }
}
