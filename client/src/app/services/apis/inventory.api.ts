import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { ApiResponse } from "../../types/api-response.type";
import { Producto } from "../../domain/inventory/models/producto.model";
import { CategoriaProducto } from "../../domain/inventory/models/categoriaProducto.model";
import { ListCatalogRequestDto } from "../../domain/inventory/dtos/request/list-catalog.request.dto";
import { ListProductsRequestDto } from "../../domain/inventory/dtos/request/list-products.request.dto";
import { CreateProductRequestDto } from "../../domain/inventory/dtos/request/create-product.request.dto";
import { UpdateProductRequestDto } from "../../domain/inventory/dtos/request/update-product.request.dto";
import { UpdateProductStockRequestDto } from "../../domain/inventory/dtos/request/update-product-stock.request.dto";
import { CreateCategoryRequestDto } from "../../domain/inventory/dtos/request/create-category.request.dto";
import { UpdateCategoryRequestDto } from "../../domain/inventory/dtos/request/update-category.request.dto";
import { SearchProductsByNameRequestDto } from "../../domain/inventory/dtos/request/search-products-by-name.request.dto";
import { ListProductsByCategoryRequestDto } from "../../domain/inventory/dtos/request/list-products-by-category.request.dto";
import { ListProductsEnrichedRequestDto } from "../../domain/inventory/dtos/request/list-products-enriched.request.dto";
import { CatalogoProductosDataDto } from "../../domain/inventory/dtos/response/list-catalog.response.dto";
import { CatalogoProductosEnriquecidoDataDto } from "../../domain/inventory/dtos/response/list-catalog-enriched.response.dto";
import { ListProductsDataDto } from "../../domain/inventory/dtos/response/list-products.response.dto";
import { ListProductsEnrichedDataDto } from "../../domain/inventory/dtos/response/list-products-enriched.response.dto";
import { AssociateProductCategoryResponseDto } from "../../domain/inventory/dtos/response/associate-product-category.response.dto";
import { API_ENDPOINTS, buildApiUrl } from "../../config/api.config";
import { ImageUrl } from "../../types/image-url.type";

@Injectable({ providedIn: "root" })
export class InventoryApi {
	private readonly baseUrl = buildApiUrl(API_ENDPOINTS.inventory.catalog());
	private readonly productsUrl = buildApiUrl(API_ENDPOINTS.inventory.products());
	private readonly categoriesUrl = buildApiUrl(API_ENDPOINTS.inventory.categories());

