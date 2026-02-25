import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-ui-combobox',
  standalone: false,
  templateUrl: './ui-combobox.html',
  styleUrl: './ui-combobox.scss'
})
export class UiCombobox {
  @Input() tituloInput: string = 'Selecciona una opción';
  @Input() options: Array<{ value: any, label: string }> = [];
  @Input() isDisabled: boolean = false;
  @Input() selectedOption: any;

  searchTerm: string = '';
  isDropdownOpen: boolean = false;
  dropdownDirection: 'down' | 'up' = 'down';
  maxDropdownHeight: string = '250px';
  filteredOptions: Array<{ value: any, label: string }> = [];

  constructor(private elementRef: ElementRef, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.filteredOptions = this.options;
  }

  ngOnChanges(changes: any): void {
    console.log('UiCombobox changes:', changes);
    if (changes.options) {
      console.log('Nuevas opciones recibidas:', this.options);
      this.filteredOptions = this.options;
      this.filterOptions();
    }
  }

  @Output() selectedOptionChange = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any>();

  filterOptions(): void {
    if (!this.searchTerm.trim()) {
      this.filteredOptions = this.options;
    } else {
      this.filteredOptions = this.options.filter(option =>
        option.label.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.filterOptions();
    this.isDropdownOpen = true;
  }

  onSelectChange(option: { value: any, label: string }): void {
    this.selectedOption = option.value;
    this.searchTerm = option.label;
    this.isDropdownOpen = false;
    this.selectedOptionChange.emit(option.value);
    this.selectionChange.emit(option.value);
  }

  toggleDropdown(): void {
    if (!this.isDisabled) {
      this.isDropdownOpen = !this.isDropdownOpen;
      if (this.isDropdownOpen) {
        this.calculateDropdownPosition();
        this.filteredOptions = this.options;
        this.searchTerm = '';
      }
    }
  }

  private calculateDropdownPosition(): void {
    const hostElement = this.elementRef.nativeElement;
    const inputElement = hostElement.querySelector('.combobox-search-wrapper');
    if (!inputElement) return;

    const rect = inputElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Prefer downward, but switch to upward if space is tight below and better above
    if (spaceBelow < 250 && spaceAbove > spaceBelow) {
      this.dropdownDirection = 'up';
      this.maxDropdownHeight = `${Math.max(100, spaceAbove - 20)}px`;
    } else {
      this.dropdownDirection = 'down';
      this.maxDropdownHeight = `${Math.max(100, spaceBelow - 20)}px`;
    }

    // Also consider the parent .formulario scroll container if needed, 
    // but window height is usually the ultimate constraint in a modal.
    this.cdr.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: any): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.combobox-container')) {
      this.isDropdownOpen = false;
    }
  }
}
