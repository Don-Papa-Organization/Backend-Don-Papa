import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../domain/auth/state/auth.actions';
import * as AgentActions from '../../../domain/agent/state/agent.actions';
import { MenuItem } from '../../../shared/interfaces/menu-item';

@Component({
  selector: 'app-main-layout',
  standalone: false,
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  constructor(private store: Store) {}
  @Input() table: boolean = true;
  isSidebarCollapsed = false;

  menuItems: MenuItem[] = [
    { texto: 'Inventario', urlIcono: 'icons/iconoInventario.svg', link: '/admin/inventory' },
    { texto: 'Usuarios', urlIcono: 'icons/iconoEmpleados.svg', link: '/admin/users' },
    { texto: 'Pedidos', urlIcono: 'icons/iconoReportes.svg', link: '/admin/orders' },
    { texto: 'Mesas', urlIcono: 'icons/iconoMesas.svg', link: '/admin/tables-reserves' },
    { texto: 'Promociones', urlIcono: 'icons/iconoPromociones.svg', link: '/admin/events-promotions' },
    { texto: 'Reportes', urlIcono: 'icons/iconoBitacora.svg', link: '/admin/reports' },
    { texto: 'Estadisticas', urlIcono: 'icons/iconoEstadisticas.svg', link: '/admin/statistics' }
  ];

  onLogout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleAgentPanel(): void {
    this.store.dispatch(AgentActions.toggleAgentPanel());
  }
}
