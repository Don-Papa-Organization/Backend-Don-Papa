import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { InventoryApi } from '../../../../../services/apis/inventory.api';
import { ApiResponse } from '../../../../../types/api-response.type';
import { Producto } from '../../../../../domain/inventory/models/producto.model';
import { CategoriaProducto } from '../../../../../domain/inventory/models/categoriaProducto.model';
import { ListProductsRequestDto } from '../../../../../domain/inventory/dtos/request/list-products.request.dto';
import { SearchProductsByNameRequestDto } from '../../../../../domain/inventory/dtos/request/search-products-by-name.request.dto';
import { ListProductsByCategoryRequestDto } from '../../../../../domain/inventory/dtos/request/list-products-by-category.request.dto';
import { ListProductsEnrichedRequestDto } from '../../../../../domain/inventory/dtos/request/list-products-enriched.request.dto';
import { UpdateProductStockRequestDto } from '../../../../../domain/inventory/dtos/request/update-product-stock.request.dto';
import { ListProductsDataDto } from '../../../../../domain/inventory/dtos/response/list-products.response.dto';
import { ListProductsEnrichedDataDto } from '../../../../../domain/inventory/dtos/response/list-products-enriched.response.dto';

@Injectable({
  providedIn: 'root'
})
export class InventoryFacade {
  constructor(private inventoryApi: InventoryApi) { }

  listProducts(dto?: ListProductsRequestDto): Observable<ApiResponse<ListProductsDataDto>> {
    return this.inventoryApi.listProducts(dto);
  }

  searchProductsByName(
    nombreOrDto: string | SearchProductsByNameRequestDto,
    opciones?: Omit<SearchProductsByNameRequestDto, 'nombre'>
  ): Observable<ApiResponse<ListProductsDataDto>> {
    const dto: SearchProductsByNameRequestDto = typeof nombreOrDto === 'string'
      ? {
        nombre: nombreOrDto,
        ...(opciones || {})
      }
      : nombreOrDto;

    return this.inventoryApi.searchProductsByName(dto);
  }

  listProductsByCategory(
    idCategoria: number,
    soloActivosOrDto?: boolean | ListProductsByCategoryRequestDto,
    opciones?: ListProductsByCategoryRequestDto
  ): Observable<ApiResponse<ListProductsDataDto>> {
    const dto: ListProductsByCategoryRequestDto | undefined = typeof soloActivosOrDto === 'boolean'
      ? opciones
      : soloActivosOrDto;

    return this.inventoryApi.listProductsByCategory(idCategoria, dto);
  }

  listProductsEnriched(dto?: ListProductsEnrichedRequestDto): Observable<ApiResponse<ListProductsEnrichedDataDto>> {
    return this.inventoryApi.listProductsEnriched(dto);
  }

  getProduct(id: number): Observable<ApiResponse<Producto>> {
    return this.inventoryApi.getProduct(id);
  }

  updateProductStock(id: number, dto: UpdateProductStockRequestDto): Observable<ApiResponse<Producto>> {
    return this.inventoryApi.updateProductStock(id, dto);
  }

  listCategories(): Observable<ApiResponse<CategoriaProducto[]>> {
    return this.inventoryApi.listCategories();
  }

  getCategory(id: number): Observable<ApiResponse<CategoriaProducto>> {
    return this.inventoryApi.getCategory(id);
  }
}
