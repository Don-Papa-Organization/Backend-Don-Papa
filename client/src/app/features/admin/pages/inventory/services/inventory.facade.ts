import { Injectable } from '@angular/core';
import { InventoryApi } from '../../../../../services/apis/inventory.api';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CreateProductRequestDto } from '../../../../../domain/inventory/dtos/request/create-product.request.dto';
import { UpdateProductRequestDto } from '../../../../../domain/inventory/dtos/request/update-product.request.dto';
import { CreateCategoryRequestDto } from '../../../../../domain/inventory/dtos/request/create-category.request.dto';
import { UpdateCategoryRequestDto } from '../../../../../domain/inventory/dtos/request/update-category.request.dto';
import { ApiResponse } from '../../../../../types/api-response.type';
import { Producto } from '../../../../../domain/inventory/models/producto.model';
import { CategoriaProducto } from '../../../../../domain/inventory/models/categoriaProducto.model';
import { InventoryProductEnriched } from '../../../../../types/inventory-product-enriched.type';
import { PaginationMetaDto } from '../../../../../types/pagination-meta.dto';

export interface ProductViewModel {
    idProducto: number;
    nombre: string;
    precio: number;
    stockActual: number;
    stockMinimo: number;
    activo: boolean;
    descripcion: string;
    categoria: string;
    idCategoria: number;
    imagen: string;
}

export interface PaginatedProductsResult {
    items: ProductViewModel[];
    meta: PaginationMetaDto;
}

@Injectable({
    providedIn: 'root'
})
export class InventoryFacade {
    constructor(private inventoryApi: InventoryApi) { }

    getProductsWithCategories(filtros?: any): Observable<ProductViewModel[]> {
        const busqueda = String(filtros?.busqueda || '').trim();
        const categoria = filtros?.estado !== null && filtros?.estado !== undefined
            ? Number(filtros.estado)
            : undefined;

        if (busqueda && categoria && !Number.isNaN(categoria)) {
            return this.inventoryApi.listProductsEnriched({ nombre: busqueda, categoria }).pipe(
                map(response => this.mapProductsDataToViewModels(response.data?.productos ?? []))
            );
        }

        if (busqueda) {
            return this.inventoryApi.searchProductsByName({ nombre: busqueda }).pipe(
                map(response => this.mapProductsDataToViewModels(response.data?.productos ?? []))
            );
        }

        if (categoria && !Number.isNaN(categoria)) {
            return this.inventoryApi.listProductsByCategory(categoria).pipe(
                switchMap(response => {
                    const productos = response.data?.productos ?? [];
                    if (!productos.length) {
                        return of([]);
                    }

                    return this.inventoryApi.listProductsEnriched({ categoria }).pipe(
                        map(enrichedResponse => {
                            const byId = new Map((enrichedResponse.data?.productos ?? []).map(item => [item.idProducto, item]));
                            return productos.map(producto => byId.get(producto.idProducto) ?? producto);
                        }),
                        map(items => this.mapProductsDataToViewModels(items))
                    );
                })
            );
        }

        return this.inventoryApi.listProductsEnriched().pipe(
            map(response => this.mapProductsDataToViewModels(response.data?.productos ?? []))
        );
    }

    getProductsWithCategoriesOptimized(filtros?: any): Observable<ProductViewModel[]> {
        return this.getProductsWithCategories(filtros);
    }

    getProductsWithCategoriesPaginated(
        filtros?: any,
        page: number = 1,
        limit: number = 10
    ): Observable<PaginatedProductsResult> {
        const busqueda = String(filtros?.busqueda || '').trim();
        const categoria = filtros?.estado !== null && filtros?.estado !== undefined
            ? Number(filtros.estado)
            : undefined;

        const activo = typeof filtros?.activo === 'boolean' ? filtros.activo : undefined;

        return this.inventoryApi.listProductsEnriched({
            nombre: busqueda || undefined,
            categoria: categoria !== undefined && !Number.isNaN(categoria) ? categoria : undefined,
            activo,
            page,
            limit
        }).pipe(
            map(response => {
                const data = response.data;
                const items = this.mapProductsDataToViewModels(data?.productos ?? []);
                return {
                    items,
                    meta: {
                        page: data?.pagina ?? page,
                        limit,
                        total: data?.total ?? items.length,
                        totalPages: data?.totalPaginas ?? 1
                    }
                };
            })
        );
    }

