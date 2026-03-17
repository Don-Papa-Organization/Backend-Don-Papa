import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CreateProductRequestDto } from '../../../../../../domain/inventory/dtos/request/create-product.request.dto';
import { UiImageUpload } from '../../../../../../shared/ui/ui-image-upload/ui-image-upload';

@Component({
  selector: 'app-agregar-form',
  standalone: false,
  templateUrl: './agregar-form.html',
  styleUrl: './agregar-form.scss'
})
export class AgregarForm {
  @Input() mostrar: boolean = false;
  @Input() categoriasOptions: Array<{ value: any, label: string }> = [];
  @Input() showTextStyle: boolean = true;

  @Output() cerrar = new EventEmitter<void>();
  @Output() productoCreado = new EventEmitter<{ dto: CreateProductRequestDto, imagen: File | null }>();

  /** Referencia al componente de imagen para poder llamar uploadImage() */
  @ViewChild(UiImageUpload) imageUpload?: UiImageUpload;

  productoNuevo: CreateProductRequestDto = {
    nombre: '',
    precio: 0,
    stockActual: 0,
    stockMinimo: 0,
    activo: true,
    descripcion: '',
    idCategoria: 0
  };

  /** Archivo seleccionado por el usuario */
  imagenPendiente: File | null = null;

  formSubmitted = false;

  constructor() { }

  onCerrar(): void {
    this.imagenPendiente = null;
    this.cerrar.emit();
  }

  onArchivoSeleccionado(file: File): void {
    this.imagenPendiente = file;
  }

  crearProducto(): void {
    this.formSubmitted = true;
    const dto: CreateProductRequestDto = {
      nombre: this.productoNuevo.nombre,
      precio: Number(this.productoNuevo.precio),
      stockActual: Number(this.productoNuevo.stockActual),
      stockMinimo: Number(this.productoNuevo.stockMinimo),
      activo: this.productoNuevo.activo,
      descripcion: this.productoNuevo.descripcion,
      idCategoria: Number(this.productoNuevo.idCategoria) || undefined
    };

    this.productoCreado.emit({ dto, imagen: this.imagenPendiente });
    this.resetForm();
    this.onCerrar();
  }

  private resetForm(): void {
    this.formSubmitted = false;
    this.productoNuevo = {
      nombre: '',
      precio: 0,
      stockActual: 0,
      stockMinimo: 0,
      activo: true,
      descripcion: '',
      idCategoria: 0
    };
    this.imagenPendiente = null;
  }
}
