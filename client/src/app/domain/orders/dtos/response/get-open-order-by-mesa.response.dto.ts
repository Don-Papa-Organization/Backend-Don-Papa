import { ApiResponseDto } from "../../../../types/api-response.dto";
import { Pedido, ProductoPedidoItem } from "../../models/pedido.model";

export interface GetOpenOrderByMesaDataDto {
  pedido: Pedido;
  productos: ProductoPedidoItem[];
}

export type GetOpenOrderByMesaResponseDto = ApiResponseDto<GetOpenOrderByMesaDataDto>;
