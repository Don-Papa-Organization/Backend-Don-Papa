import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnDestroy, ElementRef, ChangeDetectorRef } from '@angular/core';
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

  @ViewChild('formRef', { static: false, read: ElementRef }) formElement?: ElementRef;
  @ViewChild('formRef', { static: false, read: NgForm }) ngForm?: NgForm;

  hasOverflow = false;
  private resizeObserver?: ResizeObserver;

  @Output() formSubmit = new EventEmitter<NgForm>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.checkOverflow();
      
      this.resizeObserver = new ResizeObserver(() => {
        this.checkOverflow();
      });
      if (this.formElement?.nativeElement) {
        this.resizeObserver.observe(this.formElement.nativeElement);
      }
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private checkOverflow(): void {
    const form = this.formElement?.nativeElement;
    
    if (form && this.maxHeight !== 'fit-content' && this.maxHeight !== '100vh') {
      const heightValue = this.parseHeightToPx(this.maxHeight);
      const scrollH = form.scrollHeight;
      const hasOverflowNow = scrollH > heightValue;
      
      if (hasOverflowNow !== this.hasOverflow) {
        this.hasOverflow = hasOverflowNow;
        this.cdr.detectChanges();
        
        // Desuscribirse del ResizeObserver después de detectar cambio para evitar loop
        if (this.resizeObserver) {
          this.resizeObserver.disconnect();
        }
      }
    }
  }

  private parseHeightToPx(height: string): number {
    if (height.endsWith('vh')) {
      const vh = parseFloat(height) * (window.innerHeight / 100);
      return vh;
    } else if (height.endsWith('px')) {
      return parseFloat(height);
    }
    return Infinity;
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      this.formSubmit.emit(form);
    }
  }
}

