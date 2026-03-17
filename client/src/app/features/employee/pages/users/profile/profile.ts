import { Component, OnInit } from '@angular/core';
import { UsersFacade } from '../services/users.facade';
import { AuthProfileResponseDto } from '../../../../../domain/users/dtos/response/auth-profile.response.dto';
import { AuthChangePasswordRequestDto } from '../../../../../domain/users/dtos/request/auth-change-password.request.dto';
import { OrdersFacade } from '../../orders/services/orders.facade';
import { Pago } from '../../../../../domain/orders/models/pago.model';
import { AccionTabla, TablaColumnaDef } from '../../../../../shared/ui/ui-tabla/ui-tabla';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface PaymentHistoryRow {
  idPago: number;
  idPedido: number;
  monto: number;
  fechaPago: string;
  metodo: string;
  estadoRecibo: string;
}

@Component({
  selector: 'app-employee-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class EmployeeProfileComponent implements OnInit {
  perfil: AuthProfileResponseDto | null = null;
  cargando = true;
  error = '';

  cargandoPagos = true;
  errorPagos = '';
  pagosHistorial: PaymentHistoryRow[] = [];
  readonly pagosColumns: TablaColumnaDef[] = [
    { key: 'idPago', label: 'ID Pago', width: '88px' },
    { key: 'idPedido', label: 'Pedido', width: '88px' },
    { key: 'monto', label: 'Monto', minWidth: '100px' },
    { key: 'fechaPago', label: 'Fecha', minWidth: '170px' },
    { key: 'metodo', label: 'Método', minWidth: '130px' },
    { key: 'estadoRecibo', label: 'Estado', minWidth: '110px' },
    { key: 'acciones', label: 'Acciones', type: 'actions', width: '96px', align: 'center' }
  ];

  mostrarModalPreviewRecibo = false;
  reciboSeleccionado: PaymentHistoryRow | null = null;
  reciboURL: SafeResourceUrl | null = null;
  private reciboObjectURL: string | null = null;

  accionesRecibos: AccionTabla[] = [
    {
      urlIcono: 'icons/eye.svg',
      accion: (registro: PaymentHistoryRow) => this.onVerRecibo(registro)
    }
  ];

  mostrarFormClave = false;
  procesandoClave = false;
  mensajeClave = '';
  tipoClave: 'success' | 'error' = 'success';

  formClave: AuthChangePasswordRequestDto = {
    contrasenaActual: '',
    nuevaContrasena: '',
    confirmarContrasena: ''
  };

  constructor(
    private usersFacade: UsersFacade,
    private ordersFacade: OrdersFacade,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
    this.cargarHistorialPagos();
  }

  private cargarPerfil(): void {
    this.usersFacade.getProfile().subscribe({
      next: (response) => {
        this.perfil = response.data ?? null;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el perfil. Intente nuevamente.';
        this.cargando = false;
      }
    });
  }

  private cargarHistorialPagos(): void {
    this.cargandoPagos = true;
    this.errorPagos = '';

    this.ordersFacade.getPaymentHistory({ page: 1, limit: 20 }).subscribe({
      next: (response) => {
        this.pagosHistorial = (response.data ?? []).map((pago) => this.mapPagoRow(pago));
        this.cargandoPagos = false;
      },
      error: () => {
        this.errorPagos = 'No se pudo cargar el historial de pagos.';
        this.cargandoPagos = false;
      }
    });
  }

  private mapPagoRow(pago: Pago): PaymentHistoryRow {
    return {
      idPago: pago.idPago,
      idPedido: pago.idPedido,
      monto: Number(pago.monto) || 0,
      fechaPago: this.formatDate(pago.fechaPago),
      metodo: pago.metodoPago?.nombre || pago.detalles?.[0]?.nombre || `Método #${pago.idMetodoPago}`,
      estadoRecibo: pago.urlComprobante ? 'Disponible' : 'Pendiente'
    };
  }

  private formatDate(value: string): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  }

  onVerRecibo(registro: PaymentHistoryRow): void {
    this.descargarReciboPDF(registro);
  }

  private descargarReciboPDF(registro: PaymentHistoryRow): void {
    this.reciboSeleccionado = registro;
    this.ordersFacade.downloadReceipt(registro.idPago).subscribe({
      next: (data) => {
        const blob = new Blob([data], { type: 'application/pdf' });
        this.reciboObjectURL = window.URL.createObjectURL(blob);
        this.reciboURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.reciboObjectURL);
        this.mostrarModalPreviewRecibo = true;
      },
      error: (err) => {
        console.error('Error al descargar recibo:', err);
        this.errorPagos = 'No fue posible descargar el recibo.';
      }
    });
  }

  onDescargarReciboDirecto(): void {
    if (!this.reciboSeleccionado || !this.reciboObjectURL) return;

    const link = document.createElement('a');
    link.href = this.reciboObjectURL;
    link.download = `recibo-pago-${this.reciboSeleccionado.idPago}.pdf`;
    link.click();
  }

  cerrarModalPreviewRecibo(): void {
    if (this.reciboObjectURL) {
      window.URL.revokeObjectURL(this.reciboObjectURL);
    }
    this.mostrarModalPreviewRecibo = false;
    this.reciboSeleccionado = null;
    this.reciboURL = null;
    this.reciboObjectURL = null;
  }

  toggleFormClave(): void {
    this.mostrarFormClave = !this.mostrarFormClave;
    this.mensajeClave = '';
    this.formClave = { contrasenaActual: '', nuevaContrasena: '', confirmarContrasena: '' };
  }

  cambiarContrasena(): void {
    if (!this.formClave.contrasenaActual || !this.formClave.nuevaContrasena || !this.formClave.confirmarContrasena) {
      this.mensajeClave = 'Complete todos los campos.';
      this.tipoClave = 'error';
      return;
    }
    if (this.formClave.nuevaContrasena !== this.formClave.confirmarContrasena) {
      this.mensajeClave = 'La nueva contraseña y la confirmación no coinciden.';
      this.tipoClave = 'error';
      return;
    }

    this.procesandoClave = true;
    this.usersFacade.changePassword(this.formClave).subscribe({
      next: () => {
        this.mensajeClave = 'Contraseña actualizada correctamente.';
        this.tipoClave = 'success';
        this.procesandoClave = false;
        this.formClave = { contrasenaActual: '', nuevaContrasena: '', confirmarContrasena: '' };
      },
      error: (err) => {
        this.mensajeClave = err?.error?.message || 'No se pudo cambiar la contraseña.';
        this.tipoClave = 'error';
        this.procesandoClave = false;
      }
    });
  }
}
  