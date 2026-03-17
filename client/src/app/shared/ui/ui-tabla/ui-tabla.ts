import {
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges
} from '@angular/core';
import { UiTablaCellContext, UiTablaCellTemplateDirective } from './ui-tabla-cell-template.directive';

export interface AccionTabla {
  urlIcono: string;
  accion: (registro: any) => void;
}

export type TipoColumnaTabla = 'text' | 'image' | 'actions' | 'badge' | 'stepper' | 'toggle' | 'custom';

export interface TablaStepperConfig {
  min?: number;
  max?: number;
  step?: number;
  disabled?: (registro: any) => boolean;
}

export interface TablaBadgeConfig {
  label?: string;
  className?: string;
}

export interface TablaToggleConfig {
  trueLabel?: string;
  falseLabel?: string;
}

export interface TablaColumnaConfig {
  header: string;
  type?: TipoColumnaTabla;
  formatter?: (value: any, registro: any) => string | number;
  cellClass?: string | ((registro: any, value: any) => string);
  badgeMap?: Record<string, TablaBadgeConfig>;
  stepper?: TablaStepperConfig;
  toggle?: TablaToggleConfig;
}

export interface TablaColumnaDef {
  key: string;
  label: string;
  type?: TipoColumnaTabla;
  formatter?: (value: any, registro: any) => string | number;
  cellClass?: string | ((registro: any, value: any) => string);
  badgeMap?: Record<string, TablaBadgeConfig>;
  stepper?: TablaStepperConfig;
  toggle?: TablaToggleConfig;
  width?: string;
  minWidth?: string;
  align?: 'left' | 'center' | 'right';
  headerClass?: string;
  sticky?: boolean;
}

export interface TablaStepperChangeEvent {
  registro: any;
  columna: string;
  direction: 1 | -1;
  step: number;
  previousValue: number;
  nextValue: number;
}

export interface TablaToggleChangeEvent {
  registro: any;
  columna: string;
  previousValue: boolean;
  nextValue: boolean;
}

@Component({
  selector: 'app-ui-tabla',
  standalone: false,
  templateUrl: './ui-tabla.html',
  styleUrls: ['./ui-tabla.scss']
})
export class UiTabla implements OnChanges {
  @Input() minWidth: string = "fit-content"
  @Input() variant: 'default' | 'pos' = 'default';
  @Input() stickyHeader = false;
  @Input() hoverable = false;
  @Input() density: 'default' | 'compact' = 'default';

  @Input() theadData: string[] = [
    "columna1",
    "columna2",
    "columna3",
    "columna4",
    "columna5",
    "columna6",
    "columna7"
  ];

  @Input() acciones: AccionTabla[] = [
    {
      urlIcono: "icons/editar.svg",
      accion: (registro: any) => this.onEditar(registro)
    },
    {
      urlIcono: "icons/eliminar.svg",
      accion: (registro: any) => this.onEliminar(registro)
    }
  ];

  @Input() tbodyData: Array<any> = [
    {
      "columna1": "valor1",
      "columna2": "valor2",
      "columna3": "valor3",
      "columna4": "valor4",
      "columna5": "valor5",
      "columna6": "valor6",
      "columna7": "valor7",
    },
    {
      "columna1": "valor1",
      "columna2": "valor2",
      "columna3": "valor3",
      "columna4": "valor4",
      "columna5": "valor5",
      "columna6": "valor6",
      "columna7": "valor7",
    },
    {
      "columna1": "valor1",
      "columna2": "valor2",
      "columna3": "valor3",
      "columna4": "valor4",
      "columna5": "valor5",
      "columna6": "valor6",
      "columna7": "valor7",
    },
    {
      "columna1": "valor1",
      "columna2": "valor2",
      "columna3": "valor3",
      "columna4": "valor4",
      "columna5": "valor5",
      "columna6": "valor6",
      "columna7": "valor7",
    },
  ];

  @Input() columnasConfig: TablaColumnaConfig[] = [];
  @Input() columns: TablaColumnaDef[] = [];

  @Output() editarRegistro = new EventEmitter<any>();
  @Output() eliminarRegistro = new EventEmitter<any>();
  @Output() accionPersonalizada = new EventEmitter<{ accion: string; registro: any }>();
  @Output() stepperChange = new EventEmitter<TablaStepperChangeEvent>();
  @Output() toggleChange = new EventEmitter<TablaToggleChangeEvent>();

  @ContentChildren(UiTablaCellTemplateDirective)
  cellTemplates!: QueryList<UiTablaCellTemplateDirective>;

