import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CanalVenta, TipoAtencion } from '../../../../../../domain/orders/models/pedido.model';

@Component({
  selector: 'app-table-sale-config',
  standalone: false,
  templateUrl: './table-sale-config.html',
  styleUrl: './table-sale-config.scss'
})
export class TableSaleConfigComponent {
  @Input() canalVenta: CanalVenta = CanalVenta.FISICO;
  @Input() tipoAtencion: TipoAtencion = TipoAtencion.LOCAL;
  @Input() idCliente: number | null = null;
  @Input() direccionEntrega: string | null = null;

  @Output() canalVentaChange = new EventEmitter<CanalVenta>();
  @Output() tipoAtencionChange = new EventEmitter<TipoAtencion>();
  @Output() idClienteChange = new EventEmitter<number | null>();
  @Output() direccionEntregaChange = new EventEmitter<string | null>();

  readonly canalOptions = [
    { value: CanalVenta.WEB, label: 'Web' },
    { value: CanalVenta.FISICO, label: 'Físico' }
  ];

  readonly tipoOptions = [
    { value: TipoAtencion.LOCAL, label: 'Local' },
    { value: TipoAtencion.LLEVAR, label: 'Llevar' }
  ];

  onCanalVentaChange(value: any): void {
    this.canalVentaChange.emit(CanalVenta.FISICO);
  }

  onTipoAtencionChange(value: any): void {
    this.tipoAtencionChange.emit(value === TipoAtencion.LLEVAR ? TipoAtencion.LLEVAR : TipoAtencion.LOCAL);
  }

  onIdClienteChange(value: any): void {
    const parsed = value === '' || value === null || typeof value === 'undefined' ? null : Number(value);
    this.idClienteChange.emit(Number.isFinite(parsed as number) ? parsed : null);
  }

  onDireccionEntregaChange(value: any): void {
    this.direccionEntregaChange.emit(value ? String(value) : null);
  }

}
