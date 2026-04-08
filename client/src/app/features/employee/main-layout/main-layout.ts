import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription, interval } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import * as AuthActions from '../../../domain/auth/state/auth.actions';
import { Pedido, EstadoPedido } from '../../../domain/orders/models/pedido.model';
import { MenuItem } from '../../../shared/interfaces/menu-item';
import { OrdersApi } from '../../../services/apis/orders.api';
import { PosPreferencesService } from '../pages/orders/services/pos-preferences.service';
import { TableSaleHeaderService } from '../pages/orders/services/table-sale-header.service';
import { TablesReservesFacade } from '../pages/tables-reserves/services/tables-reserves.facade';
import { DailyReservationItemDto } from '../../../domain/tables&Reserves/dtos/response/daily-reservations.response.dto';

interface ReservaHeaderItem extends DailyReservationItemDto {
  minutosRestantes?: number;
  puedeConfirmar?: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: false,
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout implements OnInit, OnDestroy {
  constructor(
    private store: Store,
    private router: Router,
    private posPreferences: PosPreferencesService,
    private tableSaleHeader: TableSaleHeaderService,
    private ordersApi: OrdersApi,
    private tablesReservesFacade: TablesReservesFacade
  ) {}

  isPosMode = false;
  autoPrint = true;
  paraLlevar = false;
  posPageTitle = '';
  isTableSaleRoute = false;
  tableSaleTitle = '';

  webPedidos: Pedido[] = [];
  webPedidosLoading = false;
  webPedidosDropdownOpen = false;
  webPedidosUpdatingId: number | null = null;

  reservasHoy: ReservaHeaderItem[] = [];
  reservasHoyLoading = false;
  reservasDropdownOpen = false;

  horaActual = '';

  private routerSub?: Subscription;
  private autoPrintSub?: Subscription;
  private tableSaleHeaderSub?: Subscription;
  private paraLlevarSub?: Subscription;
  private pollSub?: Subscription;
  private clockSub?: Subscription;

  menuItems: MenuItem[] = [
    { texto: 'POS', urlIcono: 'icons/iconoMesas.svg', link: '/employee/orders' },
    { texto: 'Cuadre', urlIcono: 'icons/iconoReportes.svg', link: '/employee/cuadre-caja' },
    { texto: 'Perfil', urlIcono: 'icons/profile.svg', link: '/employee/users' },
    { texto: 'Eventos', urlIcono: 'icons/calendar-yellow.svg', link: '/employee/events-promotions' },
    { texto: 'Pedidos', urlIcono: 'icons/payment.svg', link: '/employee/pedidos-web' }
  ];

  ngOnInit(): void {
    this.autoPrint = this.posPreferences.autoPrintValue;
    this.checkPosMode(this.router.url);

    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.checkPosMode(e.urlAfterRedirects));

    this.autoPrintSub = this.posPreferences.autoPrint$.subscribe(value => {
      this.autoPrint = value;
    });

    this.tableSaleHeaderSub = this.tableSaleHeader.mesaTitle$.subscribe(title => {
      this.tableSaleTitle = title;
    });

    this.paraLlevarSub = this.tableSaleHeader.paraLlevar$.subscribe(value => {
      this.paraLlevar = value;
    });

    this.cargarWebPedidos();
    this.cargarReservasHoy();
    this.actualizarHoraActual();

    this.pollSub = interval(30000).subscribe(() => {
      this.cargarWebPedidos();
      this.cargarReservasHoy(true);
    });

    this.clockSub = interval(60000).subscribe(() => this.actualizarHoraActual());
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.autoPrintSub?.unsubscribe();
    this.tableSaleHeaderSub?.unsubscribe();
    this.paraLlevarSub?.unsubscribe();
    this.pollSub?.unsubscribe();
    this.clockSub?.unsubscribe();
  }

  private checkPosMode(url: string): void {
    const esPos = url.startsWith('/employee/orders');
    this.isTableSaleRoute = /^\/employee\/orders\/table\/\d+/.test(url);

    if (esPos) {
      this.posPageTitle = url.includes('/table/') ? 'PEDIDO DE MESA' : 'VISTA DE MESAS';
    }

    if (this.isTableSaleRoute && !this.tableSaleTitle) {
      const idMesa = this.extractTableId(url);
      this.tableSaleTitle = idMesa ? `Mesa ${idMesa}` : 'Mesa';
    }

    this.isPosMode = esPos;
  }

  private extractTableId(url: string): number | null {
    const match = url.match(/\/employee\/orders\/table\/(\d+)/);
    if (!match) return null;
    const idMesa = Number(match[1]);
    return Number.isFinite(idMesa) && idMesa > 0 ? idMesa : null;
  }

  onLogout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  isMenuItemActive(link: string): boolean {
    return this.router.url === link || this.router.url.startsWith(`${link}/`);
  }

  volverAMesas(): void {
    this.router.navigate(['/employee/orders']);
  }

  onAutoPrintChange(value: boolean): void {
    this.posPreferences.setAutoPrint(value);
  }

  onParaLlevarChange(value: boolean): void {
    this.tableSaleHeader.setParaLlevar(value);
  }

  onReloadTableSale(): void {
    this.tableSaleHeader.requestReload();
  }

  get webPedidosActivos(): Pedido[] {
    return this.webPedidos.filter(p =>
      p.estado === EstadoPedido.SIN_CONFIRMAR || p.estado === EstadoPedido.PENDIENTE
    );
  }

