import { Component, OnInit } from '@angular/core';
import { UsersFacade, UserViewModel, ClientEnrichedViewModel, EmployeeViewModel } from '../services/users.facade';
import { CreateEmployeeRequestDto } from '../../../../../domain/users/dtos/request/create-employee.request.dto';
import { UpdateEmployeeRequestDto } from '../../../../../domain/users/dtos/request/update-employee.request.dto';
import { TabItem } from '../../../../../shared/ui/ui-tabs/ui-tabs';

@Component({
  selector: 'app-main-users',
  standalone: false,
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class Main implements OnInit {
  // Tabs
  tabs: TabItem[] = [
    { id: 'empleados', label: 'Empleados' },
    { id: 'usuarios', label: 'Usuarios' },
    { id: 'clientes', label: 'Clientes' }
  ];
  
  // Pestaña activa
  tabActiva: string = 'empleados';

  // Datos de empleados
  empleados: EmployeeViewModel[] = [];
  columnasEmpleados: string[] = ['idUsuario', 'nombre', 'documento', 'cargo', 'correo', 'activo', 'Acciones'];
  
  // Datos de usuarios
  usuarios: UserViewModel[] = [];
  columnasUsuarios: string[] = ['idUsuario', 'correo', 'tipoUsuario', 'activo'];
  
  // Datos de clientes
  clientes: ClientEnrichedViewModel[] = [];
  columnasClientes: string[] = ['idUsuario', 'nombre', 'correo', 'telefono', 'direccion', 'activo'];
  
  // Control de modales
  mostrarModalDetalleUsuario = false;
  mostrarModalDetalleCliente = false;
  mostrarModalAgregarEmpleado = false;
  mostrarModalActualizarEmpleado = false;
  mostrarModalEliminarEmpleado = false;
  
  // Registros seleccionados
  usuarioSeleccionado: UserViewModel | null = null;
  clienteSeleccionado: ClientEnrichedViewModel | null = null;
  empleadoSeleccionado: EmployeeViewModel | null = null;
  
  // Estados de carga
  cargandoEmpleados = false;
  cargandoUsuarios = false;
  cargandoClientes = false;

  constructor(private usersFacade: UsersFacade) {}

  ngOnInit(): void {
    this.cargarEmpleados();
    this.cargarUsuarios();
    this.cargarClientes();
  }

  /**
   * Cambia la pestaña activa
   */
  cambiarTab(tabId: string): void {
    this.tabActiva = tabId;
  }

  // ==================== EMPLEADOS ====================

  /**
   * Carga la lista de empleados
   */
  cargarEmpleados(): void {
    this.cargandoEmpleados = true;
    this.usersFacade.getEmployees().subscribe({
      next: (empleados) => {
        this.empleados = empleados;
        this.cargandoEmpleados = false;
      },
      error: (error) => {
        console.error('Error al cargar empleados:', error);
        this.cargandoEmpleados = false;
      }
    });
  }

  /**
   * Abre el modal para agregar empleado
   */
  onAgregarEmpleado(): void {
    this.mostrarModalAgregarEmpleado = true;
  }

  /**
   * Maneja el evento de empleado creado
   */
  onEmpleadoCreado(dto: CreateEmployeeRequestDto): void {
    this.usersFacade.createEmployee(dto).subscribe({
      next: (response) => {
        console.log('Empleado creado exitosamente:', response);
        this.mostrarModalAgregarEmpleado = false;
        this.cargarEmpleados();
      },
      error: (error) => {
        console.error('Error al crear empleado:', error);
        alert('Error al crear empleado: ' + (error.error?.mensaje || 'Error desconocido'));
      }
    });
  }

  /**
   * Abre el modal para actualizar un empleado
   */
  onActualizarEmpleado(registro: EmployeeViewModel): void {
    this.empleadoSeleccionado = registro;
    this.mostrarModalActualizarEmpleado = true;
  }

  /**
   * Maneja la actualización de un empleado
   */
  onEmpleadoActualizado(dto: UpdateEmployeeRequestDto): void {
    if (!this.empleadoSeleccionado) return;

    this.usersFacade.updateEmployee(this.empleadoSeleccionado.idUsuario, dto).subscribe({
      next: (response) => {
        console.log('Empleado actualizado exitosamente:', response);
        this.mostrarModalActualizarEmpleado = false;
        this.empleadoSeleccionado = null;
        this.cargarEmpleados();
      },
      error: (error) => {
        console.error('Error al actualizar empleado:', error);
        alert('Error al actualizar empleado: ' + (error.error?.message || 'Error desconocido'));
      }
    });
  }

  /**
   * Abre el modal de confirmación para eliminar un empleado
   */
  onEliminarEmpleado(registro: EmployeeViewModel): void {
    this.empleadoSeleccionado = registro;
    this.mostrarModalActualizarEmpleado = false;
    this.mostrarModalEliminarEmpleado = true;
  }

  /**
   * Confirma la eliminación del empleado
   */
  confirmarEliminacionEmpleado(): void {
    if (!this.empleadoSeleccionado) return;

    this.usersFacade.deleteEmployee(this.empleadoSeleccionado.idUsuario).subscribe({
      next: (response) => {
        console.log('Empleado eliminado exitosamente:', response);
        this.mostrarModalEliminarEmpleado = false;
        this.empleadoSeleccionado = null;
        this.cargarEmpleados();
      },
      error: (error) => {
        console.error('Error al eliminar empleado:', error);
        alert('Error al eliminar empleado: ' + (error.error?.message || 'Error desconocido'));
      }
    });
  }

  /**
   * Cierra los modales de empleado
   */
  cerrarModalAgregarEmpleado(): void {
    this.mostrarModalAgregarEmpleado = false;
  }

  cerrarModalActualizarEmpleado(): void {
    this.mostrarModalActualizarEmpleado = false;
    this.empleadoSeleccionado = null;
  }

  cerrarModalEliminarEmpleado(): void {
    this.mostrarModalEliminarEmpleado = false;
  }

  // ==================== USUARIOS ====================

  /**
   * Carga la lista de usuarios
   */
  cargarUsuarios(): void {
    this.cargandoUsuarios = true;
    this.usersFacade.getUsers().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.cargandoUsuarios = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.cargandoUsuarios = false;
      }
    });
  }

  /**
   * Abre el modal de detalle de usuario
   */
  onVerDetalleUsuario(registro: UserViewModel): void {
    this.usuarioSeleccionado = registro;
    this.mostrarModalDetalleUsuario = true;
  }

  /**
   * Cierra el modal de detalle usuario
   */
  cerrarModalDetalleUsuario(): void {
    this.mostrarModalDetalleUsuario = false;
    this.usuarioSeleccionado = null;
  }

  // ==================== CLIENTES ====================

  /**
   * Carga la lista de clientes enriquecidos
   */
  cargarClientes(): void {
    this.cargandoClientes = true;
    this.usersFacade.getClientsEnriched().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        this.cargandoClientes = false;
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.cargandoClientes = false;
      }
    });
  }

  /**
   * Abre el modal de detalle de cliente
   */
  onVerDetalleCliente(registro: ClientEnrichedViewModel): void {
    this.clienteSeleccionado = registro;
    this.mostrarModalDetalleCliente = true;
  }

  /**
   * Cierra el modal de detalle cliente
   */
  cerrarModalDetalleCliente(): void {
    this.mostrarModalDetalleCliente = false;
    this.clienteSeleccionado = null;
  }

  // ==================== GENERAL ====================

  /**
   * Recarga los datos según la pestaña activa
   */
  onRecargar(): void {
    if (this.tabActiva === 'empleados') {
      this.cargarEmpleados();
    } else if (this.tabActiva === 'usuarios') {
      this.cargarUsuarios();
    } else {
      this.cargarClientes();
    }
  }
}
