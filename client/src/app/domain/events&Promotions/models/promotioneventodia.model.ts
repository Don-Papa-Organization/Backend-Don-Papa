export interface PromocionDetalleDto {
  idPromocion: number;
  nombre: string;
  descripcion?: string;
  tipoPromocion: 'porcentaje' | 'precio_fijo';
  porcentajeDescuento?: number;
  precioFijo?: number;
  fechainicio: string;
  fechafin: string;
  activo: boolean;
}

export interface PromotionEventDayItem {
  idPromocionEventoDia: number;
  idPromocion: number;
  idEventoDiaSemana: number;
  detallePromocion?: PromocionDetalleDto;
  detalleDiaEvento?: {
    idEventoDiaSemana: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    idEvento: number;
  };
}

export interface PromotionsByEventDayResponse {
  idEventoDiaSemana: number;
  totalPromociones: number;
  promociones: PromotionEventDayItem[];
}

