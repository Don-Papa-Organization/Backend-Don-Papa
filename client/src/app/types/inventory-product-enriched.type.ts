import { Producto } from "../domain/inventory/models/producto.model";

export interface ProductCategoryInfo {
  idCategoria: number;
  nombre: string;
}

export interface InventoryProductEnriched extends Producto {
  categoria: ProductCategoryInfo | null;
  nombreCategoria: string | null;
}
