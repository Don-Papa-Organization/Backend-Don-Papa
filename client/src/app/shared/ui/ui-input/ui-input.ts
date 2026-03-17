  import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
  import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

  @Component({
    selector: 'ui-input',
    standalone: false,
    templateUrl: './ui-input.html',
    styleUrl: './ui-input.scss',
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => UiInput),
        multi: true
      }
    ]
  })
  export class UiInput implements ControlValueAccessor {
    @Input() tituloInput: string = '';
    @Input() showLabel: boolean = true;
    @Input() placeholder: string = '';
    @Input() tipo: 'text' | 'password' | 'email' | 'number' | 'checkbox' | 'date' = 'text';
    @Input() valorInput: string = '';
    @Input() min?: number;
    @Input() density: 'default' | 'compact' = 'default';
    @Input() stretch: boolean = false;
    @Input() theme: 'default' | 'pos' = 'default';

    @Output() valorInputChange = new EventEmitter<string>();
    @Output() enterPress = new EventEmitter<void>();

    value = '';
    isDisabled = false;

    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    writeValue(value: string | null): void {
      this.value = value ?? '';
      this.valorInput = this.value;
    }

    registerOnChange(fn: (value: string) => void): void {
      this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
      this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
      this.isDisabled = isDisabled;
    }

    onInput(event: Event): void {
      const value = (event.target as HTMLInputElement).value;
      this.value = value;
      this.valorInput = value;
      this.valorInputChange.emit(value);
      this.onChange(value);
      this.onTouched();
    }

    onEnterPressed(): void {
      this.enterPress.emit();
    }

    get containerClasses(): string[] {
      return [
        `input-container--${this.density}`,
        `input-container--theme-${this.theme}`,
        this.stretch ? 'input-container--stretch' : ''
      ].filter(Boolean);
    }
  }
