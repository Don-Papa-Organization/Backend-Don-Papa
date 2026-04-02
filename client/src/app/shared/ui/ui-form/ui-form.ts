import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, Output, ViewChild, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-ui-form',
  standalone: false,
  templateUrl: './ui-form.html',
  styleUrl: './ui-form.scss'
})
export class UiForm implements AfterViewInit, OnDestroy {
  @Input() titulo?: string;
  @Input() subtitulo?: string;
  @Input() maxWidth: string = '500px';
  @Input() maxHeight: string = '100vh';
  @Input() showFooter: boolean = true;
  @Input() fullWidth: boolean = false;
  @Input() visualTheme: 'default' | 'client-premium' = 'default';
  @Input() autoGridThreshold: number = 5;

  @ViewChild('formRef', { static: false, read: ElementRef }) formElement?: ElementRef<HTMLFormElement>;
  @ViewChild('formRef', { static: false, read: NgForm }) ngForm?: NgForm;

  useAutoGrid = false;
  private mutationObserver?: MutationObserver;

  constructor(private cdr: ChangeDetectorRef) {}

  @Output() formSubmit = new EventEmitter<NgForm>();

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      this.updateAutoGridState();

      const form = this.formElement?.nativeElement;
      if (!form) {
        return;
      }

      this.mutationObserver = new MutationObserver(() => {
        this.updateAutoGridState();
      });

      this.mutationObserver.observe(form, {
        childList: true,
        subtree: false,
        attributes: true,
      });
    });
  }

  ngOnDestroy(): void {
    this.mutationObserver?.disconnect();
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      this.formSubmit.emit(form);
    }
  }

  private updateAutoGridState(): void {
    const form = this.formElement?.nativeElement;
    if (!form) {
      return;
    }

    const componentSelector = [
      'ui-input',
      'app-ui-combobox',
      'app-ui-checkbox',
      'app-ui-image-upload',
      'app-ui-tabla',
      'app-ui-helper-text',
      'ui-button',
      'app-ui-date-time-picker'
    ].join(', ');

    const allComponents = Array.from(form.querySelectorAll(componentSelector)).filter((element) => {
      if (!(element instanceof HTMLElement)) {
        return false;
      }

      return !element.closest('[footer], .form-footer');
    });

    const shouldUseGrid = allComponents.length >= this.autoGridThreshold;

    if (shouldUseGrid !== this.useAutoGrid) {
      this.useAutoGrid = shouldUseGrid;
      this.cdr.detectChanges();
    }
  }
}

