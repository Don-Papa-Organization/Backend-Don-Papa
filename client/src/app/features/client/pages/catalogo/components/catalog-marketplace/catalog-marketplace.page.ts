import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Subject, takeUntil } from 'rxjs';
import { ListCatalogRequestDto } from '../../../../../../domain/inventory/dtos/request/list-catalog.request.dto';
import { CatalogoProductosEnriquecidoDataDto, CatalogProductEnrichedDto } from '../../../../../../domain/inventory/dtos/response/list-catalog-enriched.response.dto';
import { CategoriaProducto } from '../../../../../../domain/inventory/models/categoriaProducto.model';
import { Producto } from '../../../../../../domain/inventory/models/producto.model';
import { selectIsAuthenticated, selectUser } from '../../../../../../domain/auth/state/auth.selectors';
import { InventoryApi } from '../../../../../../services/apis/inventory.api';
import { OrdersApi } from '../../../../../../services/apis/orders.api';
import { SharedModule } from '../../../../../../shared/shared-module';
import { LayoutModule } from '../../../../../../shared/layout/layout-module';
import { TipoUsuario } from '../../../../../../types/tipo.usuario';
import { HeroSectionComponent } from '../hero/hero-section.component';
import { CategorySidebarComponent } from '../category-sidebar/category-sidebar.component';
import { BreadcrumbsComponent, BreadcrumbItem } from '../breadcrumbs/breadcrumbs.component';
import { FeaturedProductsRowComponent } from '../featured-products-row/featured-products-row.component';
import { CatalogToolbarAdvancedComponent, ViewMode, SortBy } from '../catalog-toolbar-advanced/catalog-toolbar-advanced.component';
import { ProductDetailModalComponent } from '../product-detail-modal/product-detail-modal.component';

interface CatalogProductView extends Producto {
  precioPromocional: number | null;
  porcentajeDescuento: number | null;
  tienePromocion: boolean;
  precioOriginal: number;
  nombreCategoria?: string;
}

