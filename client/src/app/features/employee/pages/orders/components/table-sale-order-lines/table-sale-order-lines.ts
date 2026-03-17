import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PosOrderSummary } from '../../services/orders.facade';
import { TablaColumnaDef } from '../../../../../../shared/ui/ui-tabla/ui-tabla';

@Component({
  selector: 'app-table-sale-order-lines',
  standalone: false,
  templateUrl: './table-sale-order-lines.html',
  styleUrl: './table-sale-order-lines.scss'
})
export class TableSaleOrderLinesComponent {
  @Input() pedidoActual: PosOrderSummary | null = null;
  @Input() procesando = false;
  @Input() minFilasVisibles = 10;

  readonly columns: TablaColumnaDef[] = [
    {
      key: 'nombre',
      label: 'Producto',
      align: 'left',
      minWidth: '220px'
    },
    {
      key: 'precioUnitarioFormatted',
      label: 'Precio',
      align: 'right',
      width: '120px'
    },
    {
      key: 'cantidad',
      label: 'Cantidad',
      align: 'center',
      width: '140px'
    },
    {
      key: 'subtotalFormatted',
      label: 'Subtotal',
      align: 'right',
      width: '140px'
    },
    {
      key: 'eliminar',
      label: '',
      align: 'center',
      width: '48px'
    }
  ];

  @Output() incrementarLinea = new EventEmitter<number>();
  @Output() decrementarLinea = new EventEmitter<number>();
  @Output() eliminarLinea = new EventEmitter<number>();

  get lineasTabla(): Array<Record<string, any>> {
    const lineasPedido = (this.pedidoActual?.lineas ?? []).map((linea) => ({
      ...linea,
      __empty: false,
      precioUnitarioFormatted: `$${Number(linea.precioUnitario || 0).toFixed(2)}`,
      subtotalFormatted: `$${Number(linea.subtotal || 0).toFixed(2)}`
    }));

    const filasFaltantes = Math.max(0, this.minFilasVisibles - lineasPedido.length);
    const filasVacias = Array.from({ length: filasFaltantes }, (_, index) => ({
      idProducto: null,
      nombre: '',
      cantidad: 0,
      precioUnitarioFormatted: '',
      subtotalFormatted: '',
      __empty: true,
      __key: `empty-${index}`
    }));

    return [...lineasPedido, ...filasVacias];
  }
}