	private sanitizeQueryParams(dto?: Record<string, unknown>): Record<string, string | number | boolean> {
		if (!dto) {
			return {};
		}

		return Object.entries(dto).reduce<Record<string, string | number | boolean>>((acc, [key, value]) => {
			if (value === undefined || value === null || value === '') {
				return acc;
			}

			if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
				acc[key] = value;
			}

			return acc;
		}, {});
	}

	constructor(private http: HttpClient) {}

	listCatalog(dto?: ListCatalogRequestDto): Observable<ApiResponse<CatalogoProductosDataDto>> {
		return this.http.get<ApiResponse<CatalogoProductosDataDto>>(this.baseUrl, {
			params: this.sanitizeQueryParams(dto as any)
		});
	}

	listCatalogEnriched(dto?: ListCatalogRequestDto): Observable<ApiResponse<CatalogoProductosEnriquecidoDataDto>> {
		return this.http.get<ApiResponse<CatalogoProductosEnriquecidoDataDto>>(
			buildApiUrl(API_ENDPOINTS.inventory.catalogEnriched()),
			{ params: this.sanitizeQueryParams(dto as any) }
		);
	}

	getCatalogDetail(id: number): Observable<ApiResponse<Producto>> {
		return this.http.get<ApiResponse<Producto>>(buildApiUrl(API_ENDPOINTS.inventory.catalogDetail(id)));
	}

	listProducts(dto?: ListProductsRequestDto): Observable<ApiResponse<ListProductsDataDto>> {
		return this.http.get<ApiResponse<ListProductsDataDto>>(this.productsUrl, {
			params: this.sanitizeQueryParams(dto as any)
		});
	}

	searchProductsByName(dto: SearchProductsByNameRequestDto): Observable<ApiResponse<ListProductsDataDto>> {
		return this.http.get<ApiResponse<ListProductsDataDto>>(buildApiUrl(API_ENDPOINTS.inventory.productsSearch()), {
			params: this.sanitizeQueryParams(dto as any)
		});
	}

	searchActiveProductsByName(dto: SearchProductsByNameRequestDto): Observable<ApiResponse<ListProductsDataDto>> {
		return this.searchProductsByName({
			...dto,
			activo: dto.activo ?? true
		});
	}

	listProductsByCategory(idCategoria: number, dto?: ListProductsByCategoryRequestDto): Observable<ApiResponse<ListProductsDataDto>> {
		return this.http.get<ApiResponse<ListProductsDataDto>>(buildApiUrl(API_ENDPOINTS.inventory.productsByCategory(idCategoria)), {
			params: this.sanitizeQueryParams(dto as any)
		});
	}

	listActiveProductsByCategory(idCategoria: number, dto?: ListProductsByCategoryRequestDto): Observable<ApiResponse<ListProductsDataDto>> {
		return this.listProductsByCategory(idCategoria, {
			...dto,
			activo: dto?.activo ?? true
		});
	}

	listProductsEnriched(dto?: ListProductsEnrichedRequestDto): Observable<ApiResponse<ListProductsEnrichedDataDto>> {
		return this.http.get<ApiResponse<ListProductsEnrichedDataDto>>(buildApiUrl(API_ENDPOINTS.inventory.productsEnriched()), {
			params: this.sanitizeQueryParams(dto as any)
		});
	}

	getProduct(id: number): Observable<ApiResponse<Producto>> {
		return this.http.get<ApiResponse<Producto>>(buildApiUrl(API_ENDPOINTS.inventory.productDetail(id)));
	}

	createProduct(dto: CreateProductRequestDto): Observable<ApiResponse<Producto>> {
		return this.http.post<ApiResponse<Producto>>(this.productsUrl, dto);
	}

	updateProduct(id: number, dto: UpdateProductRequestDto): Observable<ApiResponse<Producto>> {
		return this.http.put<ApiResponse<Producto>>(buildApiUrl(API_ENDPOINTS.inventory.productDetail(id)), dto);
	}

	associateProductCategory(idProducto: number, idCategoria: number): Observable<AssociateProductCategoryResponseDto> {
		return this.http.put<AssociateProductCategoryResponseDto>(
			buildApiUrl(API_ENDPOINTS.inventory.productCategory(idProducto, idCategoria)),
			{}
		);
	}

	updateProductStock(id: number, dto: UpdateProductStockRequestDto): Observable<ApiResponse<Producto>> {
		return this.http.patch<ApiResponse<Producto>>(buildApiUrl(API_ENDPOINTS.inventory.productStock(id)), dto);
	}

	uploadProductImage(id: number, imagen: File): Observable<ApiResponse<Producto>> {
		const formData = new FormData();
		formData.append("imagen", imagen);
		return this.http.post<ApiResponse<Producto>>(buildApiUrl(API_ENDPOINTS.inventory.productImage(id)), formData);
	}

	getProductImageUrl(id: number): ImageUrl {
		return buildApiUrl(API_ENDPOINTS.inventory.catalogImage(id));
	}

	resolveImageUrl(urlImagen?: string | null): ImageUrl {
		if (!urlImagen) {
			return "/img/default_product.png";
		}
		if (urlImagen.startsWith("http://") || urlImagen.startsWith("https://")) {
			return urlImagen;
		}
		if (urlImagen.startsWith("/img/") || urlImagen.startsWith("/images/")) {
			return urlImagen;
		}
		if (urlImagen.startsWith("/")) {
			return buildApiUrl(urlImagen);
		}
		return buildApiUrl(`/${urlImagen}`);
	}

	deleteProduct(id: number): Observable<ApiResponse<null>> {
		return this.http.delete<ApiResponse<null>>(buildApiUrl(API_ENDPOINTS.inventory.productDetail(id)));
	}

	listCategories(): Observable<ApiResponse<CategoriaProducto[]>> {
		return this.http.get<ApiResponse<any>>(this.categoriesUrl).pipe(
			map((response) => ({
				...response,
				data: Array.isArray(response.data) ? response.data : (response.data?.categorias ?? [])
			}))
		);
	}

	getCategory(id: number): Observable<ApiResponse<CategoriaProducto>> {
		return this.http.get<ApiResponse<CategoriaProducto>>(buildApiUrl(API_ENDPOINTS.inventory.categoryDetail(id)));
	}

	createCategory(dto: CreateCategoryRequestDto): Observable<ApiResponse<CategoriaProducto>> {
		return this.http.post<ApiResponse<CategoriaProducto>>(this.categoriesUrl, dto);
	}

	updateCategory(id: number, dto: UpdateCategoryRequestDto): Observable<ApiResponse<CategoriaProducto>> {
		return this.http.put<ApiResponse<CategoriaProducto>>(buildApiUrl(API_ENDPOINTS.inventory.categoryDetail(id)), dto);
	}

	deleteCategory(id: number): Observable<ApiResponse<null>> {
		return this.http.delete<ApiResponse<null>>(buildApiUrl(API_ENDPOINTS.inventory.categoryDetail(id)));
	}
}
