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
import { RouterModule } from '@angular/router';
import { UiForm } from './ui/ui-form/ui-form';
import { FormsModule } from '@angular/forms';
import { UiCombobox } from './ui/ui-combobox/ui-combobox';
import { UiImageUpload } from './ui/ui-image-upload/ui-image-upload';
import { UiTabs } from './ui/ui-tabs/ui-tabs';
import { UiHelperText } from './ui/ui-helper-text/ui-helper-text';

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
    UiForm,
    UiCombobox,
    UiImageUpload,
    UiTabs,
    UiHelperText,
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
    UiForm,
    UiCombobox,
    UiImageUpload,
    UiTabs,
    UiHelperText
  ]
})
export class SharedModule { }