    // --- Product Operations ---

    createProduct(dto: CreateProductRequestDto, imagen: File | null = null): Observable<ApiResponse<Producto>> {
        return this.inventoryApi.createProduct(dto).pipe(
            switchMap(response => {
                if (response.success && response.data && imagen) {
                    return this.inventoryApi.uploadProductImage(response.data.idProducto, imagen);
                }
                return of(response);
            })
        );
    }

    updateProduct(id: number, dto: UpdateProductRequestDto): Observable<ApiResponse<Producto>> {
        return this.inventoryApi.updateProduct(id, dto);
    }

    deleteProduct(id: number): Observable<ApiResponse<null>> {
        return this.inventoryApi.deleteProduct(id);
    }

    // --- Category Operations ---

    listCategories(): Observable<ApiResponse<CategoriaProducto[]>> {
        return this.inventoryApi.listCategories();
    }

    createCategory(dto: CreateCategoryRequestDto): Observable<ApiResponse<CategoriaProducto>> {
        return this.inventoryApi.createCategory(dto);
    }

    updateCategory(id: number, dto: UpdateCategoryRequestDto): Observable<ApiResponse<CategoriaProducto>> {
        return this.inventoryApi.updateCategory(id, dto);
    }

    deleteCategory(id: number): Observable<ApiResponse<null>> {
        return this.inventoryApi.deleteCategory(id);
    }

    getCategoryOptions(): Observable<{ value: any, label: string }[]> {
        return this.inventoryApi.listCategories().pipe(
            map(response => {
                const data = response.data;
                let categoriesArray: any[] = [];

                if (Array.isArray(data)) {
                    categoriesArray = data;
                } else if (data && typeof data === 'object') {
                    const d = data as any;
                    if (Array.isArray(d.categorias)) {
                        categoriesArray = d.categorias;
                    } else if (Array.isArray(d.categories)) {
                        categoriesArray = d.categories;
                    } else {
                        const keys = Object.keys(d);
                        if (keys.length > 0 && Array.isArray(d[keys[0]])) {
                            categoriesArray = d[keys[0]];
                        }
                    }
                }

                return categoriesArray.map((categoria: any) => ({
                    value: categoria.idCategoria,
                    label: categoria.nombre
                }));
            }),
            catchError(error => {
                console.error('Error al obtener opciones de categorías:', error);
                return of([]);
            })
        );
    }

    private mapProductsDataToViewModels(productos: Array<Producto | InventoryProductEnriched>): ProductViewModel[] {
        return productos
            .map(producto => this.mapToViewModel(producto))
            .sort((a, b) => a.idProducto - b.idProducto);
    }

    private mapToViewModel(producto: Producto | InventoryProductEnriched): ProductViewModel {
        const enriched = producto as InventoryProductEnriched;
        const nombreCategoria = enriched.nombreCategoria || enriched.categoria?.nombre || 'N/A';

        return {
            idProducto: producto.idProducto,
            nombre: producto.nombre,
            precio: producto.precio,
            stockActual: producto.stockActual,
            stockMinimo: producto.stockMinimo,
            activo: !!producto.activo,
            descripcion: producto.descripcion || 'N/A',
            categoria: nombreCategoria,
            idCategoria: Number(producto.idCategoria || 0),
            imagen: this.inventoryApi.resolveImageUrl(
                producto.urlImagen && producto.urlImagen.startsWith("/images")
                    ? this.inventoryApi.getProductImageUrl(producto.idProducto)
                    : (producto.urlImagen || this.inventoryApi.getProductImageUrl(producto.idProducto))
            ) + `?t=${new Date().getTime()}`
        };
    }
}
