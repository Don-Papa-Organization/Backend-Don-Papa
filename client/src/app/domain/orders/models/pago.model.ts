import { Pedido } from "./pedido.model";

export interface MetodoPago {
    idMetodoPago: number;
    nombre: string;
}

export interface PagoDetalle {
    idMetodoPago: number;
    nombre?: string;
    monto: number;
}

export interface Pago {
    idPago: number;
    urlComprobante: string;
    monto: number;
    fechaPago: string;
    idPedido: number;
    idMetodoPago: number;
    detalles?: PagoDetalle[];
    metodoPago?: MetodoPago;
    pedido?: Pedido & { tipoAtencion?: 'local' | 'llevar' };
}