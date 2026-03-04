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

    getProductsWithCategories(filtros?: any): Observable<ProductViewModel[]> {
        return this.inventoryApi.listProducts().pipe(
            switchMap(response => {
                if (response.success && response.data?.productos?.length) {
                    let productos = response.data.productos;

                    // Aplicar filtros si existen
                    if (filtros) {
                        if (filtros.busqueda) {
                            const term = filtros.busqueda.toLowerCase();
                            productos = productos.filter(p =>
                                p.nombre.toLowerCase().includes(term) ||
                                (p.descripcion && p.descripcion.toLowerCase().includes(term))
                            );
                        }
                        if (filtros.estado) {
                            productos = productos.filter(p => p.idCategoria === filtros.estado);
                        }
                        // Nota: El filtrado por fechas se puede implementar aquí si el modelo Producto tiene campos de fecha
                    }

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

                    if (productos.length === 0) return of([]);

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
