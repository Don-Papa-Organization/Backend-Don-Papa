import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Type definitions (replicate from mesa.model to avoid path resolution issues)
type MesaTipo = 'VIP' | 'Barra' | 'Salon' | 'Varios';
type MesaEstado = 'Disponible' | 'Reservada' | 'Ocupada' | 'Fuera de servicio';

interface Mesa {
    idMesa: number;
    numero: number;
    tipo: MesaTipo;
    estado: MesaEstado;
}

interface HoraOption {
  hora: string;
  disponible: boolean;
}

@Component({
  selector: 'app-ui-reservation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-modal.component.html',
  styleUrl: './reservation-modal.component.scss'
})
export class UiReservationModalComponent implements OnInit {
  @Input() mesa: Mesa | null = null;
  @Input() fecha: string = '';
  @Input() horaInicio: string = '';
  @Input() mesasDisponibles: Mesa[] = [];
  @Input() confirmando = false;
  @Input() cantidadPersonasPreseleccionada?: number;

  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<{ cantidadPersonas: number; horaFin: string; fecha: string; horaInicio: string }>();
  @Output() fechaCambiada = new EventEmitter<string>();
  @Output() horaInicioCambiada = new EventEmitter<string>();

  cantidadPersonas: number = 1;
  horaFin: string = '';
  horasDisponibles: HoraOption[] = [];
  horasInicioDisponibles: string[] = [];
  personasOptions: number[] = [];

  fechaEditable: string = '';
  horaInicioEditable: string = '';
  minDate: string = '';

  ngOnInit(): void {
    if (!this.fecha) {
      const hoy = new Date();
      this.fechaEditable = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
    } else {
      this.fechaEditable = this.fecha;
    }
    this.horaInicioEditable = this.horaInicio;
    if (!this.horaInicioEditable) {
      const ahora = new Date();
      ahora.setHours(ahora.getHours() + 1);
      ahora.setMinutes(0);
      ahora.setSeconds(0);
      this.horaInicioEditable = `${String(ahora.getHours()).padStart(2, '0')}:00`;
    }
    const hoy = new Date();
    this.minDate = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
    if (this.cantidadPersonasPreseleccionada) {
      this.cantidadPersonas = this.cantidadPersonasPreseleccionada;
    }
    this.inicializarPersonas();
    this.generarHorasInicioDisponibles();
    this.generarHorasDisponibles();
    if (this.horasDisponibles.length > 0) {
      this.horaFin = this.horasDisponibles[0].hora;
    }
  }

  /**
   * Inicializar opciones de personas según tipo de mesa
   */
  private inicializarPersonas(): void {
    if (!this.mesa) return;

    if (this.mesa.tipo === 'Barra') {
      // Barra: solo 1 persona
      this.personasOptions = [1];
      this.cantidadPersonas = 1;
    } else {
      // Otras mesas: 1 a 4 personas
      this.personasOptions = [1, 2, 3, 4];
      this.cantidadPersonas = 2;
    }
  }

  /**
   * Generar horas disponibles mayores a la hora de inicio
   * Marcar en rojo si hay otra mesa reservada en esa hora
   */
  private generarHorasDisponibles(): void {
    const [hhInicio] = this.horaInicioEditable.split(':').map(Number);
    this.horasDisponibles = [];

    for (let hh = hhInicio + 1; hh <= 23; hh++) {
      const hora = `${String(hh).padStart(2, '0')}:00`;
      const disponible = !this.hayReservaEnHora(hora);

      this.horasDisponibles.push({ hora, disponible });
    }
  }

  private generarHorasInicioDisponibles(): void {
    this.horasInicioDisponibles = [];
    for (let hh = 12; hh <= 23; hh++) {
      this.horasInicioDisponibles.push(`${String(hh).padStart(2, '0')}:00`);
    }
  }

  /**
   * Verificar si hay una reserva en esa hora para la SIGUIENTE hora después del inicio
   * Buscar en mesasDisponibles cuáles NO están disponibles en esa hora
   */
  private hayReservaEnHora(hora: string): boolean {
    // Aquí asumimos que si la mesa NO está en mesasDisponibles y su estado es Reservada,
    // entonces NO está disponible. Pero como ya tenemos solo mesasDisponibles,
    // consideramos que si NO está en la lista, está ocupada o reservada.
    // Para esta lógica, simplemente marcar rojo las primeras 2 horas después de inicio
    // como ejemplo de validación

    const [hhHora] = hora.split(':').map(Number);
    const [hhInicio] = this.horaInicioEditable.split(':').map(Number);

    // Ejemplo: si la hora es la siguiente inmediata (hhInicio + 1), marcar como roja
    // Esto es una simplificación. En producción, consultar API real.
    return false; // Por ahora, todas disponibles
  }

  /**
   * Formato de fecha para mostrar
   */
  formatearFecha(fechaStr: string): string {
    const [year, month, day] = fechaStr.split('-');
    return `${day}/${month}/${year}`;
  }

  /**
   * Al cambiar cantidad de personas, revalidar horas fin
   */
  onCantidadChange(): void {
    // Revalidar disponibilidad si es necesario
  }

  onFechaChange(): void {
    this.fechaCambiada.emit(this.fechaEditable);
  }

  onHoraInicioChange(): void {
    this.horaInicioCambiada.emit(this.horaInicioEditable);
    this.generarHorasDisponibles();
    if (this.horasDisponibles.length > 0) {
      this.horaFin = this.horasDisponibles[0].hora;
    }
  }

  /**
   * Cerrar modal
   */
  onCerrar(): void {
    this.cerrar.emit();
  }

  /**
   * Confirmar reserva
   */
  onConfirmar(): void {
    if (!this.horaFin) {
      alert('Por favor seleccione hora fin');
      return;
    }

    this.confirmar.emit({
      cantidadPersonas: this.cantidadPersonas,
      horaFin: this.horaFin,
      fecha: this.fechaEditable,
      horaInicio: this.horaInicioEditable
    });
  }

  /**
   * Clase CSS para hora fin según disponibilidad
   */
  getHoraFinClass(opcion: HoraOption): string {
    return opcion.disponible ? '' : 'ocupada';
  }

  /**
   * Deshabilitar hora fin si está ocupada
   */
  isHoraFinDisabled(opcion: HoraOption): boolean {
    return !opcion.disponible;
  }
}
