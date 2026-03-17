import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UpdateProductRequestDto } from '../../../../../../domain/inventory/dtos/request/update-product.request.dto';

@Component({
  selector: 'app-editar-form',
  standalone: false,
  templateUrl: './editar-form.html',
  styleUrl: './editar-form.scss'
})
export class EditarForm implements OnChanges {
  @Input() mostrar: boolean = false;
  @Input() categoriasOptions: Array<{ value: any, label: string }> = [];
  @Input() showTextStyle: boolean = true;
  @Input() registroSeleccionado: any;

  @Output() cerrar = new EventEmitter<void>();
  @Output() productoActualizado = new EventEmitter<UpdateProductRequestDto>();

  formSubmitted = false;

  productoEditado: UpdateProductRequestDto = {
    nombre: '',
    precio: 0,
    stockActual: 0,
    stockMinimo: 0,
    descripcion: '',
    activo: true,
    idCategoria: 0
  };

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['registroSeleccionado'] && this.registroSeleccionado) {
      this.productoEditado = {
        nombre: this.registroSeleccionado.nombre || '',
        precio: this.registroSeleccionado.precio || 0,
        stockActual: this.registroSeleccionado.stockActual || 0,
        stockMinimo: this.registroSeleccionado.stockMinimo || 0,
        descripcion: this.registroSeleccionado.descripcion === 'N/A' ? '' : this.registroSeleccionado.descripcion || '',
        activo: this.registroSeleccionado.activo !== undefined ? this.registroSeleccionado.activo : true,
        idCategoria: this.registroSeleccionado.idCategoria || 0
      };
    }
  }

  onCerrar(): void {
    this.formSubmitted = false;
    this.cerrar.emit();
  }

  actualizarProducto(): void {
    this.formSubmitted = true;
    const dto: UpdateProductRequestDto = {
      nombre: this.productoEditado.nombre,
      precio: Number(this.productoEditado.precio),
      stockActual: Number(this.productoEditado.stockActual),
      stockMinimo: Number(this.productoEditado.stockMinimo),
      descripcion: this.productoEditado.descripcion || null,
      activo: this.productoEditado.activo,
      idCategoria: Number(this.productoEditado.idCategoria)
    };

    this.productoActualizado.emit(dto);
    this.onCerrar();
  }
}