@Component({
  selector: 'app-catalog-marketplace-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule,
    LayoutModule,
    HeroSectionComponent,
    CategorySidebarComponent,
    BreadcrumbsComponent,
    FeaturedProductsRowComponent,
    CatalogToolbarAdvancedComponent,
    ProductDetailModalComponent
  ],
  templateUrl: './catalog-marketplace.page.html',
  styleUrl: './catalog-marketplace.page.scss'
})
export class CatalogMarketplacePage implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly pageSize = 12;
  private actionMessageTimer: ReturnType<typeof setTimeout> | null = null;

  // Productos
  productos: CatalogProductView[] = [];
  productosFiltrados: CatalogProductView[] = [];
  productosDestacados: CatalogProductView[] = [];
  productosRecientes: CatalogProductView[] = [];
  categorias: CategoriaProducto[] = [];

  // Estados de carga
  loading = false;
  loadingMore = false;
  loadingFeatured = false;
  loadingRecent = false;
  error = '';

  // Paginación
  paginaActual = 1;
  totalPaginas = 1;
  canLoadMore = false;

  // Filtros
  busqueda = '';
  categoriaSeleccionada: number | null = null;
  precioMin: number | null = null;
  precioMax: number | null = null;

  // Autenticación
  isAuthenticated = false;
  private isCliente = false;

  // Modo y visibilidad
  mode: 'public' | 'client' = 'public';
  showFilters = false;
  showDetalleModal = false;
  selectedProductId: number | null = null;

  // View modes y ordenamiento (SECTION 4)
  viewMode: ViewMode = 'grid';
  sortBy: SortBy = 'relevancia';

  readonly categoryOptions: Array<{ value: number | null; label: string }> = [];
  categoryCounts: Record<number, number> = {};
  loadingCategorias = false;
  loadingCategoryCounts = false;
  catalogActionMessage = '';
  catalogActionMessageType: 'success' | 'error' = 'success';

  // Breadcrumbs (SECTION 4)
  breadcrumbItems: BreadcrumbItem[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly inventoryApi: InventoryApi,
    private readonly ordersApi: OrdersApi,
    private readonly store: Store,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.mode = this.resolveModeByRouteData();
    this.listenAuthState();
    this.listenCategoryQueryParam();
    this.loadCategorias();
    this.loadFeaturedProducts();
    this.updateBreadcrumbs();
  }

  ngOnDestroy(): void {
    if (this.actionMessageTimer) {
      clearTimeout(this.actionMessageTimer);
      this.actionMessageTimer = null;
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  onBusquedaChange(value: string): void {
    this.busqueda = value;
    this.applyClientSideFilters();
  }

  onCategoriaChange(value: number | null): void {
    if (this.categoriaSeleccionada === value) {
      return;
    }
    this.syncCategoryQueryParam(value);
  }

  onCategorySidebarSelected(value: number | null): void {
    this.onCategoriaChange(value);
  }

  onPrecioMinChange(value: string): void {
    this.precioMin = value ? Number(value) : null;
  }

  onPrecioMaxChange(value: string): void {
    this.precioMax = value ? Number(value) : null;
  }

  aplicarFiltros(): void {
    this.loadCatalog(1, false);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.precioMin = null;
    this.precioMax = null;

    const hadCategory = this.categoriaSeleccionada !== null;
    this.categoriaSeleccionada = null;
    this.syncCategoryQueryParam(null);

    if (!hadCategory) {
      this.loadCatalog(1, false);
    }
  }

  cargarMas(): void {
    if (!this.canLoadMore || this.loading || this.loadingMore) {
      return;
    }

    this.loadCatalog(this.paginaActual + 1, true);
  }

  abrirDetalle(producto: CatalogProductView): void {
    if (this.mode !== 'client') {
      this.router.navigate(['/catalogo', producto.idProducto]);
      return;
    }

    this.openProductDetailModal(producto.idProducto);
  }

  onHeroSearchSubmitted(term: string): void {
    this.onBusquedaChange(term);
  }

  onHeroSuggestionSelected(productId: number): void {
    if (this.mode !== 'client') {
      this.router.navigate(['/catalogo', productId]);
      return;
    }

    this.openProductDetailModal(productId);
  }

  onHeroProductClick(productId: number): void {
    if (!productId) {
      return;
    }

    if (this.mode !== 'client') {
      this.router.navigate(['/catalogo', productId]);
      return;
    }

    this.openProductDetailModal(productId);
  }

  onCardAddToCart(producto: CatalogProductView): void {
    if (this.mode !== 'client') {
      this.irALogin();
      return;
    }

    if (producto.stockActual <= 0) {
      this.showCatalogActionMessage('error', 'Este producto no tiene stock disponible.');
      return;
    }

    this.ordersApi
      .addProductToCart({
        idProducto: Number(producto.idProducto),
        cantidad: 1
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.showCatalogActionMessage('error', response.message || 'No se pudo agregar el producto al carrito.');
            return;
          }

          this.showCatalogActionMessage('success', response.message || 'Producto agregado al carrito.');
        },
        error: (error) => {
          this.showCatalogActionMessage('error', error?.message || 'No se pudo agregar el producto al carrito.');
        }
      });
  }

  onCardQuickView(producto: CatalogProductView): void {
    this.abrirDetalle(producto);
  }

  onCardToggleWishlist(producto: CatalogProductView): void {
    this.showCatalogActionMessage('error', `Wishlist aún no disponible para ${producto.nombre}.`);
  }

  // === SECTION 4: VIEW MODES Y ORDENAMIENTO ===

  onViewModeChange(viewMode: ViewMode): void {
    this.viewMode = viewMode;
  }

  onSortByChange(sortBy: SortBy): void {
    this.sortBy = sortBy;
    this.sortProducts();
  }

  onFiltrosToggle(): void {
    this.toggleFilters();
  }

  onLimpiarFiltros(): void {
    this.limpiarFiltros();
  }

  private sortProducts(): void {
    const sorted = [...this.productosFiltrados];

    switch (this.sortBy) {
      case 'precio-asc':
        sorted.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio-desc':
        sorted.sort((a, b) => b.precio - a.precio);
        break;
      case 'nombre-asc':
        sorted.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'nombre-desc':
        sorted.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case 'reciente':
        // Assuming products were already sorted by creation date from API
        sorted.reverse();
        break;
      case 'relevancia':
      default:
        // Keep original order
        break;
    }

    this.productosFiltrados = sorted;
  }

  private loadFeaturedProducts(): void {
    this.loadingFeatured = true;

    // TODO: Replace with actual API endpoint when available
    // GET /api/products/featured?limit=4
    setTimeout(() => {
      this.productosDestacados = [];
      this.loadingFeatured = false;
    }, 500);
  }

  private updateBreadcrumbs(): void {
    this.breadcrumbItems = [
      { label: 'Inicio', route: '/', active: false },
      { label: 'Catálogo', active: true }
    ];

    if (this.categoriaSeleccionada !== null && this.categorias.length > 0) {
      const category = this.categorias.find((c) => c.idCategoria === this.categoriaSeleccionada);
      if (category) {
        this.breadcrumbItems = [
          { label: 'Inicio', route: '/', active: false },
          { label: 'Catálogo', route: '/catalogo', active: false },
          { label: category.nombre, active: true }
        ];
      }
    }
  }

  onFeaturedAddToCart(producto: Producto): void {
    this.onCardAddToCart(producto as CatalogProductView);
  }

  onFeaturedQuickView(producto: Producto): void {
    this.onCardQuickView(producto as CatalogProductView);
  }

  onFeaturedToggleWishlist(producto: Producto): void {
    this.onCardToggleWishlist(producto as CatalogProductView);
  }

  trackByProductId(index: number, producto: CatalogProductView): number {
    return producto.idProducto;
  }

  private openProductDetailModal(productId: number): void {
    this.showDetalleModal = true;
    this.selectedProductId = productId;
  }

  cerrarDetalle(): void {
    this.showDetalleModal = false;
    this.selectedProductId = null;
  }

  onDetalleModalOpenProduct(productId: number): void {
    this.selectedProductId = productId;
  }

  onDetalleModalActionMessage(event: { type: 'success' | 'error'; message: string }): void {
    this.showCatalogActionMessage(event.type, event.message);
  }

  closeCatalogActionMessage(): void {
    this.catalogActionMessage = '';
    if (this.actionMessageTimer) {
      clearTimeout(this.actionMessageTimer);
      this.actionMessageTimer = null;
    }
  }

  irALogin(): void {
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: this.router.url }
    });
  }

  irARegistro(): void {
    this.router.navigate(['/auth/register']);
  }

  irAMarketplaceCliente(): void {
    this.router.navigate(['/client/catalogo']);
  }

  irAMiPerfil(): void {
    this.router.navigate(['/client/perfil']);
  }

  resolveImageUrl(producto: Producto): string {
    const urlImagen = producto.urlImagen?.replace(/\\/g, '/');

    if (urlImagen && (urlImagen.startsWith('/images') || urlImagen.startsWith('images/'))) {
      return this.inventoryApi.getProductImageUrl(producto.idProducto);
    }

    return this.inventoryApi.resolveImageUrl(urlImagen);
  }

  get hasItems(): boolean {
    return this.productosFiltrados.length > 0;
  }

  get showEmptyState(): boolean {
    return !this.loading && !this.error && this.productosFiltrados.length === 0;
  }

  get titleText(): string {
    return this.mode === 'client' ? 'Marketplace Cliente' : 'Catálogo Marketplace';
  }

  get categorySidebarLoading(): boolean {
    return this.loadingCategorias || this.loadingCategoryCounts;
  }

  get filtrosActivos(): number {
    let total = 0;

    if (this.busqueda.trim()) {
      total += 1;
    }

    if (this.categoriaSeleccionada !== null) {
      total += 1;
    }

    if (this.precioMin !== null) {
      total += 1;
    }

    if (this.precioMax !== null) {
      total += 1;
    }

    return total;
  }

  get headerPrimaryActionText(): string {
    if (this.isAuthenticated) {
      return this.isCliente ? 'Ir a mi perfil' : 'Ir al marketplace cliente';
    }

    return 'Iniciar sesión';
  }

  onPrimaryHeaderAction(): void {
    if (!this.isAuthenticated) {
      this.irALogin();
      return;
    }

    if (this.isCliente) {
      this.irAMiPerfil();
      return;
    }

    this.irAMarketplaceCliente();
  }

  private listenAuthState(): void {
    this.store
      .select(selectIsAuthenticated)
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
      });

    this.store
      .select(selectUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.isCliente = user?.tipoUsuario === TipoUsuario.cliente;
      });
  }

  private loadCategorias(): void {
    this.loadingCategorias = true;

    this.inventoryApi
      .listCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.categorias = [];
            this.resetCategoryOptions();
            this.loadingCategorias = false;
            return;
          }

          this.categorias = response.data;
          this.resetCategoryOptions();
          this.loadingCategorias = false;
          this.loadCategoryCounts();
        },
        error: () => {
          this.categorias = [];
          this.resetCategoryOptions();
          this.loadingCategorias = false;
        }
      });
  }

  private loadCategoryCounts(): void {
    this.loadingCategoryCounts = true;

    this.inventoryApi
      .listCatalogEnriched({ page: 1, limit: 500 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const counts: Record<number, number> = {};
          const products = response.data?.productos || [];

          products.forEach((product) => {
            const categoryId = (product as any).categoria?.idCategoria ?? product.idCategoria;
            if (!categoryId) {
              return;
            }

            counts[categoryId] = (counts[categoryId] || 0) + 1;
          });

          this.categoryCounts = counts;
          this.loadingCategoryCounts = false;
        },
        error: () => {
          this.categoryCounts = {};
          this.loadingCategoryCounts = false;
        }
      });
  }

  private resetCategoryOptions(): void {
    this.categoryOptions.length = 0;
    this.categoryOptions.push({ value: null, label: 'Todas las categorías' });

    this.categorias.forEach((categoria) => {
      this.categoryOptions.push({
        value: categoria.idCategoria,
        label: categoria.nombre
      });
    });
  }

  private loadCatalog(page: number, append: boolean): void {
    if (append) {
      this.loadingMore = true;
    } else {
      this.loading = true;
      this.error = '';
    }

    const params: ListCatalogRequestDto = {
      page,
      limit: this.pageSize,
      categoria: this.categoriaSeleccionada ?? undefined,
      precioMin: this.precioMin ?? undefined,
      precioMax: this.precioMax ?? undefined,
      ordenarPor: 'nombre',
      orden: 'asc'
    };

    // Algunos endpoints aceptan "categoria" y otros "idCategoria"; enviamos ambos para compatibilidad.
    const compatParams: ListCatalogRequestDto & { idCategoria?: number } = {
      ...params,
      idCategoria: this.categoriaSeleccionada ?? undefined
    };

    const request$: Observable<any> = this.categoriaSeleccionada !== null
      ? this.inventoryApi.listProductsByCategory(this.categoriaSeleccionada, {
          page,
          limit: this.pageSize
        })
      : this.inventoryApi.listCatalogEnriched(compatParams);

    request$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.handleCatalogError(response.message || 'No fue posible cargar el catálogo.', append);
            return;
          }

          this.updatePaginationData(response.data, page);
          this.mapProducts(response.data.productos || [], append);
        },
        error: (error) => {
          this.handleCatalogError(error?.message || 'No fue posible cargar el catálogo.', append);
        }
      });
  }

  private handleCatalogError(message: string, append: boolean): void {
    this.error = message;
    if (!append) {
      this.productos = [];
      this.productosFiltrados = [];
    }

    this.loading = false;
    this.loadingMore = false;
  }

  private updatePaginationData(data: CatalogoProductosEnriquecidoDataDto, page: number): void {
    this.paginaActual = page;
    this.totalPaginas = data.totalPaginas || 1;
    this.canLoadMore = this.paginaActual < this.totalPaginas;
  }

  private mapProducts(products: CatalogProductEnrichedDto[], append: boolean): void {
    if (!products.length) {
      if (!append) {
        this.productos = [];
      }

      this.applyClientSideFilters();
      this.loading = false;
      this.loadingMore = false;
      return;
    }

    const mappedProducts: CatalogProductView[] = products.map((product) => {
      const rawImage =
        (product as any).urlImagen ??
        (product as any).imagen ??
        (product as any).productoImagen ??
        null;

      const normalizedImage = typeof rawImage === 'string' ? rawImage.replace(/\\/g, '/') : undefined;
      const normalizedCategoryId =
        Number((product as any).idCategoria ?? (product as any).categoria?.idCategoria ?? 0) || undefined;

      return {
        ...product,
        idCategoria: normalizedCategoryId,
        urlImagen: normalizedImage,
        precioOriginal: Number(product.precioOriginal ?? product.precio),
        precioPromocional: product.precioPromocional ?? null,
        porcentajeDescuento: product.porcentajeDescuento ?? null,
        tienePromocion: !!product.tienePromocion,
        nombreCategoria: (product as any).nombreCategoria || (product as any).categoria?.nombre || undefined
      };
    });

    if (append) {
      this.productos = [...this.productos, ...mappedProducts];
    } else {
      this.productos = mappedProducts;
    }

    this.applyClientSideFilters();
    this.loading = false;
    this.loadingMore = false;
  }

  private applyClientSideFilters(): void {
    const search = this.busqueda.trim().toLowerCase();

    this.productosFiltrados = this.productos.filter((product) => {
      const productCategoryId = Number((product as any).idCategoria ?? (product as any).categoria?.idCategoria ?? 0);

      if (this.categoriaSeleccionada !== null && productCategoryId !== this.categoriaSeleccionada) {
        return false;
      }

      if (this.precioMin !== null && Number(product.precio) < this.precioMin) {
        return false;
      }

      if (this.precioMax !== null && Number(product.precio) > this.precioMax) {
        return false;
      }

      if (!search) {
        return true;
      }

      return product.nombre.toLowerCase().includes(search);
    });

    // Apply sorting after filtering
    this.sortProducts();
  }

  private resolveModeByRouteData(): 'public' | 'client' {
    if (this.route.snapshot.data['marketplaceMode'] === 'client') {
      return 'client';
    }

    // Fallback robusto para rutas anidadas/lazy donde el data puede no propagarse.
    return this.router.url.startsWith('/client/') ? 'client' : 'public';
  }

  private listenCategoryQueryParam(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const categoryId = this.parseCategoryParam(params.get('categoria'));

      this.categoriaSeleccionada = categoryId;
      this.loadCatalog(1, false);
    });
  }

  private parseCategoryParam(rawValue: string | null): number | null {
    if (!rawValue) {
      return null;
    }

    const parsed = Number(rawValue);
    return Number.isNaN(parsed) || parsed <= 0 ? null : parsed;
  }

  private syncCategoryQueryParam(categoryId: number | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoria: categoryId ?? null },
      queryParamsHandling: 'merge'
    });
  }

  private showCatalogActionMessage(type: 'success' | 'error', message: string): void {
    this.catalogActionMessageType = type;
    this.catalogActionMessage = message;

    if (this.actionMessageTimer) {
      clearTimeout(this.actionMessageTimer);
    }

    this.actionMessageTimer = setTimeout(() => {
      this.catalogActionMessage = '';
      this.actionMessageTimer = null;
    }, 3500);
  }
}
