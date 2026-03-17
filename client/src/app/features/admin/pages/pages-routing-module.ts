import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayout } from '../main-layout/main-layout';

const routes: Routes = [
  {
    path: "",
    component: MainLayout,
    children: [
      { path: "", pathMatch: "full", redirectTo: "inventory" },
      { path: "inventory", loadChildren: () => import('./inventory/inventory-module').then(m => m.InventoryModule) },
      { path: "users", loadChildren: () => import('./users/users-module').then(m => m.UsersModule) },
      { path: "orders", loadChildren: () => import('./orders/orders-module').then(m => m.OrdersModule) },
      { path: "tables-reserves", loadChildren: () => import('./tables-reserves/tables-reserves-module').then(m => m.TablesReservesModule) },
      { path: "events-promotions", loadChildren: () => import('./events-promotions/events-promotions-module').then(m => m.EventsPromotionsModule) },
      { path: "reports", loadChildren: () => import('./reports/reports-module').then(m => m.ReportsModule) },
      { path: "statistics", loadChildren: () => import('./statistics/statistics-module').then(m => m.StatisticsModule) },
      //{ path: "agent", loadChildren: () => import('./agent/agent-module').then(m => m.AgentModule) },
    ]
  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