  get webPedidosCount(): number {
    return this.webPedidosActivos.length;
  }

  cargarWebPedidos(): void {
    this.webPedidosLoading = true;
    this.ordersApi.listAllOrders().subscribe({
      next: (response) => {
        this.webPedidosLoading = false;
        if (response.success && response.data) {
          this.webPedidos = response.data.filter((p: Pedido) => p.canalVenta === 'web');
        }
      },
      error: () => {
        this.webPedidosLoading = false;
      }
    });
  }

  toggleWebPedidosDropdown(): void {
    this.webPedidosDropdownOpen = !this.webPedidosDropdownOpen;
  }

  toggleReservasDropdown(): void {
    this.reservasDropdownOpen = !this.reservasDropdownOpen;
    if (this.reservasDropdownOpen) {
      this.cargarReservasHoy();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.web-orders-badge')) {
      this.webPedidosDropdownOpen = false;
    }

    if (!target.closest('.reservas-hoy-badge')) {
      this.reservasDropdownOpen = false;
    }
  }

  closeWebPedidosDropdown(): void {
    this.webPedidosDropdownOpen = false;
  }

  closeReservasDropdown(): void {
    this.reservasDropdownOpen = false;
  }

  cargarReservasHoy(silent = false): void {
    if (!silent) {
      this.reservasHoyLoading = true;
    }

    const hoy = new Date();
    const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    this.tablesReservesFacade.getDailyReservations({ fecha }).subscribe({
      next: (response) => {
        this.reservasHoyLoading = false;
        const reservas = response.data?.reservas ?? [];
        this.reservasHoy = reservas.map((reserva) => {
          const fechaReserva = reserva.fechaCompleta ? new Date(reserva.fechaCompleta) : (reserva.fechaReserva ? new Date(reserva.fechaReserva) : null);
          const minutosRestantes = fechaReserva ? Math.floor((fechaReserva.getTime() - Date.now()) / 60000) : null;

          return {
            ...reserva,
            minutosRestantes: minutosRestantes ?? undefined,
            puedeConfirmar: reserva.estado === 'pendiente' && typeof minutosRestantes === 'number' && minutosRestantes <= 20 && minutosRestantes >= 0
          };
        });
      },
      error: () => {
        this.reservasHoyLoading = false;
      }
    });
  }

  get reservasHoyPendientesCount(): number {
    return this.reservasHoy.filter(reserva => reserva.estado === 'pendiente').length;
  }

  get reservasHoyActivas(): ReservaHeaderItem[] {
    return this.reservasHoy.filter(reserva => reserva.estado !== 'cancelada');
  }

  actualizarHoraActual(): void {
    this.horaActual = new Date().toLocaleTimeString('es-CO', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  irAMesaReserva(idMesa: number): void {
    this.router.navigate(['/employee/orders/table', idMesa]);
    this.closeReservasDropdown();
  }

  confirmarReservaHoy(reserva: ReservaHeaderItem): void {
    if (!reserva.puedeConfirmar) {
      return;
    }

    this.tablesReservesFacade.confirmReservation(reserva.idReserva).subscribe({
      next: () => {
        this.cargarReservasHoy();
        this.posPreferences.triggerReload();
      },
      error: () => this.cargarReservasHoy()
    });
  }

  cancelarReservaHoy(reserva: ReservaHeaderItem): void {
    this.tablesReservesFacade.cancelReservationByStaff(reserva.idReserva).subscribe({
      next: () => {
        this.cargarReservasHoy();
        this.posPreferences.triggerReload();
      },
      error: () => this.cargarReservasHoy()
    });
  }

  getSiguientesEstados(estado: string): Array<{ value: string; label: string }> {
    switch (estado) {
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

  cambiarEstadoWebPedido(idPedido: number, nuevoEstado: string): void {
    if (this.webPedidosUpdatingId !== null) return;
    this.webPedidosUpdatingId = idPedido;

    this.ordersApi.updateOrderStatus(idPedido, { nuevoEstado: nuevoEstado as 'sin_confirmar' | 'pendiente' | 'entregado' | 'cancelado' })
      .subscribe({
        next: (response) => {
          this.webPedidosUpdatingId = null;
          if (response.success && response.data) {
            const idx = this.webPedidos.findIndex(p => p.idPedido === idPedido);
            if (idx !== -1) {
              this.webPedidos[idx] = { ...this.webPedidos[idx], ...response.data };
            }
          }
        },
        error: () => {
          this.webPedidosUpdatingId = null;
        }
      });
  }

  isUpdatingWebPedido(id: number): boolean {
    return this.webPedidosUpdatingId === id;
  }

  formatearFechaCorta(fecha: string): string {
    try {
      return new Date(fecha).toLocaleDateString('es-CO', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
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

  getBadgeClassWeb(estado: string): string {
    switch (estado) {
      case 'sin_confirmar': return 'badge--pending';
      case 'pendiente': return 'badge--confirmed';
      case 'entregado': return 'badge--delivered';
      case 'cancelado': return 'badge--cancelled';
      default: return '';
    }
  }

  getBadgeClassReserva(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'badge--pending';
      case 'confirmada': return 'badge--confirmed';
      case 'cancelada': return 'badge--cancelled';
      default: return '';
    }
  }
}
