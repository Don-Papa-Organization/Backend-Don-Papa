import { ApiResponseDto } from "../../../../types/api-response.dto";
import { Pedido, ProductoPedidoItem } from "../../models/pedido.model";

export interface UpdateOrderProductQuantityDataDto {
  pedido: Pedido;
  productoPedido: ProductoPedidoItem;
}

export type UpdateOrderProductQuantityResponseDto = ApiResponseDto<UpdateOrderProductQuantityDataDto>;
