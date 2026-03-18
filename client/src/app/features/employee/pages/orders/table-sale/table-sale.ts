import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, forkJoin, of, throwError, timer } from 'rxjs';
import { catchError, finalize, map, retry } from 'rxjs/operators';
import { CanalVenta, TipoAtencion } from '../../../../../domain/orders/models/pedido.model';
import { RegisterPaymentRequestDto } from '../../../../../domain/orders/dtos/request/register-payment.request.dto';
import { InventoryFacade } from '../../inventory/services/inventory.facade';
import { OrdersFacade, PaymentMethodOption, PosOrderSummary, ProductPromotionPricingItem } from '../services/orders.facade';
import { TablesReservesFacade, MesaPosViewModel } from '../../tables-reserves/services/tables-reserves.facade';

interface CategoriaOption {
  idCategoria: number;
  nombre: string;
}

interface ProductCatalogItem {
  idProducto: number;
  nombre: string;
  precio: number;
  precioOriginal: number;
  precioPromocional: number | null;
  tienePromocion: boolean;
  idCategoria: number;
  stockActual: number;
  urlImagen: string;
}

import { PosPreferencesService } from '../services/pos-preferences.service';
import { TableSaleHeaderService } from '../services/table-sale-header.service';
import { InventoryApi } from '../../../../../services/apis/inventory.api';

@Component({
  selector: 'app-table-sale',
  standalone: false,
  templateUrl: './table-sale.html',
  styleUrl: './table-sale.scss'
})
export class TableSaleComponent implements OnInit, OnDestroy {
  private readonly stockDebugEnabled = true;

  idMesa = 0;
  mesa: MesaPosViewModel | null = null;
  categorias: CategoriaOption[] = [];
  productosCatalogo: ProductCatalogItem[] = [];

  /** Panel izquierdo: 'categorias' muestra la grilla de categorías; 'productos' muestra artículos de la categoría activa */
  vistaPanelIzq: 'categorias' | 'productos' = 'categorias';
  categoriaActiva: CategoriaOption | null = null;
  productosCategoria: ProductCatalogItem[] = [];
  cargandoProductos = false;
  paginaProductos = 1;
  totalPaginasProductos = 1;
  totalProductosCategoria = 0;
  readonly limiteProductosPorPagina = 20;

  pedidoActual: PosOrderSummary | null = null;

  cargando = false;
  procesando = false;
  mostrarModalPago = false;
  autoImpresion = true;
  metodosPagoOptions: PaymentMethodOption[] = [];

  canalVenta: CanalVenta = CanalVenta.FISICO;
  tipoAtencion: TipoAtencion = TipoAtencion.LOCAL;
  direccionEntrega: string | null = null;
  idCliente: number | null = null;
  cantidadRapida = 1;

  feedbackVisible = false;
  feedbackMessage = '';
  feedbackType: 'success' | 'error' | 'warning' | 'info' = 'info';
  reciboPendienteId: number | null = null;
  descargandoRecibo = false;

