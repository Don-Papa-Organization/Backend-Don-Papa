import { ApiResponseDto } from "../../../../types/api-response.dto";

export interface RegisterPaymentDataDto {
  success: boolean;
  message: string;
  data: {
    pedido: {
      idPedido: number;
      total: number;
      estado: string;
      canalVenta: string;
      tipoAtencion?: 'local' | 'llevar';
      fechaPedido: string;
      idMesa?: number;
    };
    pago: {
      idPago: number;
      urlComprobante: string;
      monto: number;
      fechaPago: string;
      idPedido: number;
      idMetodoPago: number;
      montoRecibidoEfectivo?: number;
      vuelto?: number;
      detalles?: Array<{
        idMetodoPago: number;
        nombre?: string;
        monto: number;
      }>;
    };
    rutaPDF: string;
  };
}

export type RegisterPaymentResponseDto = ApiResponseDto<RegisterPaymentDataDto>;