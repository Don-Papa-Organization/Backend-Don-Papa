import { ApiResponseDto } from "../../../../types/api-response.dto";
import { Producto } from "../../models/producto.model";
import { CatalogProductPromotionFields } from "../../../../types/catalog-promotion.type";

export interface CatalogProductEnrichedDto extends Producto, CatalogProductPromotionFields {
  promotion?: unknown;
}

export interface CatalogoProductosEnriquecidoDataDto {
  productos: CatalogProductEnrichedDto[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export type ListCatalogEnrichedResponseDto = ApiResponseDto<CatalogoProductosEnriquecidoDataDto>;
