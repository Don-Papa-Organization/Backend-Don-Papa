import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared-module';

import { StatisticsRoutingModule } from './statistics-routing-module';
import { MainStatistics } from './main-statistics/main-statistics';
import { StatisticsFiltersComponent } from './components/statistics-filters/statistics-filters';
import { StatisticsMetricsGridComponent } from './components/statistics-metrics-grid/statistics-metrics-grid';
import { StatisticsDataTableComponent } from './components/statistics-data-table/statistics-data-table';
import { SalesSectionComponent } from './components/sales-section/sales-section';
import { InventorySectionComponent } from './components/inventory-section/inventory-section';
import { UserOccupancySectionComponent } from './components/user-occupancy-section/user-occupancy-section';
import { MiscMetricsSectionComponent } from './components/misc-metrics-section/misc-metrics-section';


@NgModule({
  declarations: [
    MainStatistics,
    StatisticsFiltersComponent,
    StatisticsMetricsGridComponent,
    StatisticsDataTableComponent,
    SalesSectionComponent,
    InventorySectionComponent,
    UserOccupancySectionComponent,
    MiscMetricsSectionComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    StatisticsRoutingModule
  ]
})
export class StatisticsModule { }