  private columnasConfigMap = new Map<string, TablaColumnaConfig>();
  private cellTemplateMap = new Map<string, UiTablaCellTemplateDirective>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columnasConfig']) {
      this.rebuildColumnConfigMap();
    }
  }

  ngAfterContentInit(): void {
    this.rebuildCellTemplateMap();
    this.cellTemplates.changes.subscribe(() => this.rebuildCellTemplateMap());
  }

  onEditar(fila: any): void {
    this.editarRegistro.emit(fila);
  }

  onEliminar(fila: any): void {
    this.eliminarRegistro.emit(fila);
  }

  ejecutarAccion(accion: AccionTabla, registro: any): void {
    accion.accion(registro);
  }

  get renderedColumns(): TablaColumnaDef[] {
    if (this.columns?.length) {
      return this.columns;
    }

    return (this.theadData || []).map((header) => ({
      key: header,
      label: header,
      header,
      type: this.getColumnConfig(header)?.type || 'text'
    }));
  }

  trackColumn(_: number, column: TablaColumnaDef): string {
    return column.key;
  }

  getHeaderLabel(column: TablaColumnaDef): string {
    return column.label;
  }

  getHeaderClass(column: TablaColumnaDef): string {
    return [
      column.headerClass || '',
      column.align ? `tabla-item--${column.align}` : '',
      column.sticky ? 'tabla-item--sticky' : ''
    ].filter(Boolean).join(' ');
  }

  getCellStyle(column: TablaColumnaDef): Record<string, string> {
    const style: Record<string, string> = {};

    if (column.width) {
      style['width'] = column.width;
    }

    if (column.minWidth) {
      style['min-width'] = column.minWidth;
    }

    return style;
  }

  hasCustomTemplate(column: TablaColumnaDef): boolean {
    return this.cellTemplateMap.has(column.key);
  }

  getCustomTemplate(column: TablaColumnaDef): UiTablaCellTemplateDirective | undefined {
    return this.cellTemplateMap.get(column.key);
  }

  getCellTemplateContext(registro: any, column: TablaColumnaDef, rowIndex: number): UiTablaCellContext {
    return {
      $implicit: registro,
      registro,
      value: this.getColumnValue(registro, column.key),
      column: column.label,
      columnKey: column.key,
      rowIndex
    };
  }

  getDisplayValue(registro: any, columna: string): any {
    const value = this.getColumnValue(registro, columna);
    const config = this.getColumnConfig(columna, registro);

    if (config?.formatter) {
      return config.formatter(value, registro);
    }

    return value;
  }

  getCellClass(registro: any, columna: string): string {
    const config = this.getColumnConfig(columna, registro);
    const value = this.getColumnValue(registro, columna);
    const cellClass = config?.cellClass;

    if (!cellClass) {
      return '';
    }

    if (typeof cellClass === 'function') {
      return cellClass(registro, value) || '';
    }

    return cellClass;
  }

  getCellClassByColumn(registro: any, column: TablaColumnaDef): string {
    return [
      this.getCellClass(registro, column.key),
      column.align ? `tabla-item--${column.align}` : ''
    ].filter(Boolean).join(' ');
  }

  isImageColumn(columna: string, registro: any): boolean {
    const type = this.getColumnType(columna);
    const value = this.getColumnValue(registro, columna);

    if (type === 'image') {
      return !!value && value !== 'N/A';
    }

    return columna === 'imagen' && !!value && value !== 'N/A';
  }

  isActionsColumn(columna: string): boolean {
    const type = this.getColumnType(columna);
    return type === 'actions' || columna === 'Acciones';
  }

  isBadgeColumn(columna: string): boolean {
    return this.getColumnType(columna) === 'badge';
  }

  isStepperColumn(columna: string): boolean {
    return this.getColumnType(columna) === 'stepper';
  }

  isToggleColumn(columna: string): boolean {
    return this.getColumnType(columna) === 'toggle';
  }

  getBadgeLabel(registro: any, columna: string): string {
    const value = this.getColumnValue(registro, columna);
    const badgeConfig = this.getBadgeConfig(columna, value);
    if (badgeConfig?.label) {
      return badgeConfig.label;
    }
    return String(this.getDisplayValue(registro, columna) ?? '');
  }

  getBadgeClass(registro: any, columna: string): string {
    const value = this.getColumnValue(registro, columna);
    const badgeConfig = this.getBadgeConfig(columna, value);
    return badgeConfig?.className || '';
  }

  getStepperValue(registro: any, columna: string): number {
    const value = Number(this.getColumnValue(registro, columna));
    return Number.isFinite(value) ? value : 0;
  }

  canStepperDecrease(registro: any, columna: string): boolean {
    if (this.isStepperDisabled(registro, columna)) {
      return false;
    }

    const config = this.getColumnConfig(columna, registro);
    const min = config?.stepper?.min;
    if (min === undefined) {
      return true;
    }

    return this.getStepperValue(registro, columna) > min;
  }

  canStepperIncrease(registro: any, columna: string): boolean {
    if (this.isStepperDisabled(registro, columna)) {
      return false;
    }

    const config = this.getColumnConfig(columna, registro);
    const max = config?.stepper?.max;
    if (max === undefined) {
      return true;
    }

    return this.getStepperValue(registro, columna) < max;
  }

  onStepperAction(registro: any, columna: string, direction: 1 | -1): void {
    const resolvedKey = this.getResolvedColumnKey(registro, columna);
    const config = this.getColumnConfig(resolvedKey, registro);
    const step = config?.stepper?.step ?? 1;
    const previousValue = this.getStepperValue(registro, resolvedKey);
    const nextValue = previousValue + (direction * step);

    this.stepperChange.emit({
      registro,
      columna: resolvedKey,
      direction,
      step,
      previousValue,
      nextValue
    });
  }

  getToggleValue(registro: any, columna: string): boolean {
    const rawValue = this.getColumnValue(registro, columna);

    if (typeof rawValue === 'boolean') {
      return rawValue;
    }

    if (typeof rawValue === 'number') {
      return rawValue !== 0;
    }

    if (typeof rawValue === 'string') {
      const normalized = rawValue.trim().toLowerCase();

      if (['true', '1', 'si', 'sí', 'activo', 'activa', 'enabled'].includes(normalized)) {
        return true;
      }

      if (['false', '0', 'no', 'inactivo', 'inactiva', 'disabled'].includes(normalized)) {
        return false;
      }
    }

    return Boolean(rawValue);
  }

  getToggleLabel(registro: any, columna: string): string {
    const config = this.getColumnConfig(columna, registro);
    const isOn = this.getToggleValue(registro, columna);

    if (isOn) {
      return config?.toggle?.trueLabel || 'Sí';
    }

    return config?.toggle?.falseLabel || 'No';
  }

  onToggleAction(registro: any, columna: string): void {
    const resolvedKey = this.getResolvedColumnKey(registro, columna);
    const previousValue = this.getToggleValue(registro, resolvedKey);
    this.toggleChange.emit({
      registro,
      columna: resolvedKey,
      previousValue,
      nextValue: !previousValue
    });
  }

  private rebuildColumnConfigMap(): void {
    this.columnasConfigMap.clear();

    for (const config of this.columnasConfig || []) {
      if (!config?.header) {
        continue;
      }

      this.columnasConfigMap.set(config.header, config);
    }
  }

  private rebuildCellTemplateMap(): void {
    this.cellTemplateMap.clear();

    for (const template of this.cellTemplates?.toArray() || []) {
      if (!template.columnKey) {
        continue;
      }

      this.cellTemplateMap.set(template.columnKey, template);
    }
  }

  private getColumnConfig(columna: string, registro?: any): TablaColumnaConfig | undefined {
    const direct = this.columnasConfigMap.get(columna);
    if (direct) {
      return direct;
    }

    const fromColumns = this.columns?.find(column => column.key === columna || column.label === columna);
    if (fromColumns) {
      return {
        header: fromColumns.label,
        type: fromColumns.type,
        formatter: fromColumns.formatter,
        cellClass: fromColumns.cellClass,
        badgeMap: fromColumns.badgeMap,
        stepper: fromColumns.stepper,
        toggle: fromColumns.toggle
      };
    }

    if (!registro) {
      return undefined;
    }

    const resolvedKey = this.getResolvedColumnKey(registro, columna);
    if (resolvedKey === columna) {
      return undefined;
    }

    return this.columnasConfigMap.get(resolvedKey);
  }

  private getColumnType(columna: string): TipoColumnaTabla | 'text' {
    return this.getColumnConfig(columna)?.type || 'text';
  }

  private getBadgeConfig(columna: string, value: any): TablaBadgeConfig | undefined {
    const config = this.getColumnConfig(columna);
    if (!config?.badgeMap) {
      return undefined;
    }

    const key = String(value);
    return config.badgeMap[key];
  }

  private isStepperDisabled(registro: any, columna: string): boolean {
    const config = this.getColumnConfig(columna, registro);
    return !!config?.stepper?.disabled?.(registro);
  }

  getColumnValue(registro: any, columna: string): any {
    const key = this.getResolvedColumnKey(registro, columna);
    return registro?.[key];
  }

  private getResolvedColumnKey(registro: any, columna: string): string {
    if (!registro || typeof registro !== 'object') {
      return columna;
    }

    if (Object.prototype.hasOwnProperty.call(registro, columna)) {
      return columna;
    }

    const target = columna.toLowerCase();
    const matched = Object.keys(registro).find((key) => key.toLowerCase() === target);
    return matched || columna;
  }
}
