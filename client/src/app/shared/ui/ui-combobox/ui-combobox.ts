import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';

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
  filteredOptions: Array<{ value: any, label: string }> = [];

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
        this.filteredOptions = this.options;
        this.searchTerm = '';
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: any): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.combobox-container')) {
      this.isDropdownOpen = false;
    }
  }
}
