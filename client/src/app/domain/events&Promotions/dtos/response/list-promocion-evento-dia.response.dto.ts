import { PromotionEventDayItem, PromotionsByEventDayResponse } from "../../models/promotioneventodia.model";

export interface ListPromocionEventoDiaResponseDto {
  items: PromotionEventDayItem[];
}

// Para cuando se solicita promociones de un día específico
export type GetPromocionesEventoDiaResponseDto = PromotionsByEventDayResponse;

