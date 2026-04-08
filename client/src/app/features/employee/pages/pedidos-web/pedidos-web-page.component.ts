import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin, of, takeUntil } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Pedido, EstadoPedido, ProductoPedidoItem } from '../../../../domain/orders/models/pedido.model';
import { OrdersApi } from '../../../../services/apis/orders.api';
import { UsersApi } from '../../../../services/apis/users.api';
import { InventoryApi } from '../../../../services/apis/inventory.api';

@Component({
  selector: 'app-pedidos-web-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos-web-page.component.html',
  styleUrl: './pedidos-web-page.component.scss'
})
export class PedidosWebPageComponent implements OnInit, OnDestroy {
  pedidos: Pedido[] = [];
  loading = false;
  error = '';
  filtroEstado = '';
  updatingId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private ordersApi: OrdersApi,
    private usersApi: UsersApi,
    private inventoryApi: InventoryApi
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarPedidos(): void {
    this.loading = true;
    this.error = '';

    this.ordersApi.listAllOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (!response.success || !response.data) {
            this.error = 'No se pudieron cargar los pedidos.';
            return;
          }
          const pedidosWeb = response.data.filter((p: Pedido) => p.canalVenta === 'web');
          this.cargarDetalleProductos(pedidosWeb);
        },
        error: () => {
          this.loading = false;
          this.error = 'Error al conectar con el servidor.';
        }
      });
  }

  private cargarDetalleProductos(pedidosWeb: Pedido[]): void {
    if (!pedidosWeb.length) {
      this.pedidos = [];
      return;
    }

    const pedidosConDetalle$ = pedidosWeb.map((pedido) => {
      const basePedido$ = pedido.productos?.length
        ? of(pedido)
        : this.ordersApi.getOrderById(pedido.idPedido).pipe(
            map((detalleResp) => {
              const productos = detalleResp?.data?.productos ?? [];
              return {
                ...pedido,
                productos
              } as Pedido;
            }),
            catchError(() => of(pedido))
          );

      return basePedido$.pipe(
        map((pedidoConDetalle) => this.completarNombresProductos(pedidoConDetalle))
      );
    });

    forkJoin(pedidosConDetalle$)
      .pipe(takeUntil(this.destroy$))
      .subscribe((pedidosDetallados) => {
        this.pedidos = pedidosDetallados;
      });
  }

  private completarNombresProductos(pedido: Pedido): Pedido {
    if (!pedido.productos?.length) {
      return pedido;
    }

    const productos = [...pedido.productos];
    const productosSinNombre = productos.filter((item) => !item.productoNombre?.trim());

    if (!productosSinNombre.length) {
      return pedido;
    }

    const idsSinNombre = Array.from(new Set(productosSinNombre.map((item) => item.idProducto)));

    idsSinNombre.forEach((idProducto) => {
      this.inventoryApi.getCatalogDetail(idProducto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (resp) => {
            const nombre = String(resp?.data?.nombre || '').trim();
            if (!nombre) {
              return;
            }

            this.actualizarNombreProductoPedido(pedido.idPedido, idProducto, nombre);
          }
        });
    });

    return {
      ...pedido,
      productos: productos.map((item) => ({
        ...item,
        productoNombre: item.productoNombre?.trim() || 'Producto sin nombre'
      }))
    };
  }

  private actualizarNombreProductoPedido(idPedido: number, idProducto: number, nombre: string): void {
    this.pedidos = this.pedidos.map((pedido) => {
      if (pedido.idPedido !== idPedido || !pedido.productos?.length) {
        return pedido;
      }

      return {
        ...pedido,
        productos: pedido.productos.map((item) =>
          item.idProducto === idProducto
            ? { ...item, productoNombre: nombre }
            : item
        )
      };
    });
  }

  get pedidosFiltrados(): Pedido[] {
    if (!this.filtroEstado) return this.pedidosActivos;
    return this.pedidos.filter(p => p.estado === this.filtroEstado);
  }

  get pedidosActivos(): Pedido[] {
    return this.pedidos.filter(p =>
      p.estado === EstadoPedido.SIN_CONFIRMAR || p.estado === EstadoPedido.PENDIENTE
    );
  }

  get pedidosEntregados(): Pedido[] {
    return this.pedidos.filter(p => p.estado === EstadoPedido.ENTREGADO);
  }

  get groupedPedidos(): { estado: string; label: string; pedidos: Pedido[] }[] {
    const ordenEstados: Array<{ estado: EstadoPedido; label: string }> = [
      { estado: EstadoPedido.SIN_CONFIRMAR, label: 'Sin Confirmar' },
      { estado: EstadoPedido.PENDIENTE, label: 'Pendiente' },
      { estado: EstadoPedido.ENTREGADO, label: 'Entregado' },
      { estado: EstadoPedido.CANCELADO, label: 'Cancelado' }
    ];

    return ordenEstados
      .map(e => ({
        estado: e.estado,
        label: e.label,
        pedidos: this.pedidosFiltrados.filter(p => p.estado === e.estado)
      }))
      .filter(g => g.pedidos.length > 0);
  }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'sin_confirmar': return 'badge--pending';
      case 'pendiente': return 'badge--confirmed';
      case 'entregado': return 'badge--delivered';
      case 'cancelado': return 'badge--cancelled';
      default: return '';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'sin_confirmar': return 'Sin Confirmar';
      case 'pendiente': return 'Pendiente';
      case 'entregado': return 'Entregado';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  }

  getSiguientesEstados(estadoActual: string): Array<{ value: string; label: string }> {
    switch (estadoActual) {
      case 'sin_confirmar':
        return [
          { value: 'pendiente', label: 'Confirmar' },
          { value: 'cancelado', label: 'Cancelar' }
        ];
      case 'pendiente':
        return [
          { value: 'entregado', label: 'Marcar Entregado' },
          { value: 'cancelado', label: 'Cancelar' }
        ];
      default:
        return [];
    }
  }

  cambiarEstado(idPedido: number, nuevoEstado: string): void {
    if (this.updatingId !== null) return;
    this.updatingId = idPedido;

    this.ordersApi.updateOrderStatus(idPedido, { nuevoEstado: nuevoEstado as any })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatingId = null;
          if (response.success && response.data) {
            const idx = this.pedidos.findIndex(p => p.idPedido === idPedido);
            if (idx !== -1) {
              this.pedidos[idx] = { ...this.pedidos[idx], ...response.data };
            }
          }
        },
        error: () => {
          this.updatingId = null;
        }
      });
  }

  formatearFecha(fecha: string): string {
    try {
      return new Date(fecha).toLocaleDateString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return fecha;
    }
  }

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP',
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(valor || 0);
  }

  isUpdating(id: number): boolean {
    return this.updatingId === id;
  }

  getNombreProducto(item: ProductoPedidoItem): string {
    const nombre = item.productoNombre?.trim();
    return nombre || 'Producto sin nombre';
  }
}
