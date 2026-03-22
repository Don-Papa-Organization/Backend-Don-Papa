import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, catchError } from 'rxjs';
import { UpcomingEventoDto } from '../../../../../domain/events&Promotions/dtos/response/list-upcoming-events.response.dto';
import { Promocion } from '../../../../../domain/events&Promotions/models/promocion.model';
import { Producto } from '../../../../../domain/inventory/models/producto.model';
import { EventsPromotionsApi } from '../../../../../services/apis/events&Promotions.api';
import { InventoryApi } from '../../../../../services/apis/inventory.api';
import { CatalogProductEnrichedDto } from '../../../../../domain/inventory/dtos/response/list-catalog-enriched.response.dto';

export interface HeroSlide {
  id: number;
  type: 'promotion' | 'event' | 'featured';
  productId?: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  discount?: number;
}

export interface HeroSlidesPayload {
  slides: HeroSlide[];
  state: 'ready' | 'empty' | 'error';
}

export interface HeroSearchSuggestion {
  idProducto: number;
  nombre: string;
  precio: number;
  imageUrl: string;
}

interface LoadResult<T> {
  items: T[];
  failed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogoFacade {
  private readonly heroFallbackImage = 'img/imagenDonPapa.png';

  constructor(
    private readonly eventsPromotionsApi: EventsPromotionsApi,
    private readonly inventoryApi: InventoryApi
  ) {}

  getHeroSlides(): Observable<HeroSlidesPayload> {
    return forkJoin({
      promotions: this.loadPromotions(),
      events: this.loadUpcomingEvents(),
      featured: this.loadFeaturedProducts()
    }).pipe(
      map(({ promotions, events, featured }) => {
        // Limitar volumen de slides para una navegación más clara (máx. 8)
        const promotionSlides = promotions.items.slice(0, 3).map((item, index) => this.mapPromotionSlide(item, index));
        const eventSlides = events.items.slice(0, 2).map((item, index) => this.mapEventSlide(item, index));
        const featuredSlides = featured.items.slice(0, 3).map((item, index) => this.mapFeaturedSlide(item, index));

        const slides = [...promotionSlides, ...eventSlides, ...featuredSlides];

        if (slides.length > 0) {
          return {
            slides,
            state: 'ready' as const
          };
        }

        if (promotions.failed && events.failed && featured.failed) {
          return {
            slides: [this.getErrorFallbackSlide()],
            state: 'error' as const
          };
        }

        return {
          slides: this.getGenericFeaturedSlides(),
          state: 'empty' as const
        };
      })
    );
  }

  searchProducts(term: string, limit = 6): Observable<HeroSearchSuggestion[]> {
    const normalized = term.trim();

    if (!normalized) {
      return of([]);
    }

    return this.inventoryApi.searchProductsByName({ nombre: normalized, page: 1, limit }).pipe(
      map((response) => (response.data?.productos || []).map((producto) => this.mapSuggestion(producto))),
      catchError(() => of([]))
    );
  }

  private loadPromotions(): Observable<LoadResult<Promocion>> {
    return this.eventsPromotionsApi.listActivePromotions(true).pipe(
      map((response) => ({
        items: response.data || [],
        failed: false
      })),
      catchError(() => of({ items: [], failed: true }))
    );
  }

  private loadUpcomingEvents(): Observable<LoadResult<UpcomingEventoDto>> {
    return this.eventsPromotionsApi.listUpcomingEvents().pipe(
      map((response) => ({
        items: response.data || [],
        failed: false
      })),
      catchError(() => of({ items: [], failed: true }))
    );
  }

  private loadFeaturedProducts(): Observable<LoadResult<CatalogProductEnrichedDto>> {
    return this.inventoryApi.listCatalogEnriched({ page: 1, limit: 8 }).pipe(
      map((response) => ({
        items: response.data?.productos || [],
        failed: false
      })),
      catchError(() => of({ items: [], failed: true }))
    );
  }

  private mapPromotionSlide(promotion: Promocion, index: number): HeroSlide {
    return {
      id: 1000 + index,
      type: 'promotion',
      title: promotion.nombre,
      subtitle: promotion.descripcion,
      imageUrl: this.heroFallbackImage,
      ctaText: 'Ver ofertas',
      ctaLink: '/catalogo'
    };
  }

  private mapEventSlide(event: UpcomingEventoDto, index: number): HeroSlide {
    const eventName = event.evento?.nombre || 'Evento Don Papa';
    const eventDescription = event.evento?.descripcion || 'Descubre experiencias y promociones exclusivas de la semana.';

    return {
      id: 2000 + index,
      type: 'event',
      title: eventName,
      subtitle: eventDescription,
      imageUrl: this.heroFallbackImage,
      ctaText: 'Ver eventos',
      ctaLink: '/eventos'
    };
  }

  private mapFeaturedSlide(product: CatalogProductEnrichedDto, index: number): HeroSlide {
    const nombreCategoria = (product as any).nombreCategoria as string | undefined;

    return {
      id: 3000 + index,
      type: 'featured',
      productId: product.idProducto,
      title: product.nombre,
      subtitle: product.descripcion || `Producto destacado ${nombreCategoria ? `en ${nombreCategoria}` : 'de la casa'}`,
      imageUrl: this.inventoryApi.resolveImageUrl(product.urlImagen),
      ctaText: 'Comprar ahora',
      ctaLink: '/catalogo'
    };
  }

  private getGenericFeaturedSlides(): HeroSlide[] {
    return [
      {
        id: 4001,
        type: 'featured',
        title: 'Selecciones premium de temporada',
        subtitle: 'Explora etiquetas icónicas y encuentra el sabor perfecto para cada ocasión.',
        imageUrl: this.heroFallbackImage,
        ctaText: 'Explorar catálogo',
        ctaLink: '/catalogo'
      },
      {
        id: 4002,
        type: 'featured',
        title: 'Packs destacados Don Papa',
        subtitle: 'Combina tus favoritos y aprovecha precios especiales por tiempo limitado.',
        imageUrl: this.heroFallbackImage,
        ctaText: 'Ver destacados',
        ctaLink: '/catalogo'
      }
    ];
  }

  private getErrorFallbackSlide(): HeroSlide {
    return {
      id: 5001,
      type: 'featured',
      title: 'No pudimos cargar promociones en este momento',
      subtitle: 'Puedes seguir navegando el catálogo mientras restablecemos la conexión.',
      imageUrl: this.heroFallbackImage,
      ctaText: 'Ir al catálogo',
      ctaLink: '/catalogo'
    };
  }

  private mapSuggestion(producto: Producto): HeroSearchSuggestion {
    return {
      idProducto: producto.idProducto,
      nombre: producto.nombre,
      precio: producto.precio,
      imageUrl: this.resolveProductImageUrl(producto)
    };
  }

  private resolveProductImageUrl(producto: Partial<Producto> & { idProducto?: number }): string {
    const productAny = producto as any;
    const rawImage =
      productAny?.urlImagen ??
      productAny?.productoImagen ??
      productAny?.imagen ??
      null;

    const normalizedImage = typeof rawImage === 'string' ? rawImage.replace(/\\/g, '/').trim() : '';

    if (producto.idProducto && /^(\/?images\/)/i.test(normalizedImage)) {
      return this.inventoryApi.getProductImageUrl(producto.idProducto);
    }

    if (normalizedImage) {
      return this.inventoryApi.resolveImageUrl(normalizedImage);
    }

    if (producto.idProducto) {
      return this.inventoryApi.getProductImageUrl(producto.idProducto);
    }

    return '/img/default_product.png';
  }
}