  private autoPrintSub?: Subscription;
  private routeSub?: Subscription;
  private headerReloadSub?: Subscription;
  private headerParaLlevarSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tablesReservesFacade: TablesReservesFacade,
    private inventoryFacade: InventoryFacade,
    private ordersFacade: OrdersFacade,
    private inventoryApi: InventoryApi,
    private posPreferences: PosPreferencesService,
    private tableSaleHeader: TableSaleHeaderService
  ) { }

  ngOnInit(): void {
    this.canalVenta = CanalVenta.FISICO;
    this.idCliente = null;
    this.direccionEntrega = null;

    this.autoImpresion = this.posPreferences.autoPrintValue;
    this.autoPrintSub = this.posPreferences.autoPrint$.subscribe(value => {
      this.autoImpresion = value;
    });

    this.headerReloadSub = this.tableSaleHeader.reload$.subscribe(() => {
      this.recargarPedido();
      this.refrescarCatalogoEnSegundoPlano();
    });

    this.headerParaLlevarSub = this.tableSaleHeader.paraLlevar$.subscribe(isChecked => {
      this.tipoAtencion = isChecked ? TipoAtencion.LLEVAR : TipoAtencion.LOCAL;
    });

    this.tableSaleHeader.setParaLlevar(this.tipoAtencion === TipoAtencion.LLEVAR);

    this.routeSub = this.route.paramMap.subscribe(params => {
      const idMesaRuta = Number(params.get('idMesa') || 0);
      const cambioMesa = idMesaRuta !== this.idMesa;

      this.idMesa = idMesaRuta;
      this.tableSaleHeader.setMesaTitle(`Mesa ${this.idMesa}`);

      if (cambioMesa || !this.mesa) {
        this.cargarDatosBase();
        return;
      }

      this.aplicarCategoriaDesdeRuta();
    });
  }

  ngOnDestroy(): void {
    this.autoPrintSub?.unsubscribe();
    this.routeSub?.unsubscribe();
    this.headerReloadSub?.unsubscribe();
    this.headerParaLlevarSub?.unsubscribe();
    this.tableSaleHeader.clear();
  }

  cargarDatosBase(): void {
    const opStart = this.startOperationTimer('cargar-datos-base');
    this.cargando = true;
    this.vistaPanelIzq = 'categorias';
    this.categoriaActiva = null;
    this.productosCategoria = [];

    forkJoin({
      mesas: this.tablesReservesFacade.getTablesForPos(),
      categoriasResponse: this.inventoryFacade.listCategories(),
      productosResponse: this.inventoryFacade.listProducts(),
      metodos: this.ordersFacade.listPosPaymentMethods()
    }).subscribe({
      next: ({ mesas, categoriasResponse, productosResponse, metodos }) => {
        this.mesa = mesas.find(item => item.idMesa === this.idMesa) ?? null;
        this.tableSaleHeader.setMesaTitle(this.mesa?.nombreMesa || `Mesa ${this.idMesa}`);

        const categorias = this.extractCategorias(categoriasResponse.data);
        this.categorias = categorias.map(item => ({
          idCategoria: Number((item as any).idCategoria),
          nombre: String((item as any).nombre || '')
        }));

        const catalogoBase = this.mapProductosCatalogo(productosResponse.data?.productos ?? []);
        this.logStockDebug('cargarDatosBase:catalogoBase', {
          totalProductos: catalogoBase.length,
          sinStock: catalogoBase.filter(p => p.stockActual <= 0).length,
          muestraSinStock: catalogoBase.filter(p => p.stockActual <= 0).slice(0, 10)
            .map(p => ({ idProducto: p.idProducto, nombre: p.nombre, stockActual: p.stockActual }))
        });
        this.enrichCatalogWithPromotions(catalogoBase).subscribe({
          next: (catalogoPromocionado) => {
            this.productosCatalogo = catalogoPromocionado;
            this.metodosPagoOptions = metodos;
            this.aplicarCategoriaDesdeRuta();
            this.recargarPedido();
            this.finishOperationTimer(opStart, 'ok');
          },
          error: () => {
            this.productosCatalogo = catalogoBase;
            this.metodosPagoOptions = metodos;
            this.aplicarCategoriaDesdeRuta();
            this.recargarPedido();
            this.finishOperationTimer(opStart, 'ok');
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar datos base POS:', error);
        this.cargando = false;
        this.showFeedback('No fue posible cargar la mesa. Intente actualizar.', 'error');
        this.finishOperationTimer(opStart, 'error');
      }
    });
  }

  recargarPedido(): void {
    const opStart = this.startOperationTimer('recargar-pedido');
    this.cargando = true;
    this.ordersFacade.getOpenOrderByMesa(this.idMesa).pipe(
      retry({
        count: 1,
        delay: (error, retryCount) => this.retryDelayOrFail(error, retryCount)
      })
    ).subscribe({
      next: (pedidoAbierto) => {
        if (!pedidoAbierto) {
          this.pedidoActual = null;
          this.cargando = false;
          this.finishOperationTimer(opStart, 'ok');
          return;
        }

        this.ordersFacade.getOrderSummary(pedidoAbierto.idPedido).pipe(
          retry({
            count: 1,
            delay: (error, retryCount) => this.retryDelayOrFail(error, retryCount)
          })
        ).subscribe({
          next: (summary) => {
            this.pedidoActual = {
              ...summary,
              lineas: summary.lineas.map(linea => ({
                ...linea,
                nombre: this.getNombreProducto(linea.idProducto) || linea.nombre
              }))
            };
            if (summary.tipoAtencion) {
              this.tipoAtencion = summary.tipoAtencion;
              this.tableSaleHeader.setParaLlevar(this.tipoAtencion === TipoAtencion.LLEVAR);
            }
            this.cargando = false;
            this.finishOperationTimer(opStart, 'ok');
          },
          error: (error) => {
            console.error('Error al cargar pedido en curso:', error);
            this.cargando = false;
            this.finishOperationTimer(opStart, 'error');
          }
        });
      },
      error: (error) => {
        console.error('Error al buscar pedido abierto:', error);
        this.cargando = false;
        this.finishOperationTimer(opStart, 'error');
      }
    });
  }

  // ── Navegación del panel izquierdo ──────────────────────────────

  verProductosDeCategoria(categoria: CategoriaOption): void {
    this.categoriaActiva = categoria;
    this.vistaPanelIzq = 'productos';
    this.cargarPaginaProductosCategoria(1);
  }

  abrirCategoria(idCategoria: number): void {
    const categoria = this.categorias.find(c => c.idCategoria === idCategoria);
    if (!categoria) {
      return;
    }

    this.verProductosDeCategoria(categoria);
  }

  volverACategorias(): void {
    this.vistaPanelIzq = 'categorias';
    this.categoriaActiva = null;
    this.productosCategoria = [];
    this.paginaProductos = 1;
    this.totalPaginasProductos = 1;
    this.totalProductosCategoria = 0;
  }

  irPaginaAnteriorProductos(): void {
    if (this.cargandoProductos || this.paginaProductos <= 1) {
      return;
    }

    this.cargarPaginaProductosCategoria(this.paginaProductos - 1);
  }

  irPaginaSiguienteProductos(): void {
    if (this.cargandoProductos || this.paginaProductos >= this.totalPaginasProductos) {
      return;
    }

    this.cargarPaginaProductosCategoria(this.paginaProductos + 1);
  }

  /** B4: Creación manual de pedido (permitir usuario crear antes de agregar producto) */
  crearPedidoManual(): void {
    if (this.pedidoActual || this.procesando) {
      return; // Already has an order
    }

    const opStart = this.startOperationTimer('crear-pedido-manual');
    this.procesando = true;
    this.ordersFacade.createCustomerOrder({
      idMesa: this.idMesa,
      productos: [] // Empty order, will add products later
    }).pipe(
      retry({
        count: 1,
        delay: (error, retryCount) => this.retryDelayOrFail(error, retryCount)
      })
    ).subscribe({
      next: (response) => {
        const data = response.data;
        if (data?.pedido) {
          const pedido = data.pedido;
          this.pedidoActual = {
            idPedido: pedido.idPedido || this.idMesa,
            idMesa: pedido.idMesa || this.idMesa,
            estado: pedido.estado,
            canalVenta: this.canalVenta,
            tipoAtencion: this.tipoAtencion,
            direccionEntrega: this.direccionEntrega || undefined,
            total: 0,
            lineas: []
          };
          this.showFeedback('Pedido creado correctamente.', 'success');
          this.refrescarCatalogoEnSegundoPlano();
        }
        this.procesando = false;
        this.finishOperationTimer(opStart, 'ok');
      },
      error: (error) => {
        console.error('Error al crear pedido manual:', error);
        this.procesando = false;
        this.showFeedback(this.getUserFriendlyError(error, 'No se pudo crear el pedido.'), 'error');
        this.finishOperationTimer(opStart, 'error');
      }
    });
  }

  // ── Líneas del pedido ───────────────────────────────────────────

  agregarProducto(idProducto: number): void {
    this.sumarCantidad(idProducto, this.cantidadRapida);
  }

  sumarCantidad(idProducto: number, cantidad = 1): void {
    if (this.procesando) {
      return;
    }

    const cantidadFinal = Number.isFinite(cantidad) ? Math.max(1, Math.floor(cantidad)) : 1;
    const producto = this.findProductoLocalById(idProducto);

    this.logStockDebug('sumarCantidad:validacion-local', {
      idMesa: this.idMesa,
      idProducto,
      cantidadSolicitada: cantidad,
      cantidadFinal,
      productoEncontrado: Boolean(producto),
      productoLocal: producto
        ? {
          idProducto: producto.idProducto,
          nombre: producto.nombre,
          stockActual: producto.stockActual,
          precio: producto.precio,
          idCategoria: producto.idCategoria
        }
        : null
    });

    if (!producto) {
      this.logStockDebug('sumarCantidad:producto-no-encontrado-local', {
        idProducto,
        catalogoPrincipal: this.productosCatalogo.length,
        catalogoCategoria: this.productosCategoria.length,
        vistaPanelIzq: this.vistaPanelIzq,
        categoriaActiva: this.categoriaActiva?.idCategoria ?? null
      });
      this.debugFetchStockFromApi(idProducto, 'sumarCantidad-producto-no-encontrado-local');
      this.showFeedback('Producto no encontrado en catálogo local. Recargando catálogo...', 'info');
      this.refrescarCatalogoEnSegundoPlano();
      return;
    }

    if (producto.stockActual <= 0) {
      this.debugFetchStockFromApi(idProducto, 'sumarCantidad-bloqueado-sin-stock');
      this.showFeedback('Producto sin stock disponible.', 'warning');
      return;
    }

    const cantidadActualEnPedido = this.pedidoActual?.lineas.find(linea => linea.idProducto === idProducto)?.cantidad ?? 0;
    if ((cantidadActualEnPedido + cantidadFinal) > producto.stockActual) {
      this.logStockDebug('sumarCantidad:stock-insuficiente-local', {
        idProducto,
        cantidadActualEnPedido,
        cantidadFinal,
        stockActual: producto.stockActual
      });
      this.debugFetchStockFromApi(idProducto, 'sumarCantidad-bloqueado-stock-insuficiente');
      this.showFeedback(`Stock insuficiente. Disponible: ${producto.stockActual}.`, 'warning');
      return;
    }

    this.procesando = true;
    const opStart = this.startOperationTimer('sumar-cantidad');
    this.ordersFacade.addProductToOpenOrderByMesa({
      idMesa: this.idMesa,
      idProducto,
      cantidad: cantidadFinal,
      canalVenta: this.canalVenta,
      tipoAtencion: this.canalVenta === CanalVenta.FISICO ? this.tipoAtencion : undefined,
      direccionEntrega: this.direccionEntrega || undefined,
      idCliente: this.idCliente || undefined
    }).pipe(
      retry({
        count: 1,
        delay: (error, retryCount) => this.retryDelayOrFail(error, retryCount)
      }),
      finalize(() => {
        this.procesando = false;
      })
    ).subscribe({
      next: (summary) => {
        this.pedidoActual = this.enrichSummary(summary);
        this.showFeedback(cantidadFinal > 1 ? `Se agregaron ${cantidadFinal} unidades.` : 'Producto agregado al pedido.', 'success');
        this.refrescarCatalogoEnSegundoPlano();
        this.finishOperationTimer(opStart, 'ok');
      },
      error: (error) => {
        console.error('Error al agregar producto:', error);
        this.logStockDebug('sumarCantidad:error-backend', {
          idProducto,
          cantidadFinal,
          status: (error as any)?.status,
          backendError: (error as any)?.error,
          message: (error as any)?.message
        });
        this.showFeedback(this.getUserFriendlyError(error, 'No fue posible agregar el producto.'), 'error');
        this.finishOperationTimer(opStart, 'error');
      }
    });
  }

  restarCantidad(idProducto: number): void {
    if (!this.pedidoActual || this.procesando) { return; }

    const opStart = this.startOperationTimer('restar-cantidad');
    this.procesando = true;
    this.ordersFacade.decreaseProductFromOrder(this.pedidoActual, idProducto).pipe(
      retry({
        count: 1,
        delay: (error, retryCount) => this.retryDelayOrFail(error, retryCount)
      }),
      finalize(() => {
        this.procesando = false;
      })
    ).subscribe({
      next: (summary) => {
        this.pedidoActual = this.enrichSummary(summary);
        this.showFeedback('Cantidad actualizada.', 'info');
        this.refrescarCatalogoEnSegundoPlano();
        this.finishOperationTimer(opStart, 'ok');
      },
      error: (error) => {
        console.error('Error al reducir cantidad:', error);
        this.showFeedback(this.getUserFriendlyError(error, 'No fue posible actualizar la cantidad.'), 'error');
        this.finishOperationTimer(opStart, 'error');
      }
    });
  }

  eliminarProductoDirecto(idProductoPedido: number): void {
    if (!this.pedidoActual || this.procesando) { return; }

    const opStart = this.startOperationTimer('eliminar-linea');
    this.procesando = true;
    this.ordersFacade.removeProductFromOrder(this.pedidoActual.idPedido, idProductoPedido).pipe(
      finalize(() => { this.procesando = false; })
    ).subscribe({
      next: () => {
        this.recargarPedido();
        this.showFeedback('Producto eliminado del pedido.', 'info');
        this.refrescarCatalogoEnSegundoPlano();
        this.finishOperationTimer(opStart, 'ok');
      },
      error: (error) => {
        console.error('Error al eliminar producto:', error);
        this.showFeedback(this.getUserFriendlyError(error, 'No fue posible eliminar el producto.'), 'error');
        this.finishOperationTimer(opStart, 'error');
      }
    });
  }

  // ── Pago ────────────────────────────────────────────────────────

  abrirPago(): void {
    if (!this.pedidoActual || this.pedidoActual.lineas.length === 0) { return; }
    this.mostrarModalPago = true;
  }

  cerrarPago(): void {
    this.mostrarModalPago = false;
  }

  registrarPago(dto: RegisterPaymentRequestDto): void {
    if (!this.pedidoActual || this.procesando) { return; }

    if (!this.validarStockAntesDePagar()) {
      return;
    }

    const opStart = this.startOperationTimer('registrar-pago');
    this.procesando = true;
    this.ordersFacade.registerPayment(this.pedidoActual.idPedido, dto).pipe(
      retry({
        count: 1,
        delay: (error, retryCount) => this.retryDelayOrFail(error, retryCount)
      }),
      finalize(() => {
        this.procesando = false;
      })
    ).subscribe({
      next: (response) => {
        this.mostrarModalPago = false;
        this.pedidoActual = null;
        this.marcarMesaDisponibleTrasPago();

        const idPago = Number((response.data as any)?.pago?.idPago || (response.data as any)?.data?.pago?.idPago);
        this.reciboPendienteId = idPago || null;

        if (idPago) {
          if (this.autoImpresion) {
            this.descargarRecibo(idPago, true);
            this.showFeedback('Pago registrado y recibo generado.', 'success');
          } else {
            this.showFeedback('Pago registrado. Recibo pendiente de descarga.', 'success');
          }
        } else {
          this.showFeedback('Pago registrado, pero no se pudo obtener el recibo.', 'warning');
        }

        this.volverACategorias();
        this.recargarPedido();
        this.refrescarCatalogoEnSegundoPlano();
        this.finishOperationTimer(opStart, 'ok');
      },
      error: (error) => {
        console.error('Error al registrar pago:', error);
        this.showFeedback(this.getUserFriendlyError(error, 'No se pudo registrar el pago.'), 'error');
        this.finishOperationTimer(opStart, 'error');
      }
    });
  }

  descargarRecibo(idPago: number, fromAutoPrint = false): void {
    if (this.descargandoRecibo) {
      return;
    }

    const opStart = this.startOperationTimer('descargar-recibo');
    this.descargandoRecibo = true;
    this.ordersFacade.downloadReceipt(idPago).pipe(
      finalize(() => {
        this.descargandoRecibo = false;
      })
    ).subscribe({
      next: (fileData) => {
        const blob = new Blob([fileData], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo-${idPago}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.reciboPendienteId = null;
        if (!fromAutoPrint) {
          this.showFeedback('Recibo descargado correctamente.', 'success');
        }
        this.finishOperationTimer(opStart, 'ok');
      },
      error: (err) => {
        console.error('Error al descargar recibo:', err);
        this.showFeedback(this.getUserFriendlyError(err, 'No fue posible descargar el recibo.'), 'error');
        this.finishOperationTimer(opStart, 'error');
      }
    });
  }

  descargarReciboPendiente(): void {
    if (!this.reciboPendienteId) {
      this.showFeedback('No hay recibo pendiente para descargar.', 'warning');
      return;
    }
    this.descargarRecibo(this.reciboPendienteId);
  }

  cerrarFeedback(): void {
    this.feedbackVisible = false;
  }

  // ── Configuración canal/tipo ────────────────────────────────────

  onAutoPrintChange(value: boolean): void {
    this.posPreferences.setAutoPrint(value);
  }

  incrementarCantidadRapida(): void {
    this.cantidadRapida = Math.min(20, this.cantidadRapida + 1);
  }

  decrementarCantidadRapida(): void {
    this.cantidadRapida = Math.max(1, this.cantidadRapida - 1);
  }

  volverAMesas(): void {
    this.tableSaleHeader.clear();
    this.router.navigate(['/employee/orders']);
  }

  // ── Helpers privados ────────────────────────────────────────────

  private marcarMesaDisponibleTrasPago(): void {
    this.tablesReservesFacade.updateTableStatus(this.idMesa, { estado: 'Disponible' }).subscribe({
      next: () => {
        if (this.mesa) {
          this.mesa = {
            ...this.mesa,
            estadoRaw: 'Disponible',
            estadoVisual: 'Disponible'
          };
        }
      },
      error: (error) => {
        console.warn('Pago registrado, pero no se pudo actualizar la mesa a disponible:', error);
      }
    });
  }

  private enrichSummary(summary: PosOrderSummary): PosOrderSummary {
    return {
      ...summary,
      lineas: summary.lineas.map(linea => ({
        ...linea,
        nombre: this.getNombreProducto(linea.idProducto) || linea.nombre
      }))
    };
  }

  private aplicarCategoriaDesdeRuta(): void {
    const idCategoria = Number(this.route.snapshot.paramMap.get('idCategoria') || 0);
    if (!idCategoria) {
      return;
    }

    const categoria = this.categorias.find(c => c.idCategoria === idCategoria);
    if (categoria) {
      this.verProductosDeCategoria(categoria);
    }
  }

  private showFeedback(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    this.feedbackMessage = message;
    this.feedbackType = type;
    this.feedbackVisible = true;
  }

  private validarStockAntesDePagar(): boolean {
    const lineas = this.pedidoActual?.lineas ?? [];
    for (const linea of lineas) {
      const producto = this.findProductoLocalById(linea.idProducto);
      if (!producto) {
        this.logStockDebug('validarStockAntesDePagar:producto-no-encontrado-local', {
          idProducto: linea.idProducto,
          nombre: linea.nombre,
          cantidadLinea: linea.cantidad,
          catalogoPrincipal: this.productosCatalogo.length,
          catalogoCategoria: this.productosCategoria.length,
          vistaPanelIzq: this.vistaPanelIzq,
          categoriaActiva: this.categoriaActiva?.idCategoria ?? null
        });
        this.debugFetchStockFromApi(linea.idProducto, 'validarStockAntesDePagar-producto-no-encontrado-local');
        this.showFeedback(`No se pudo validar el stock de ${linea.nombre}. Intente recargar.`, 'warning');
        return false;
      }

      if (producto.stockActual <= 0) {
        this.logStockDebug('validarStockAntesDePagar:sin-stock-local', {
          idProducto: linea.idProducto,
          nombre: linea.nombre,
          cantidadLinea: linea.cantidad,
          productoLocal: producto ?? null
        });
        this.debugFetchStockFromApi(linea.idProducto, 'validarStockAntesDePagar-bloqueado-sin-stock');
        this.showFeedback(`El producto ${linea.nombre} ya no tiene stock disponible.`, 'warning');
        return false;
      }

      if (linea.cantidad > producto.stockActual) {
        this.logStockDebug('validarStockAntesDePagar:stock-insuficiente-local', {
          idProducto: linea.idProducto,
          nombre: linea.nombre,
          cantidadLinea: linea.cantidad,
          stockActual: producto.stockActual
        });
        this.debugFetchStockFromApi(linea.idProducto, 'validarStockAntesDePagar-bloqueado-stock-insuficiente');
        this.showFeedback(`Stock insuficiente para ${linea.nombre}. Disponible: ${producto.stockActual}.`, 'warning');
        return false;
      }
    }

    return true;
  }

  private getRetryDelayMs(retryCount: number): number {
    return retryCount * 400;
  }

  private retryDelayOrFail(error: unknown, retryCount: number): Observable<number> {
    if (!this.shouldRetry(error)) {
      return throwError(() => error);
    }

    return timer(this.getRetryDelayMs(retryCount));
  }

  private shouldRetry(error: unknown): boolean {
    const anyError = error as any;
    const status = Number(anyError?.status ?? anyError?.error?.status ?? 0);

    if (status === 0 || status === 429) {
      return true;
    }

    return status >= 500;
  }

  private getUserFriendlyError(error: unknown, fallback: string): string {
    const anyError = error as any;
    const status = Number(anyError?.status ?? anyError?.error?.status ?? 0);
    const backendMessage = anyError?.error?.message || anyError?.message;

    if (status === 0) {
      return 'No hay conexion con el servidor. Verifique red e intente nuevamente.';
    }

    if (status >= 500) {
      return 'El servidor presento un problema temporal. Intente nuevamente.';
    }

    if (status === 409) {
      return 'El recurso fue modificado por otro usuario. Actualice y reintente.';
    }

    if (status === 400) {
      return typeof backendMessage === 'string' && backendMessage.trim().length > 0
        ? backendMessage
        : 'La solicitud no es valida. Revise los datos ingresados.';
    }

    if (typeof backendMessage === 'string' && backendMessage.trim().length > 0) {
      return backendMessage;
    }

    return fallback;
  }

  private startOperationTimer(operation: string): { operation: string; startedAt: number } {
    return {
      operation,
      startedAt: performance.now()
    };
  }

  private finishOperationTimer(timer: { operation: string; startedAt: number }, status: 'ok' | 'error'): void {
    const elapsedMs = Math.round(performance.now() - timer.startedAt);
    console.info(`[POS][${timer.operation}] ${status} - ${elapsedMs}ms`);
  }

  private getNombreProducto(idProducto: number): string {
    return this.findProductoLocalById(idProducto)?.nombre || '';
  }

  private findProductoLocalById(idProducto: number): ProductCatalogItem | undefined {
    const fromCatalogo = this.productosCatalogo.find(item => item.idProducto === idProducto);
    if (fromCatalogo) {
      return fromCatalogo;
    }

    const fromCategoria = this.productosCategoria.find(item => item.idProducto === idProducto);
    if (fromCategoria) {
      return fromCategoria;
    }

    return undefined;
  }

  private refrescarCatalogoEnSegundoPlano(): void {
    this.inventoryFacade.listProducts().subscribe({
      next: (response) => {
        const catalogoBase = this.mapProductosCatalogo(response.data?.productos ?? []);
        this.logStockDebug('refrescarCatalogoEnSegundoPlano:catalogoBase', {
          totalProductos: catalogoBase.length,
          sinStock: catalogoBase.filter(p => p.stockActual <= 0).length,
          muestraSinStock: catalogoBase.filter(p => p.stockActual <= 0).slice(0, 10)
            .map(p => ({ idProducto: p.idProducto, nombre: p.nombre, stockActual: p.stockActual }))
        });
        this.enrichCatalogWithPromotions(catalogoBase).subscribe({
          next: (catalogoPromocionado) => {
            this.productosCatalogo = catalogoPromocionado;

            if (this.categoriaActiva && this.vistaPanelIzq === 'productos') {
              this.inventoryFacade.listProductsByCategory(this.categoriaActiva.idCategoria, {
                page: this.paginaProductos,
                limit: this.limiteProductosPorPagina
              }).subscribe({
                next: (categoriaResponse) => {
                  const productosCategoriaBase = this.mapProductosCatalogo(categoriaResponse.data?.productos ?? []);
                  this.actualizarMetaPaginacionCategoria(categoriaResponse.data);
                  this.enrichCatalogWithPromotions(productosCategoriaBase).subscribe({
                    next: (productosPromocionados) => {
                      this.productosCategoria = productosPromocionados;
                    },
                    error: () => {
                      this.productosCategoria = productosCategoriaBase;
                    }
                  });
                },
                error: (error) => {
                  console.warn('No se pudo refrescar la categoría activa:', error);
                }
              });
            }
          },
          error: () => {
            this.productosCatalogo = catalogoBase;
          }
        });
      },
      error: (error) => {
        console.warn('No se pudo refrescar catalogo en segundo plano:', error);
      }
    });
  }

  private cargarPaginaProductosCategoria(page: number): void {
    if (!this.categoriaActiva) {
      return;
    }

    this.cargandoProductos = true;
    this.inventoryFacade.listProductsByCategory(this.categoriaActiva.idCategoria, {
      page,
      limit: this.limiteProductosPorPagina
    }).subscribe({
      next: (response) => {
        const productosBase = this.mapProductosCatalogo(response.data?.productos ?? []);
        this.actualizarMetaPaginacionCategoria(response.data);
        this.enrichCatalogWithPromotions(productosBase).subscribe({
          next: (productosPromocionados) => {
            this.productosCategoria = productosPromocionados;
            this.paginaProductos = this.normalizarPaginaActual(response.data?.pagina, page);
            this.cargandoProductos = false;
          },
          error: () => {
            this.productosCategoria = productosBase;
            this.paginaProductos = this.normalizarPaginaActual(response.data?.pagina, page);
            this.cargandoProductos = false;
          }
        });
      },
      error: (error) => {
        console.error('No se pudieron cargar los productos por categoría:', error);
        this.productosCategoria = [];
        this.cargandoProductos = false;
      }
    });
  }

  private actualizarMetaPaginacionCategoria(data: any): void {
    const totalPaginas = Number(data?.totalPaginas ?? 1);
    const total = Number(data?.total ?? 0);

    this.totalPaginasProductos = Number.isFinite(totalPaginas) && totalPaginas > 0 ? totalPaginas : 1;
    this.totalProductosCategoria = Number.isFinite(total) && total >= 0 ? total : 0;
  }

  private normalizarPaginaActual(paginaRespuesta: unknown, fallback: number): number {
    const pagina = Number(paginaRespuesta ?? fallback);
    if (!Number.isFinite(pagina) || pagina <= 0) {
      return fallback;
    }

    return pagina;
  }

  private mapProductosCatalogo(productosRaw: any[]): ProductCatalogItem[] {
    const mapeados = productosRaw
      .filter((item: any) => item.activo)
      .map((item: any) => ({
        idProducto: item.idProducto,
        nombre: item.nombre,
        precio: Number(item.precio),
        precioOriginal: Number(item.precio),
        precioPromocional: null,
        tienePromocion: false,
        idCategoria: Number(item.idCategoria || 0),
        stockActual: Number(item.stockActual || 0),
        urlImagen: this.inventoryApi.getProductImageUrl(item.idProducto)
      }));

    const conStockInvalido = mapeados.filter(item => !Number.isFinite(item.stockActual));
    if (conStockInvalido.length > 0) {
      this.logStockDebug('mapProductosCatalogo:stock-invalido-post-mapeo', {
        totalInvalidos: conStockInvalido.length,
        muestra: conStockInvalido.slice(0, 10)
      });
    }

    return mapeados;
  }

  private logStockDebug(evento: string, payload: Record<string, unknown>): void {
    if (!this.stockDebugEnabled) {
      return;
    }

    console.log(`[POS-STOCK-DEBUG] ${evento}`, payload);
  }

  private debugFetchStockFromApi(idProducto: number, contexto: string): void {
    if (!this.stockDebugEnabled) {
      return;
    }

    this.inventoryApi.getCatalogDetail(idProducto).subscribe({
      next: (response) => {
        const apiProducto = response?.data as any;
        this.logStockDebug('debugFetchStockFromApi:ok', {
          contexto,
          idProducto,
          statusApi: response?.success,
          productoApi: apiProducto
            ? {
              idProducto: apiProducto.idProducto,
              nombre: apiProducto.nombre,
              stockActual: apiProducto.stockActual,
              activo: apiProducto.activo
            }
            : null
        });
      },
      error: (error) => {
        this.logStockDebug('debugFetchStockFromApi:error', {
          contexto,
          idProducto,
          status: (error as any)?.status,
          backendError: (error as any)?.error,
          message: (error as any)?.message
        });
      }
    });
  }

  private enrichCatalogWithPromotions(productos: ProductCatalogItem[]): Observable<ProductCatalogItem[]> {
    const ids = productos.map(item => item.idProducto);

    return this.ordersFacade.getProductsPromotionPricing(ids).pipe(
      map((promosById: Record<number, ProductPromotionPricingItem>) =>
        productos.map(producto => {
          const promo = promosById[producto.idProducto];
          const tienePromocion = Boolean(promo?.tienePromocion && promo?.precioPromocional !== null);

          if (!tienePromocion) {
            return {
              ...producto,
              precio: producto.precioOriginal,
              precioPromocional: null,
              tienePromocion: false
            };
          }

          return {
            ...producto,
            precioOriginal: Number(promo?.precioOriginal || producto.precioOriginal),
            precioPromocional: Number(promo?.precioPromocional),
            precio: Number(promo?.precioPromocional),
            tienePromocion: true
          };
        })
      ),
      catchError(() => of(productos))
    );
  }

  private extractCategorias(rawData: unknown): unknown[] {
    if (Array.isArray(rawData)) {
      return rawData;
    }

    if (!rawData || typeof rawData !== 'object') {
      return [];
    }

    const container = rawData as Record<string, unknown>;
    const posibles = [
      container['categorias'],
      container['categories'],
      container['items'],
      container['results'],
      container['data']
    ];

    for (const value of posibles) {
      if (Array.isArray(value)) {
        return value;
      }
    }

    return [];
  }
}
