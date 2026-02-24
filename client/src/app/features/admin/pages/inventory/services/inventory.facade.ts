import { Injectable } from '@angular/core';
import { InventoryApi } from '../../../../../services/apis/inventory.api';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CreateProductRequestDto } from '../../../../../domain/inventory/dtos/request/create-product.request.dto';
import { UpdateProductRequestDto } from '../../../../../domain/inventory/dtos/request/update-product.request.dto';
import { CreateCategoryRequestDto } from '../../../../../domain/inventory/dtos/request/create-category.request.dto';
import { UpdateCategoryRequestDto } from '../../../../../domain/inventory/dtos/request/update-category.request.dto';
import { ApiResponse } from '../../../../../types/api-response.type';
import { Producto } from '../../../../../domain/inventory/models/producto.model';
import { CategoriaProducto } from '../../../../../domain/inventory/models/categoriaProducto.model';

export interface ProductViewModel {
    idProducto: number;
    nombre: string;
    precio: number;
    stockActual: number;
    stockMinimo: number;
    activo: string;
    descripcion: string;
    categoria: string;
    idCategoria: number;
    imagen: string;
}

@Injectable({
    providedIn: 'root'
})
export class InventoryFacade {
    constructor(private inventoryApi: InventoryApi) { }

    getProductsWithCategories(): Observable<ProductViewModel[]> {
        return this.inventoryApi.listProducts().pipe(
            switchMap(response => {
                if (response.success && response.data && response.data.productos.length > 0) {
                    const productos = response.data.productos;

                    const productosConCategoria$ = productos.map(producto =>
                        producto.idCategoria
                            ? this.inventoryApi.getCategory(producto.idCategoria).pipe(
                                map(catResponse => ({
                                    ...producto,
                                    nombreCategoria: catResponse.data?.nombre || 'N/A'
                                })),
                                catchError(() => of({ ...producto, nombreCategoria: 'N/A' }))
                            )
                            : of({ ...producto, nombreCategoria: 'N/A' })
                    );

                    return forkJoin(productosConCategoria$).pipe(
                        map(productosConCat =>
                            productosConCat.map(producto => this.mapToViewModel(producto))
                                .sort((a, b) => a.idProducto - b.idProducto)
                        )
                    );
                }
                return of([]);
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

    private mapToViewModel(producto: any): ProductViewModel {
        return {
            idProducto: producto.idProducto,
            nombre: producto.nombre,
            precio: producto.precio,
            stockActual: producto.stockActual,
            stockMinimo: producto.stockMinimo,
            activo: producto.activo ? 'Sí' : 'No',
            descripcion: producto.descripcion || 'N/A',
            categoria: producto.nombreCategoria,
            idCategoria: producto.idCategoria,
            imagen: this.inventoryApi.resolveImageUrl(
                producto.urlImagen && producto.urlImagen.startsWith("/images")
                    ? this.inventoryApi.getProductImageUrl(producto.idProducto)
                    : (producto.urlImagen || this.inventoryApi.getProductImageUrl(producto.idProducto))
            ) + `?t=${new Date().getTime()}`
        };
    }
}
