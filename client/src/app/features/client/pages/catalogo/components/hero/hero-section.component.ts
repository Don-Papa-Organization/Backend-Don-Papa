import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, tap, of } from 'rxjs';
import { SharedModule } from '../../../../../../shared/shared-module';
import {
  CatalogoFacade,
  HeroSearchSuggestion,
  HeroSlide,
  HeroSlidesPayload
} from '../../services/catalogo.facade';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss'
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  @Input() mode: 'public' | 'client' = 'public';
  @Input() isAuthenticated = false;

  @Output() suggestionSelected = new EventEmitter<number>();
  @Output() searchSubmitted = new EventEmitter<string>();
  @Output() productClick = new EventEmitter<number>();

  slides: HeroSlide[] = [];
  activeSlideIndex = 0;

  contentState: 'loading' | 'ready' | 'empty' | 'error' = 'loading';
  statusMessage = '';

  searchTerm = '';
  suggestions: HeroSearchSuggestion[] = [];
  showSuggestions = false;
  searchLoading = false;

  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();
  private rotationTimer: ReturnType<typeof setInterval> | null = null;
  private isPaused = false;

  constructor(
    private readonly catalogoFacade: CatalogoFacade,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadSlides();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.stopRotation();
    this.destroy$.next();
    this.destroy$.complete();
  }

  get activeSlide(): HeroSlide | null {
    return this.slides[this.activeSlideIndex] || null;
  }

  get hasMultipleSlides(): boolean {
    return this.slides.length > 1;
  }

  onMouseEnter(): void {
    this.isPaused = true;
  }

  onMouseLeave(): void {
    this.isPaused = false;
  }

  onPrevSlide(): void {
    if (!this.slides.length) {
      return;
    }

    this.activeSlideIndex = (this.activeSlideIndex - 1 + this.slides.length) % this.slides.length;
  }

  onNextSlide(): void {
    if (!this.slides.length) {
      return;
    }

    this.activeSlideIndex = (this.activeSlideIndex + 1) % this.slides.length;
  }

  onGoToSlide(index: number): void {
    if (index < 0 || index >= this.slides.length) {
      return;
    }

    this.activeSlideIndex = index;
  }

  onPrimaryCta(): void {
    const slide = this.activeSlide;
    if (!slide) {
      this.router.navigateByUrl(this.resolveModeLink('/catalogo'));
      return;
    }

    if (slide.type === 'featured' && slide.productId) {
      this.productClick.emit(slide.productId);
      return;
    }

    if (slide.type === 'promotion') {
      this.router.navigateByUrl(this.resolveModeLink('/catalogo'));
      return;
    }

    if (!slide.ctaLink) {
      this.router.navigateByUrl(this.resolveModeLink('/catalogo'));
      return;
    }

    this.router.navigateByUrl(this.resolveModeLink(slide.ctaLink));
  }

  onSecondaryCta(): void {
    if (this.activeSlide?.type === 'featured') {
      return;
    }

    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/register']);
      return;
    }

    this.router.navigateByUrl(this.resolveModeLink('/eventos'));
  }

  onSearchInput(value: string): void {
    this.searchTerm = value;
    this.showSuggestions = value.trim().length >= 2;
    this.search$.next(value);
  }

  onSearchFocus(): void {
    this.showSuggestions = this.searchTerm.trim().length >= 2;
  }

  onSearchBlur(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 120);
  }

  onSearchSubmit(event?: Event): void {
    event?.preventDefault();

    const normalized = this.searchTerm.trim();
    if (!normalized) {
      return;
    }

    this.searchSubmitted.emit(normalized);
    this.showSuggestions = false;
  }

  onSuggestionClick(suggestion: HeroSearchSuggestion): void {
    this.searchTerm = suggestion.nombre;
    this.searchSubmitted.emit(suggestion.nombre);
    this.suggestionSelected.emit(suggestion.idProducto);
    this.showSuggestions = false;
  }

  trackBySlide(_: number, slide: HeroSlide): number {
    return slide.id;
  }

  private loadSlides(): void {
    this.contentState = 'loading';
    this.statusMessage = '';

    this.catalogoFacade
      .getHeroSlides()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (payload: HeroSlidesPayload) => {
          this.slides = payload.slides;
          this.activeSlideIndex = 0;

          if (payload.state === 'error') {
            this.contentState = 'error';
            this.statusMessage = 'Conexión limitada: mostrando una versión estática del hero.';
          } else if (payload.state === 'empty') {
            this.contentState = 'empty';
            this.statusMessage = 'No hay campañas activas ahora mismo. Te mostramos destacados sugeridos.';
          } else {
            this.contentState = 'ready';
          }

          this.startRotation();
        },
        error: () => {
          this.contentState = 'error';
          this.statusMessage = 'Conexión limitada: mostrando una versión estática del hero.';
          this.slides = [];
          this.stopRotation();
        }
      });
  }

  private setupSearch(): void {
    this.search$
      .pipe(
        tap((value) => {
          const normalized = value.trim();

          if (normalized.length < 2) {
            this.searchLoading = false;
            this.suggestions = [];
            return;
          }

          this.searchLoading = true;
        }),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) => {
          const normalized = value.trim();
          if (normalized.length < 2) {
            return of([] as HeroSearchSuggestion[]);
          }

          return this.catalogoFacade.searchProducts(normalized, 6);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((results) => {
        this.suggestions = results;
        this.searchLoading = false;
      });
  }

  private startRotation(): void {
    this.stopRotation();

    if (this.slides.length <= 1) {
      return;
    }

    this.rotationTimer = setInterval(() => {
      if (this.isPaused) {
        return;
      }

      this.onNextSlide();
    }, 6000);
  }

  private stopRotation(): void {
    if (!this.rotationTimer) {
      return;
    }

    clearInterval(this.rotationTimer);
    this.rotationTimer = null;
  }

  private resolveModeLink(path: string): string {
    if (this.mode !== 'client') {
      return path;
    }

    return path.startsWith('/client/') ? path : `/client${path}`;
  }
}
