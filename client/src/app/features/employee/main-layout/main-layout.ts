import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as AuthActions from '../../../domain/auth/state/auth.actions';
import { MenuItem } from '../../../shared/interfaces/menu-item';
import { PosPreferencesService } from '../pages/orders/services/pos-preferences.service';
import { TableSaleHeaderService } from '../pages/orders/services/table-sale-header.service';

@Component({
  selector: 'app-main-layout',
  standalone: false,
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout implements OnInit, OnDestroy {
  constructor(
    private store: Store,
    private router: Router,
    private posPreferences: PosPreferencesService,
    private tableSaleHeader: TableSaleHeaderService
  ) {}

  isPosMode = false;
  autoPrint = true;
  paraLlevar = false;
  posPageTitle = '';
  isTableSaleRoute = false;
  tableSaleTitle = '';

  private routerSub?: Subscription;
  private autoPrintSub?: Subscription;
  private tableSaleHeaderSub?: Subscription;
  private paraLlevarSub?: Subscription;

  menuItems: MenuItem[] = [
    { texto: 'POS', urlIcono: 'icons/iconoMesas.svg', link: '/employee/orders' },
    { texto: 'Cuadre', urlIcono: 'icons/iconoReportes.svg', link: '/employee/cuadre-caja' },
    { texto: 'Perfil', urlIcono: 'icons/profile.svg', link: '/employee/users' },
    { texto: 'Eventos', urlIcono: 'icons/calendar-yellow.svg', link: '/employee/events-promotions' }
  ];

  ngOnInit(): void {
    this.autoPrint = this.posPreferences.autoPrintValue;
    this.checkPosMode(this.router.url);

    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.checkPosMode(e.urlAfterRedirects));

    this.autoPrintSub = this.posPreferences.autoPrint$.subscribe(value => {
      this.autoPrint = value;
    });

    this.tableSaleHeaderSub = this.tableSaleHeader.mesaTitle$.subscribe(title => {
      this.tableSaleTitle = title;
    });

    this.paraLlevarSub = this.tableSaleHeader.paraLlevar$.subscribe(value => {
      this.paraLlevar = value;
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.autoPrintSub?.unsubscribe();
    this.tableSaleHeaderSub?.unsubscribe();
    this.paraLlevarSub?.unsubscribe();
  }

  private checkPosMode(url: string): void {
    const esPos = url.startsWith('/employee/orders');
    this.isTableSaleRoute = /^\/employee\/orders\/table\/\d+/.test(url);

    if (esPos) {
      this.posPageTitle = url.includes('/table/') ? 'PEDIDO DE MESA' : 'VISTA DE MESAS';
    }

    if (this.isTableSaleRoute && !this.tableSaleTitle) {
      const idMesa = this.extractTableId(url);
      this.tableSaleTitle = idMesa ? `Mesa ${idMesa}` : 'Mesa';
    }

    this.isPosMode = esPos;
  }

  private extractTableId(url: string): number | null {
    const match = url.match(/\/employee\/orders\/table\/(\d+)/);
    if (!match) {
      return null;
    }

    const idMesa = Number(match[1]);
    return Number.isFinite(idMesa) && idMesa > 0 ? idMesa : null;
  }

  onLogout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  isMenuItemActive(link: string): boolean {
    return this.router.url === link || this.router.url.startsWith(`${link}/`);
  }

  volverAMesas(): void {
    this.router.navigate(['/employee/orders']);
  }

  

  onAutoPrintChange(value: boolean): void {
    this.posPreferences.setAutoPrint(value);
  }

  onParaLlevarChange(value: boolean): void {
    this.tableSaleHeader.setParaLlevar(value);
  }

  onReloadTableSale(): void {
    this.tableSaleHeader.requestReload();
  }
}
