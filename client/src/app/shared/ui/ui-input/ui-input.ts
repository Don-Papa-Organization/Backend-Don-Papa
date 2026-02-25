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
    @Input() placeholder: string = '';
    @Input() tipo: 'text' | 'password' | 'email' | 'number' | 'checkbox' | 'date' = 'text';
    @Input() valorInput: string = '';
    @Input() min?: number;

    @Output() valorInputChange = new EventEmitter<string>();

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
  }
