import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CanalVenta, TipoAtencion } from '../../../../../domain/orders/models/pedido.model';
import { InventoryFacade } from '../../inventory/services/inventory.facade';
import { OrdersFacade } from '../services/orders.facade';
import { AccionTabla } from '../../../../../shared/ui/ui-tabla/ui-tabla';

interface ProductCatalogItem {
  idProducto: number;
  nombre: string;
  precio: number;
  idCategoria: number;
  stockActual: number;
}

@Component({
  selector: 'app-category-products',
  standalone: false,
  templateUrl: './category-products.html',
  styleUrl: './category-products.scss'
})
export class CategoryProductsComponent implements OnInit {
  idMesa = 0;
  idCategoria = 0;
  categoriaNombre = '';
  productos: ProductCatalogItem[] = [];
  columnasTabla: string[] = ['Nombre', 'Precio', 'Stock', 'Acciones'];
  cargando = false;
  procesando = false;

  accionesProductos: AccionTabla[] = [
    {
      urlIcono: 'icons/agregar.svg',
      accion: (registro: ProductCatalogItem) => this.agregarProducto(registro.idProducto)
    }
  ];

  canalVenta: CanalVenta = CanalVenta.FISICO;
  tipoAtencion: TipoAtencion = TipoAtencion.LOCAL;
  direccionEntrega = '';
  idCliente: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inventoryFacade: InventoryFacade,
    private ordersFacade: OrdersFacade
  ) { }

  ngOnInit(): void {
    this.idMesa = Number(this.route.snapshot.paramMap.get('idMesa') || 0);
    this.idCategoria = Number(this.route.snapshot.paramMap.get('idCategoria') || 0);

    const qp = this.route.snapshot.queryParamMap;
    this.canalVenta = qp.get('canalVenta') === CanalVenta.WEB ? CanalVenta.WEB : CanalVenta.FISICO;
    this.tipoAtencion = qp.get('tipoAtencion') === TipoAtencion.LLEVAR ? TipoAtencion.LLEVAR : TipoAtencion.LOCAL;
    this.direccionEntrega = qp.get('direccionEntrega') || '';
    this.idCliente = qp.get('idCliente') ? Number(qp.get('idCliente')) : null;

    this.cargarProductosCategoria();
    this.cargarNombreCategoria();
  }

  cargarNombreCategoria(): void {
    this.inventoryFacade.getCategory(this.idCategoria).subscribe({
      next: (response) => {
        this.categoriaNombre = response.data?.nombre || `Categoría #${this.idCategoria}`;
      }
    });
  }

  cargarProductosCategoria(): void {
    this.cargando = true;
    this.inventoryFacade.listProductsByCategory(this.idCategoria).subscribe({
      next: (response) => {
        const productos = response.data?.productos ?? [];
        this.productos = productos
          .filter(item => item.activo)
          .map(item => ({
            idProducto: item.idProducto,
            nombre: item.nombre,
            precio: Number(item.precio),
            idCategoria: Number(item.idCategoria || 0),
            stockActual: Number(item.stockActual || 0)
          }));
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar productos por categoría:', error);
        this.cargando = false;
      }
    });
  }

  agregarProducto(idProducto: number): void {
    const producto = this.productos.find(item => item.idProducto === idProducto);
    if (!producto || this.procesando || producto.stockActual <= 0) {
      return;
    }

    this.procesando = true;
    this.ordersFacade.addProductToOpenOrderByMesa({
      idMesa: this.idMesa,
      idProducto,
      cantidad: 1,
      canalVenta: this.canalVenta,
      tipoAtencion: this.canalVenta === CanalVenta.FISICO ? this.tipoAtencion : undefined,
      direccionEntrega: this.direccionEntrega || undefined,
      idCliente: this.idCliente || undefined
    }).subscribe({
      next: () => {
        this.procesando = false;
        this.volverAMesa();
      },
      error: (error) => {
        console.error('Error al agregar producto desde categoría:', error);
        this.procesando = false;
      }
    });
  }

  volverAMesa(): void {
    this.router.navigate(['/employee/orders/table', this.idMesa]);
  }

  get productosTablaData(): Array<Record<string, any>> {
    return this.productos.map(producto => ({
      ...producto,
      Nombre: producto.nombre,
      Precio: `$${producto.precio.toFixed(2)}`,
      Stock: producto.stockActual
    }));
  }
}
