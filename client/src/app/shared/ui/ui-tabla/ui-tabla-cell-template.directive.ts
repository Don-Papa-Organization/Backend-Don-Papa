import { Directive, Input, TemplateRef } from '@angular/core';

export interface UiTablaCellContext<T = any> {
  $implicit: T;
  registro: T;
  value: any;
  column: string;
  columnKey: string;
  rowIndex: number;
}

@Directive({
  selector: 'ng-template[uiTablaCell]',
  standalone: false
})
export class UiTablaCellTemplateDirective<T = any> {
  @Input('uiTablaCell') columnKey = '';

  constructor(public readonly templateRef: TemplateRef<UiTablaCellContext<T>>) {}
}