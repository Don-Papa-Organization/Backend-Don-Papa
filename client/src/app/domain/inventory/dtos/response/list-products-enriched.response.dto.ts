import { ApiResponseDto } from "../../../../types/api-response.dto";
import { InventoryProductEnriched } from "../../../../types/inventory-product-enriched.type";

export interface ListProductsEnrichedDataDto {
  productos: InventoryProductEnriched[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export type ListProductsEnrichedResponseDto = ApiResponseDto<ListProductsEnrichedDataDto>;
