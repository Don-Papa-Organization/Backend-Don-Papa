import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Pedido, EstadoPedido } from '../../../../../../../domain/orders/models/pedido.model';
import { OrdersApi } from '../../../../../../../services/apis/orders.api';
import { SharedModule } from '../../../../../../../shared/shared-module';
import { UiOrderItemComponent } from '../../../../../../../shared/ui/order-item/order-item.component';
import { LayoutModule } from '../../../../../../../shared/layout/layout-module';
import { TabItem } from '../../../../../../../shared/ui/ui-tabs/ui-tabs';

interface OrderSectionState {
  loading: boolean;
  error: string;
  pedidos: Pedido[];
}

@Component({
  selector: 'app-orders-consolidated',
  standalone: true,
  imports: [CommonModule, SharedModule, LayoutModule, UiOrderItemComponent],
  templateUrl: './orders-consolidated.page.html',
  styleUrl: './orders-consolidated.page.scss'
})
export class OrdersConsolidatedPage implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  activeTab: string = 'en-progreso';
  
  tabItems: TabItem[] = [
    { id: 'en-progreso', label: 'En progreso' },
    { id: 'historial', label: 'Historial' }
  ];

  enProgreso: OrderSectionState = {
    loading: true,
    error: '',
    pedidos: []
  };

  historial: OrderSectionState = {
    loading: true,
    error: '',
    pedidos: []
  };

  constructor(private readonly ordersApi: OrdersApi) {}

  ngOnInit(): void {
    this.cargarPedidosEnProgreso();
    this.cargarHistorial();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarPedidosEnProgreso(): void {
    this.enProgreso.loading = true;
    this.enProgreso.error = '';

    this.ordersApi
      .listOrdersInProgress()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.enProgreso.error = response.message || 'No se pudo cargar los pedidos en progreso.';
            this.enProgreso.loading = false;
            return;
          }

          // Filtrar solo pedidos con estado 'pendiente' o 'sin_confirmar'
          this.enProgreso.pedidos = (response.data || []).filter(
            p => p.estado === EstadoPedido.PENDIENTE || p.estado === EstadoPedido.SIN_CONFIRMAR
          );
          this.enProgreso.loading = false;
        },
        error: (error) => {
          this.enProgreso.error = error?.message || 'No se pudo cargar los pedidos en progreso.';
          this.enProgreso.loading = false;
        }
      });
  }

  private cargarHistorial(): void {
    this.historial.loading = true;
    this.historial.error = '';

    this.ordersApi
      .listOrderHistory()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.historial.error = response.message || 'No se pudo cargar el historial de pedidos.';
            this.historial.loading = false;
            return;
          }

          // Filtrar solo pedidos con estado 'entregado'
          this.historial.pedidos = (response.data || []).filter(
            p => p.estado === EstadoPedido.ENTREGADO
          );
          this.historial.loading = false;
        },
        error: (error) => {
          this.historial.error = error?.message || 'No se pudo cargar el historial de pedidos.';
          this.historial.loading = false;
        }
      });
  }

  onTabChange(tabId: string): void {
    this.activeTab = tabId;
  }

  reintentar(section: 'enProgreso' | 'historial'): void {
    if (section === 'enProgreso') {
      this.cargarPedidosEnProgreso();
    } else {
      this.cargarHistorial();
    }
  }

  get enProgresoVacio(): boolean {
    return !this.enProgreso.loading && this.enProgreso.pedidos.length === 0;
  }

  get historialVacio(): boolean {
    return !this.historial.loading && this.historial.pedidos.length === 0;
  }

  descargarComprobante(idPedido: number): void {
    this.ordersApi
      .downloadReceiptByOrderId(idPedido)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          const blob = new Blob([data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `comprobante-pedido-${idPedido}.pdf`;
          anchor.click();
          window.URL.revokeObjectURL(url);
        }
      });
  }
}
