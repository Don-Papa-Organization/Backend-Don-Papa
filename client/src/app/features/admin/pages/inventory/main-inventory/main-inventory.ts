import { Component, OnInit } from '@angular/core';

import { InventoryFacade } from '../services/inventory.facade';
import { AdminFiltros } from '../../../../../shared/ui/ui-admin-filter-panel/ui-admin-filter-panel';
import { Producto } from '../../../../../domain/inventory/models/producto.model';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { CreateProductRequestDto } from '../../../../../domain/inventory/dtos/request/create-product.request.dto';
import { UpdateProductRequestDto } from '../../../../../domain/inventory/dtos/request/update-product.request.dto';
import { CreateCategoryRequestDto } from '../../../../../domain/inventory/dtos/request/create-category.request.dto';
import { UpdateCategoryRequestDto } from '../../../../../domain/inventory/dtos/request/update-category.request.dto';
import {
  TablaColumnaConfig,
  TablaStepperChangeEvent,
  TablaToggleChangeEvent
} from '../../../../../shared/ui/ui-tabla/ui-tabla';

@Component({
  selector: 'app-main-inventory',
  standalone: false,
  templateUrl: './main-inventory.html',
  styleUrl: './main-inventory.scss'
})
export class MainInventory implements OnInit {
  noBackgroundColor: boolean = true;

  productosTableData: Array<Record<string, any>> = [];
  cargandoProductos: boolean = false;
  columnas: string[] = ['idProducto', 'nombre', 'precio', 'stockActual', 'stockMinimo', 'activo', 'descripcion', 'categoria', 'imagen', 'Acciones'];
  columnasConfig: TablaColumnaConfig[] = [
    {
      header: 'stockActual',
      type: 'stepper',
      stepper: { min: 0, step: 1 }
    },
    {
      header: 'stockMinimo',
      type: 'stepper',
      stepper: { min: 0, step: 1 }
    },
    {
      header: 'activo',
      type: 'toggle'
    }
  ];

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
  filtrosActuales: AdminFiltros | null = null;
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 1;
  pageSizeOptions: Array<{ value: number, label: string }> = [
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' }
  ];

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

  onStepperStockChange(event: TablaStepperChangeEvent): void {
    const idProducto = Number(event.registro?.idProducto);
    if (!idProducto || event.nextValue < 0) {
      return;
    }

    const payload: UpdateProductRequestDto = {
      [event.columna]: event.nextValue
    } as UpdateProductRequestDto;

    this.inventoryFacade.updateProduct(idProducto, payload).subscribe({
      next: (response) => {
        if (response.success) {
          event.registro[event.columna] = event.nextValue;
          return;
        }
        this.cargarProductos();
      },
      error: (error) => {
        console.error(`Error al actualizar ${event.columna}:`, error);
        this.cargarProductos();
      }
    });
  }

  onToggleActivoChange(event: TablaToggleChangeEvent): void {
    const idProducto = Number(event.registro?.idProducto);
    if (!idProducto) {
      return;
    }

    this.inventoryFacade.updateProduct(idProducto, { activo: event.nextValue }).subscribe({
      next: (response) => {
        if (response.success) {
          event.registro[event.columna] = event.nextValue;
          return;
        }
        this.cargarProductos();
      },
      error: (error) => {
        console.error('Error al actualizar estado activo:', error);
        this.cargarProductos();
      }
    });
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
    this.cargandoProductos = true;
    this.inventoryFacade.getProductsWithCategoriesPaginated(this.filtrosActuales, this.currentPage, this.pageSize).subscribe({
      next: (result) => {
        this.productosTableData = result.items;
        this.totalItems = result.meta.total;
        this.totalPages = result.meta.totalPages;
        this.currentPage = result.meta.page;

        // Update selected record if exists to reflect changes in the open modal
        if (this.registroSeleccionado) {
          const updatedRecord = this.productosTableData.find(p => p['idProducto'] === this.registroSeleccionado.idProducto);
          if (updatedRecord) {
            this.registroSeleccionado = updatedRecord;
          }
        }
        this.cargandoProductos = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.cargandoProductos = false;
      }
    });
  }

  private cargarCategorias(): void {
    this.inventoryFacade.getCategoryOptions().subscribe({
      next: (options) => {
        this.categoriasOptions = options;
      }
    });
  }

  onFiltrosAplicados(filtros: AdminFiltros): void {
    this.filtrosActuales = filtros;
    this.currentPage = 1;
    this.cargarProductos();
  }

  onFiltrosLimpiados(): void {
    this.filtrosActuales = null;
    this.currentPage = 1;
    this.cargarProductos();
  }

  onPageSizeChange(pageSize: number): void {
    const newSize = Number(pageSize);
    if (!newSize || newSize <= 0) {
      return;
    }

    this.pageSize = newSize;
    this.currentPage = 1;
    this.cargarProductos();
  }

  previousPage(): void {
    if (this.currentPage <= 1 || this.cargandoProductos) {
      return;
    }

    this.currentPage -= 1;
    this.cargarProductos();
  }

  nextPage(): void {
    if (this.currentPage >= this.totalPages || this.cargandoProductos) {
      return;
    }

    this.currentPage += 1;
    this.cargarProductos();
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


