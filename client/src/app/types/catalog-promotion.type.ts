export interface CatalogPromotionSummary {
  idPromocion: number | null;
  nombrePromocion: string | null;
  precioPromocional: number | null;
  porcentajeDescuento: number | null;
  tienePromocion: boolean;
}

export interface CatalogProductPromotionFields {
  precioOriginal: number;
  precioPromocional: number | null;
  porcentajeDescuento: number | null;
  tienePromocion: boolean;
  promotionSummary?: CatalogPromotionSummary | null;
}
