import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiModalComponent } from './ui/ui-modal.component/ui-modal.component';
import { UiBreadcrumbsComponent } from './ui/ui-breadcrumbs/ui-breadcrumbs';
import { UiButton } from './ui/ui-button/ui-button';
import { UiInput } from './ui/ui-input/ui-input';
import { UiButtonGridComponent } from './ui/ui-button-grid/ui-button-grid';
import { UiProductCard } from './ui/ui-product-card/ui-product-card';
import { UiOnlyIconButton } from './ui/ui-only-icon-button/ui-only-icon-button';
import { UiTabla } from './ui/ui-tabla/ui-tabla';
import { UiTablaCellTemplateDirective } from './ui/ui-tabla/ui-tabla-cell-template.directive';
import { RouterModule } from '@angular/router';
import { UiForm } from './ui/ui-form/ui-form';
import { FormsModule } from '@angular/forms';
import { UiCombobox } from './ui/ui-combobox/ui-combobox';
import { UiImageUpload } from './ui/ui-image-upload/ui-image-upload';
import { UiTabs } from './ui/ui-tabs/ui-tabs';
import { UiHelperText } from './ui/ui-helper-text/ui-helper-text';
import { UiCheckbox } from './ui/ui-checkbox/ui-checkbox';
import { UiAdminFilterPanel } from './ui/ui-admin-filter-panel/ui-admin-filter-panel';
import { MetricCardComponent } from './ui/metric-card/metric-card.component';
import { UiChartComponent } from './ui/ui-chart/ui-chart.component';
import { FormatTableValuePipe } from './pipes/format-table-value.pipe';
import { AgentPanelComponent } from './ui/agent-panel/agent-panel.component';
import { UiPaymentSummary } from './ui/ui-payment-summary/ui-payment-summary';
import { UiPosTopbar } from './ui/ui-pos-topbar/ui-pos-topbar';
import { UiPosTableCard } from './ui/ui-pos-table-card/ui-pos-table-card';
import { UiPosQtyStepper } from './ui/ui-pos-qty-stepper/ui-pos-qty-stepper';
import { UiPosInlineFeedback } from './ui/ui-pos-inline-feedback/ui-pos-inline-feedback';
import { UiPosFloorMesa } from './ui/ui-pos-floor-mesa/ui-pos-floor-mesa';
import { UiToastComponent } from './ui/ui-toast/ui-toast.component';

@NgModule({
  declarations: [
    UiModalComponent,
    UiBreadcrumbsComponent,
    UiButton,
    UiInput,
    UiButtonGridComponent,
    UiProductCard,
    UiOnlyIconButton,
    UiTabla,
    UiTablaCellTemplateDirective,
    UiForm,
    UiCombobox,
    UiImageUpload,
    UiTabs,
    UiHelperText,
    UiCheckbox,
    UiAdminFilterPanel,
    MetricCardComponent,
    UiChartComponent,
    FormatTableValuePipe,
    AgentPanelComponent,
    UiPaymentSummary,
    UiPosTopbar,
    UiPosTableCard,
    UiPosQtyStepper,
    UiPosInlineFeedback,
    UiPosFloorMesa,
    UiToastComponent,

  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  exports: [
    UiModalComponent,
    UiBreadcrumbsComponent,
    UiButton,
    UiInput,
    UiButtonGridComponent,
    UiProductCard,
    UiOnlyIconButton,
    UiTabla,
    UiTablaCellTemplateDirective,
    UiForm,
    UiCombobox,
    UiImageUpload,
    UiTabs,
    UiHelperText,
    UiCheckbox,
    UiAdminFilterPanel,
    MetricCardComponent,
    UiChartComponent,
    FormatTableValuePipe,
    AgentPanelComponent,
    UiPaymentSummary,
    UiPosTopbar,
    UiPosTableCard,
    UiPosQtyStepper,
    UiPosInlineFeedback,
    UiPosFloorMesa,
    UiToastComponent
  ]
})
export class SharedModule { }
