import { Component, OnInit } from '@angular/core';

import { InventoryFacade } from '../services/inventory.facade';
import { Producto } from '../../../../../domain/inventory/models/producto.model';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { CreateProductRequestDto } from '../../../../../domain/inventory/dtos/request/create-product.request.dto';
import { UpdateProductRequestDto } from '../../../../../domain/inventory/dtos/request/update-product.request.dto';
import { CreateCategoryRequestDto } from '../../../../../domain/inventory/dtos/request/create-category.request.dto';
import { UpdateCategoryRequestDto } from '../../../../../domain/inventory/dtos/request/update-category.request.dto';

@Component({
  selector: 'app-main-inventory',
  standalone: false,
  templateUrl: './main-inventory.html',
  styleUrl: './main-inventory.scss'
})
export class MainInventory implements OnInit {
  noBackgroundColor: boolean = true;

  productosTableData: Array<Record<string, any>> = [];
  columnas: string[] = ['idProducto', 'nombre', 'precio', 'stockActual', 'stockMinimo', 'activo', 'descripcion', 'categoria', 'imagen', 'Acciones'];

  urlsIconos: string[] = ["icons/agregar.svg", "icons/editar.svg"];
  showTextStyle: boolean = true;

  mostrarModalEditar: boolean = false;
  mostrarModalEliminar: boolean = false;
  mostrarModalAgregar: boolean = false;
  registroSeleccionado: any = null;

  mostrarModalAgregarCategoria: boolean = false;
  mostrarModalEditarCategoria: boolean = false;
  nuevaCategoriaNombre: string = '';
  categoriaSeleccionadaId: any = null;
  categoriaNombreEditado: string = '';








  categoriasOptions: Array<{ value: any, label: string }> = [];

  constructor(
    private inventoryFacade: InventoryFacade
  ) { }

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarCategorias();
  }

  onAgregar(): void {
    this.mostrarModalAgregar = true;
  }

  onEditar(registro: any): void {
    this.registroSeleccionado = registro;
    this.mostrarModalEditar = true;
  }

  onProductoActualizado(dto: UpdateProductRequestDto): void {
    if (this.registroSeleccionado && this.registroSeleccionado.idProducto) {
      this.inventoryFacade.updateProduct(this.registroSeleccionado.idProducto, dto).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Producto actualizado exitosamente');
            this.cargarProductos();
            this.cerrarModalEditar();
          }
        },
        error: (error) => {
          console.error('Error al actualizar producto:', error);
        }
      });
    }
  }


  onEliminar(registro: any): void {
    this.registroSeleccionado = registro;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.registroSeleccionado = null;
  }

  cerrarModalEliminar(): void {
    this.mostrarModalEliminar = false;
    this.registroSeleccionado = null;
  }

  cerrarModalAgregar(): void {
    this.mostrarModalAgregar = false;
  }

  onProductoCreado(event: { dto: CreateProductRequestDto, imagen: File | null }): void {
    this.inventoryFacade.createProduct(event.dto, event.imagen).subscribe({
      next: (response) => {
        if (response.success) {
          this.cargarProductos();
          this.cerrarModalAgregar();
        }
      },
      error: (error) => {
        console.error('Error al crear producto:', error);
      }
    });
  }


  eliminarProducto(): void {
    if (this.registroSeleccionado && this.registroSeleccionado.idProducto) {
      this.inventoryFacade.deleteProduct(this.registroSeleccionado.idProducto).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Producto eliminado exitosamente');
            this.cerrarModalEliminar();
            this.cargarProductos(); // Recargar la lista de productos
          }
        },
        error: (error) => {
          console.error('Error al eliminar producto:', error);
        }
      });
    }
  }

  cargarProductos(): void {
    this.inventoryFacade.getProductsWithCategories().subscribe({
      next: (productos) => {
        this.productosTableData = productos;

        // Update selected record if exists to reflect changes in the open modal
        if (this.registroSeleccionado) {
          const updatedRecord = this.productosTableData.find(p => p['idProducto'] === this.registroSeleccionado.idProducto);
          if (updatedRecord) {
            this.registroSeleccionado = updatedRecord;
          }
        }
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  private cargarCategorias(): void {
    this.inventoryFacade.listCategories().subscribe({
      next: (response) => {
        const data = response.data;
        let categoriesArray: any[] = [];

        if (Array.isArray(data)) {
          categoriesArray = data;
        } else if (data && typeof data === 'object') {
          const d = data as any;
          if (Array.isArray(d.categorias)) {
            categoriesArray = d.categorias;
          } else if (Array.isArray(d.categories)) {
            categoriesArray = d.categories;
          } else {
            const keys = Object.keys(d);
            if (keys.length > 0 && Array.isArray(d[keys[0]])) {
              categoriesArray = d[keys[0]];
            }
          }
        }

        if (categoriesArray.length > 0) {
          this.categoriasOptions = categoriesArray.map((categoria: any) => ({
            value: categoria.idCategoria,
            label: categoria.nombre
          }));
        }
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  onAgregarCategoria(): void {
    this.mostrarModalAgregarCategoria = true;
  }

  cerrarModalAgregarCategoria(): void {
    this.mostrarModalAgregarCategoria = false;
    this.nuevaCategoriaNombre = '';
  }

  guardarCategoria(): void {
    if (this.nuevaCategoriaNombre.trim()) {
      const dto: CreateCategoryRequestDto = { nombre: this.nuevaCategoriaNombre };
      this.inventoryFacade.createCategory(dto).subscribe({
        next: (response) => {
          if (response.success) {
            this.cargarCategorias();
            this.cerrarModalAgregarCategoria();
          }
        },
        error: (err) => console.error(err)
      });
    }
  }

  onEditarCategoria(): void {
    this.mostrarModalEditarCategoria = true;
  }

  cerrarModalEditarCategoria(): void {
    this.mostrarModalEditarCategoria = false;
    this.categoriaSeleccionadaId = null;
    this.categoriaNombreEditado = '';
  }

  actualizarCategoria(): void {
    if (this.categoriaSeleccionadaId && this.categoriaNombreEditado.trim()) {
      const dto: UpdateCategoryRequestDto = { nombre: this.categoriaNombreEditado };
      this.inventoryFacade.updateCategory(this.categoriaSeleccionadaId, dto).subscribe({
        next: (res) => {
          if (res.success) {
            this.cargarCategorias();
            this.cargarProductos(); // Actualizar tabla de productos
            this.cerrarModalEditarCategoria();
          } else {
            alert('Error al actualizar categoría: ' + (res.message || 'Error desconocido'));
          }
        },
        error: (err) => {
          console.error(err);
          alert('Error al actualizar categoría. Ver consola para más detalles.');
        }
      });
    }
  }

  eliminarCategoria(): void {
    if (this.categoriaSeleccionadaId) {
      if (!confirm('¿Está seguro de que desea eliminar esta categoría?')) return;

      this.inventoryFacade.deleteCategory(this.categoriaSeleccionadaId).subscribe({
        next: (res) => {
          if (res.success) {
            this.cargarCategorias();
            this.cerrarModalEditarCategoria();
            alert('Categoría eliminada correctamente');
          } else {
            alert('Error al eliminar categoría: ' + (res.message || 'Error desconocido'));
          }
        },
        error: (err) => {
          console.error(err);
          alert('Error al eliminar categoría. Es posible que tenga productos asociados.');
        }
      });
    }
  }
}


