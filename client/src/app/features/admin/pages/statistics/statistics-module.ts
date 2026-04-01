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
import { StatisticsChartComponent } from './components/statistics-chart/statistics-chart';
import { ComparisonBarChartComponent } from './components/comparison-bar-chart/comparison-bar-chart';
import { PieChartCardComponent } from './components/pie-chart-card/pie-chart-card';


@NgModule({
  declarations: [
    MainStatistics,
    StatisticsFiltersComponent,
    StatisticsMetricsGridComponent,
    StatisticsDataTableComponent,
    StatisticsChartComponent,
    SalesSectionComponent,
    InventorySectionComponent,
    UserOccupancySectionComponent,
    MiscMetricsSectionComponent,
    ComparisonBarChartComponent,
    PieChartCardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    StatisticsRoutingModule
  ]
})
export class StatisticsModule { }
