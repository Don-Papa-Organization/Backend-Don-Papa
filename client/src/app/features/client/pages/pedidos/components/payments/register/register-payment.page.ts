import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmOrderRequestDto } from '../../../../../../../domain/orders/dtos/request/confirm-order.request.dto';
import { RegisterPaymentRequestDto } from '../../../../../../../domain/orders/dtos/request/register-payment.request.dto';
import { MetodoPago } from '../../../../../../../domain/orders/models/pago.model';
import { AuthProfileResponseDto } from '../../../../../../../domain/users/dtos/response/auth-profile.response.dto';
import { OrdersApi } from '../../../../../../../services/apis/orders.api';
import { UsersApi } from '../../../../../../../services/apis/users.api';
import { SharedModule } from '../../../../../../../shared/shared-module';

@Component({
  selector: 'app-register-payment-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './register-payment.page.html',
  styleUrl: './register-payment.page.scss'
})
export class RegisterPaymentPage implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  readonly mensajePerfilIncompleto = 'Informacion de perfil incompleta, por favor completa tus datos antes de pagar';
  readonly pasosError: string[] = [];

  idPedido: number | null = null;
  montoPedido = 0;

  metodos: MetodoPago[] = [];
  metodoTarjetaId: number | null = null;

  loading = false;
  confirmandoOrden = false;
  registrando = false;
  error = '';
  exitoso = false;
  mostrarToastBloqueoPerfil = false;
  perfilValidado = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly ordersApi: OrdersApi,
    private readonly usersApi: UsersApi
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const rawId = params.get('idPedido');

      console.log('[TRACE-PAY] paramMap - rawId:', rawId);

      if (!rawId || rawId === 'pending') {
        console.log('[TRACE-PAY] idPedido es "pending", se creara la orden al confirmar pago');
        this.idPedido = null;
        this.loading = true;
        this.validarPerfilYCargarMetodos();
        return;
      }

      const id = Number(rawId);
      if (Number.isNaN(id)) {
        this.error = 'El ID de pedido no es valido.';
        return;
      }

      this.idPedido = id;
      console.log('[TRACE-PAY] idPedido de URL:', this.idPedido);
      this.loading = true;
      this.validarPerfilYCargarMetodos();
    });
  }

  ngOnDestroy(): void {
    this.clearToastTimer();
    this.destroy$.next();
    this.destroy$.complete();
  }

  get puedeRegistrar(): boolean {
    const metodoOk = this.metodoTarjetaId !== null;
    const perfilOk = this.perfilValidado;

    console.log('[TRACE-PAY] puedeRegistrar:', {
      metodoOk,
      perfilOk,
      idPedido: this.idPedido,
      montoPedido: this.montoPedido,
      registering: this.registrando
    });

    return metodoOk && !this.registrando && perfilOk;
  }

  get nombreMetodoSeleccionado(): string {
    const metodo = this.metodos.find(m => m.idMetodoPago === this.metodoTarjetaId);
    return metodo?.nombre || 'No seleccionado';
  }

  registrarPago(): void {
    console.log('[TRACE-PAY] registrarPago()');

    if (!this.perfilValidado) {
      console.log('[TRACE-PAY] Perfil no validado, re-validando...');
      this.loading = true;
      this.validarPerfilYCargarMetodos();
      return;
    }

    if (!this.puedeRegistrar) {
      console.log('[TRACE-PAY] BLOQUEADO: puedeRegistrar es false');
      return;
    }

    this.confirmandoOrden = true;
    this.error = '';

    if (this.idPedido !== null) {
      console.log('[TRACE-PAY] Pedido ya existe, omitiendo confirmOrder');
      this.ejecutarRegistroPago(this.idPedido);
      return;
    }

    console.log('[TRACE-PAY] Creando orden via confirmOrder...');
    const dto: ConfirmOrderRequestDto = {};

    this.ordersApi.confirmOrder(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('[TRACE-PAY] confirmOrder response:', JSON.stringify(response));

          if (!response.success || !response.data) {
            this.pasosError.push('FAIL: confirmOrder failed: ' + response.message);
            console.log('[TRACE-PAY] FAIL: confirmOrder');
            this.error = response.message || 'No se pudo crear el pedido.';
            this.confirmandoOrden = false;
            return;
          }

          const idPedidoResponse = (response.data as any)?.data?.pedido?.idPedido;
          console.log('[TRACE-PAY] idPedido de confirmOrder:', idPedidoResponse);

          if (!idPedidoResponse) {
            this.pasosError.push('FAIL: confirmOrder no retorno idPedido');
            this.error = 'No se pudo obtener el ID del pedido.';
            this.confirmandoOrden = false;
            return;
          }

          this.idPedido = idPedidoResponse;
          this.pasosError.push('OK: Orden confirmada, idPedido=' + idPedidoResponse);
          this.ejecutarRegistroPago(idPedidoResponse);
        },
        error: (err) => {
          this.pasosError.push('FAIL: confirmOrder error: ' + JSON.stringify(err));
          console.log('[TRACE-PAY] confirmOrder ERROR:', err);
          this.error = err?.error?.message || err?.message || 'No se pudo crear el pedido.';
          this.confirmandoOrden = false;
        }
      });
  }

  private ejecutarRegistroPago(idPedido: number): void {
    console.log('[TRACE-PAY] ejecutarRegistroPago() - idPedido:', idPedido);
    console.log('[TRACE-PAY] metodoTarjetaId:', this.metodoTarjetaId);
    console.log('[TRACE-PAY] montoPedido:', this.montoPedido);

    if (!this.metodoTarjetaId) {
      console.log('[TRACE-PAY] FAIL: metodoTarjetaId es null');
      this.error = 'No se encontro el metodo de pago por tarjeta.';
      this.confirmandoOrden = false;
      return;
    }

    this.registrando = true;
    this.error = '';
    this.exitoso = false;

    const dto: RegisterPaymentRequestDto = {
      idMetodoPago: this.metodoTarjetaId
    };

    console.log('[TRACE-PAY] Llamando registerPayment con dto:', JSON.stringify(dto));

    this.ordersApi
      .registerPayment(idPedido, dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('[TRACE-PAY] registerPayment response:', JSON.stringify(response));

          if (!response.success) {
            console.log('[TRACE-PAY] FAIL: registerPayment success=false');
            this.error = response.message || 'No se pudo registrar el pago.';
            this.registrando = false;
            return;
          }

          console.log('[TRACE-PAY] SUCCESS: Pago registrado');
          this.exitoso = true;
          this.registrando = false;
          this.confirmandoOrden = false;

          setTimeout(() => {
            this.router.navigate(['/client/perfil'], { queryParams: { seccion: 'pedidos' } });
          }, 2000);
        },
        error: (err) => {
          console.log('[TRACE-PAY] registerPayment ERROR:', err);
          console.log('[TRACE-PAY] error.error:', JSON.stringify(err?.error));
          this.error = err?.error?.message || err?.message || 'No se pudo registrar el pago.';
          this.registrando = false;
          this.confirmandoOrden = false;
        }
      });
  }

  private validarPerfilYCargarMetodos(): void {
    this.usersApi.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profileResponse) => {
          console.log('[TRACE-PAY] getProfile response:', JSON.stringify(profileResponse));

          if (!profileResponse.success || !profileResponse.data) {
            this.error = profileResponse.message || 'No se pudo cargar el perfil.';
            this.loading = false;
            return;
          }

          if (!this.esPerfilCompleto(profileResponse.data)) {
            this.mostrarToastPerfilIncompleto();
            this.loading = false;
            return;
          }

          this.perfilValidado = true;
          this.cargarMetodosYDetalle();
        },
        error: (err) => {
          console.log('[TRACE-PAY] getProfile ERROR:', err);
          this.error = 'No se pudo validar el perfil.';
          this.loading = false;
        }
      });
  }

  private cargarMetodosYDetalle(): void {
    this.ordersApi.listPaymentMethods()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('[TRACE-PAY] listPaymentMethods response:', JSON.stringify(response));

          if (!response.success) {
            this.error = response.message || 'No se pudieron cargar los metodos de pago.';
            this.loading = false;
            return;
          }

          this.metodos = response.data || [];

          const metodoAuto = this.metodos.length > 0 ? this.metodos[0] : null;

          if (metodoAuto) {
            this.metodoTarjetaId = metodoAuto.idMetodoPago;
            console.log('[TRACE-PAY] Metodo auto-seleccionado: id=', this.metodoTarjetaId, 'nombre=', metodoAuto.nombre);
          }

          this.metodos.forEach(m => {
            console.log(`[TRACE-PAY] metodo disponible: id=${m.idMetodoPago}, nombre=${m.nombre}`);
          });

          if (this.idPedido !== null) {
            this.cargarDetallePedido(this.idPedido);
          } else {
            this.loading = false;
            console.log('[TRACE-PAY] Sin idPedido aun, esperando confirmacion de usuario');
          }
        },
        error: (err) => {
          console.log('[TRACE-PAY] listPaymentMethods ERROR:', err);
          this.error = err?.message || 'No se pudieron cargar los metodos de pago.';
          this.loading = false;
        }
      });
  }

  private cargarDetallePedido(idPedido: number): void {
    this.ordersApi.getCustomerOrderDetail(idPedido)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('[TRACE-PAY] getCustomerOrderDetail response:', JSON.stringify(response));

          if (!response.success || !response.data) {
            this.error = response.message || 'No se pudo cargar el pedido.';
            this.loading = false;
            return;
          }

          this.montoPedido = response.data.total;
          console.log('[TRACE-PAY] montoPedido:', this.montoPedido);
          console.log('[TRACE-PAY] puedeRegistrar FINAL:', this.puedeRegistrar);
          this.loading = false;
        },
        error: (err) => {
          console.log('[TRACE-PAY] getCustomerOrderDetail ERROR:', err);
          this.error = err?.message || 'No se pudo cargar el pedido.';
          this.loading = false;
        }
      });
  }

  irACuentaPorBloqueo(): void {
    this.cerrarToastBloqueo();
    this.router.navigate(['/client/perfil']);
  }

  cerrarToastBloqueo(): void {
    this.mostrarToastBloqueoPerfil = false;
    this.clearToastTimer();
  }

  private esPerfilCompleto(profile: AuthProfileResponseDto): boolean {
    const nombre = profile.cliente?.nombre?.trim() || '';
    const direccion = profile.cliente?.direccion?.trim() || '';
    const telefono = profile.cliente?.telefono?.trim() || '';
    const telefonoValido = /^\d{10}$/.test(telefono);
    return !!nombre && !!direccion && telefonoValido;
  }

  private mostrarToastPerfilIncompleto(): void {
    this.mostrarToastBloqueoPerfil = true;
    this.clearToastTimer();
    this.toastTimer = setTimeout(() => {
      this.mostrarToastBloqueoPerfil = false;
      this.toastTimer = null;
    }, 5000);
  }

  private clearToastTimer(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
  }

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(valor) || 0);
  }

  volver(): void {
    this.router.navigate(['/client/carrito']);
  }
}
