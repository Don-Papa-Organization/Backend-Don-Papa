import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MetodoPago } from '../../../../../../../domain/orders/models/pago.model';
import { OrdersApi } from '../../../../../../../services/apis/orders.api';
import { SharedModule } from '../../../../../../../shared/shared-module';

@Component({
  selector: 'app-payment-methods-page',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './payment-methods.page.html',
  styleUrl: './payment-methods.page.scss'
})
export class PaymentMethodsPage implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  metodos: MetodoPago[] = [];

  loading = true;
  error = '';

  constructor(private readonly ordersApi: OrdersApi) {}

  ngOnInit(): void {
    this.cargarMetodos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get vacio(): boolean {
    return !this.loading && !this.error && this.metodos.length === 0;
  }

  reintentar(): void {
    this.cargarMetodos();
  }

  private cargarMetodos(): void {
    this.loading = true;
    this.error = '';

    this.ordersApi
      .listPaymentMethods()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.error = response.message || 'No se pudieron cargar los métodos de pago.';
            this.loading = false;
            return;
          }

          this.metodos = response.data || [];
          this.loading = false;
        },
        error: (error) => {
          this.error = error?.message || 'No se pudieron cargar los métodos de pago.';
          this.loading = false;
        }
      });
  }
}
