import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ui-date-time-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-time-picker.component.html',
  styleUrl: './date-time-picker.component.scss'
})
export class UiDateTimePickerComponent implements OnInit {
  @Input() fecha: string = '';
  @Input() hora: string = '';

  @Output() actualizado = new EventEmitter<{ fecha: string; hora: string }>();

  fechaLocal: string = '';
  horaLocal: string = '';

  minFecha: string = ''; // Hoy
  horaMinima: string = '09:00';
  horaMaxima: string = '23:00';

  ngOnInit(): void {
    this.fechaLocal = this.fecha;
    this.horaLocal = this.hora;
    this.setearMinFecha();
  }

  private setearMinFecha(): void {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    this.minFecha = `${year}-${month}-${day}`;
  }

  /**
   * Sumar 1 día a fecha (flecha abajo)
   */
  siguienteDia(): void {
    const fecha = new Date(this.fechaLocal);
    fecha.setDate(fecha.getDate() + 1);
    this.actualizarFecha(fecha);
  }

  /**
   * Restar 1 día a fecha (flecha arriba)
   */
  diaAnterior(): void {
    const fecha = new Date(this.fechaLocal);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    fecha.setDate(fecha.getDate() - 1);
    
    if (fecha < hoy) {
      fecha.setTime(hoy.getTime());
    }

    this.actualizarFecha(fecha);
  }

  private actualizarFecha(fecha: Date): void {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    this.fechaLocal = `${year}-${month}-${day}`;
    this.emitirCambios();
  }

  /**
   * Sumar 1 hora a la hora (flecha abajo)
   */
  siguienteHora(): void {
    const [hh, mm] = this.horaLocal.split(':').map(Number);
    let nuevaHora = hh + 1;

    if (nuevaHora > 23) {
      nuevaHora = 23;
    }

    this.horaLocal = `${String(nuevaHora).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    this.emitirCambios();
  }

  /**
   * Restar 1 hora a la hora (flecha arriba)
   */
  horaAnterior(): void {
    const [hh, mm] = this.horaLocal.split(':').map(Number);
    let nuevaHora = hh - 1;

    if (nuevaHora < 9) {
      nuevaHora = 9;
    }

    this.horaLocal = `${String(nuevaHora).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    this.emitirCambios();
  }

  onFechaChange(): void {
    this.emitirCambios();
  }

  onHoraChange(): void {
    this.emitirCambios();
  }

  private emitirCambios(): void {
    this.actualizado.emit({
      fecha: this.fechaLocal,
      hora: this.horaLocal
    });
  }
}
