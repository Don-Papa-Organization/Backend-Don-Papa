import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTableValue',
  standalone: false
})
export class FormatTableValuePipe implements PipeTransform {
  transform(value: any): string {
    if (value === null || value === undefined) {
      return '-';
    }

    // Si es una fecha
    if (value instanceof Date || (typeof value === 'string' && this.isDate(value))) {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('es-CR');
    }

    // Si es un número con más de 3 dígitos, podría ser moneda
    if (typeof value === 'number' && value > 999) {
      return new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: 'CRC',
        maximumFractionDigits: 2
      }).format(value);
    }

    // Por defecto
    return String(value);
  }

  private isDate(value: string): boolean {
    const dateTest = /^\d{4}-\d{2}-\d{2}/.test(value);
    return dateTest && !isNaN(Date.parse(value));
  }
}
