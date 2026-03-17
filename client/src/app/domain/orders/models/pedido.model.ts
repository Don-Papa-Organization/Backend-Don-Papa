export enum CanalVenta {
  WEB = 'web',
  FISICO = 'fisico'
}

export enum TipoAtencion {
  LOCAL = 'local',
  LLEVAR = 'llevar'
}

export enum EstadoPedido {
  SIN_CONFIRMAR = 'sin_confirmar',
  PENDIENTE = 'pendiente',
  ENTREGADO = 'entregado',
  CANCELADO = 'cancelado'
}

// Modelo para el ítem individual del pedido
export interface ProductoPedidoItem {
  idProductoPedido: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  
  // Opcional: puedes enriquecerlo con datos del producto si la API los trae
  productoNombre?: string;
  productoImagen?: string;
}

// Modelo principal del pedido (ENRIQUECIDO)
export interface Pedido {
  idPedido: number;
  idUsuario: number;
  total: number;
  estado: EstadoPedido;
  canalVenta: CanalVenta;
  tipoAtencion?: TipoAtencion;
  fechaPedido: string;
  direccionEntrega?: string;
  idMesa?: number;
  
  // RELACIÓN SIMPLIFICADA: en lugar de FK, el array completo
  productos?: ProductoPedidoItem[];
}