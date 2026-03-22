import { Component, OnDestroy, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, interval } from 'rxjs';
import { Pedido, EstadoPedido } from '../../../../../domain/orders/models/pedido.model';
import { OrdersApi } from '../../../../../services/apis/orders.api';

@Component({
  selector: 'app-web-orders-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './web-orders-badge.component.html',
  styleUrl: './web-orders-badge.component.scss'
})
export class WebOrdersBadgeComponent implements OnInit, OnDestroy {
  isOpen = false;
  loading = false;
  pedidos: Pedido[] = [];
  error = '';
  updatingId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private ordersApi: OrdersApi,
    private elRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.loadPedidos();
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadPedidos(true));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  get inProgressCount(): number {
    return this.pedidos.filter(p =>
      p.estado === EstadoPedido.SIN_CONFIRMAR || p.estado === EstadoPedido.PENDIENTE
    ).length;
  }

  get sinConfirmar(): Pedido[] {
    return this.pedidos.filter(p => p.estado === EstadoPedido.SIN_CONFIRMAR);
  }

  get pendiente(): Pedido[] {
    return this.pedidos.filter(p => p.estado === EstadoPedido.PENDIENTE);
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadPedidos();
    }
  }

  private loadPedidos(silent = false): void {
    if (!silent) this.loading = true;
    this.error = '';

    this.ordersApi.listAllOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          if (!response.success || !response.data) {
            this.error = 'No se pudieron cargar los pedidos.';
            return;
          }
          this.pedidos = response.data.filter((p: Pedido) => p.canalVenta === 'web');
        },
        error: () => {
          this.loading = false;
          if (!silent) this.error = 'Error al conectar con el servidor.';
        }
      });
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
          { value: 'entregado', label: 'Entregar' },
          { value: 'cancelado', label: 'Cancelar' }
        ];
      default:
        return [];
    }
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

  cambiarEstado(idPedido: number, nuevoEstado: string): void {
    if (this.updatingId !== null) return;
    this.updatingId = idPedido;

    this.ordersApi.updateOrderStatus(idPedido, { nuevoEstado: nuevoEstado as any })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
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

  isUpdating(id: number): boolean {
    return this.updatingId === id;
  }
}
