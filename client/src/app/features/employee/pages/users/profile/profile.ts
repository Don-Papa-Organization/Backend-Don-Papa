import { Component, OnInit } from '@angular/core';
import { UsersFacade } from '../services/users.facade';
import { AuthProfileResponseDto } from '../../../../../domain/users/dtos/response/auth-profile.response.dto';
import { OrdersFacade } from '../../orders/services/orders.facade';
import { Pago } from '../../../../../domain/orders/models/pago.model';
import { AccionTabla, TablaColumnaDef } from '../../../../../shared/ui/ui-tabla/ui-tabla';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ReportsFacade } from '../../reports/services/reports.facade';

type TipoReporte = 'incidente' | 'comentario';

interface ReporteForm {
  descripcion: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

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

  mostrarModalReporte = false;
  procesandoReporte = false;
  mensajeReporte = '';
  tipoMensajeReporte: 'success' | 'error' = 'success';
  tipoReporteActivo: TipoReporte = 'comentario';
  formReporte: ReporteForm = {
    descripcion: '',
    fecha: '',
    horaInicio: '',
    horaFin: ''
  };

  constructor(
    private usersFacade: UsersFacade,
    private ordersFacade: OrdersFacade,
    private reportsFacade: ReportsFacade,
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

  abrirModalReporte(tipo: TipoReporte): void {
    this.tipoReporteActivo = tipo;
    this.mostrarModalReporte = true;
    this.mensajeReporte = '';
    this.tipoMensajeReporte = 'success';
    this.formReporte = {
      descripcion: '',
      fecha: '',
      horaInicio: '',
      horaFin: ''
    };
  }

  cerrarModalReporte(): void {
    if (this.procesandoReporte) {
      return;
    }

    this.mostrarModalReporte = false;
    this.mensajeReporte = '';
  }

  guardarReporte(): void {
    const descripcion = this.formReporte.descripcion.trim();

    if (!descripcion) {
      this.mensajeReporte = 'Ingrese una descripción para registrar el reporte.';
      this.tipoMensajeReporte = 'error';
      return;
    }

    const dto = {
      descripcion,
      ...(this.formReporte.fecha ? { fecha: this.formReporte.fecha } : {}),
      ...(this.formReporte.horaInicio ? { horaInicio: this.formReporte.horaInicio } : {}),
      ...(this.formReporte.horaFin ? { horaFin: this.formReporte.horaFin } : {})
    };

    this.procesandoReporte = true;
    const request$ =
      this.tipoReporteActivo === 'incidente'
        ? this.reportsFacade.registerIncident(dto)
        : this.reportsFacade.registerComment(dto);

    request$.subscribe({
      next: () => {
        this.procesandoReporte = false;
        this.mensajeReporte =
          this.tipoReporteActivo === 'incidente'
            ? 'Incidente registrado correctamente.'
            : 'Comentario registrado correctamente.';
        this.tipoMensajeReporte = 'success';

        this.formReporte = {
          descripcion: '',
          fecha: '',
          horaInicio: '',
          horaFin: ''
        };
      },
      error: (err) => {
        this.procesandoReporte = false;
        this.mensajeReporte = err?.error?.message || 'No se pudo registrar el reporte.';
        this.tipoMensajeReporte = 'error';
      }
    });
  }
}
  