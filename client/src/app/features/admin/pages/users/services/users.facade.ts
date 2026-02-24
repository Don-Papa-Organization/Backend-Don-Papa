import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UsersApi } from '../../../../../services/apis/users.api';
import { ApiResponse } from '../../../../../types/api-response.type';
import { Usuario } from '../../../../../domain/users/models/usuario.model';
import { Cliente } from '../../../../../domain/users/models/cliente.model';
import { ClienteEnrichedDto } from '../../../../../domain/users/dtos/response/list-clients-enriched.response.dto';
import { CreateEmployeeRequestDto } from '../../../../../domain/users/dtos/request/create-employee.request.dto';
import { UpdateEmployeeRequestDto } from '../../../../../domain/users/dtos/request/update-employee.request.dto';
import { EmpleadoListItemDto } from '../../../../../domain/users/dtos/response/list-employees.response.dto';
import { GetEmployeeResponseDto } from '../../../../../domain/users/dtos/response/get-employee.response.dto';
import { CreateEmployeeResponseDto } from '../../../../../domain/users/dtos/response/create-employee.response.dto';
import { UpdateEmployeeResponseDto } from '../../../../../domain/users/dtos/response/update-employee.response.dto';
import { DeleteEmployeeResponseDto } from '../../../../../domain/users/dtos/response/delete-employee.response.dto';

// ==================== ViewModels ====================

export interface UserViewModel {
  idUsuario: number;
  correo: string;
  tipoUsuario: string;
  activo: boolean;
}

export interface ClientViewModel {
  idUsuario: number;
  direccion: string;
  nombre: string;
  telefono: string;
  correo: string;
  activo: boolean;
}

export interface ClientEnrichedViewModel extends ClienteEnrichedDto {
  // Puedes agregar campos adicionales para presentación si necesitas
}

export interface EmployeeViewModel {
  idUsuario: number;
  nombre: string;
  documento: string;
  telefono: string;
  cargo: string;
  correo: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsersFacade {
  constructor(private usersApi: UsersApi) {}

  // ==================== USERS ====================

  /**
   * Obtiene la lista de todos los usuarios
   */
  getUsers(): Observable<UserViewModel[]> {
    return this.usersApi.listUsers().pipe(
      map(response => this.mapUsersToViewModels(response.data!))
    );
  }

  /**
   * Obtiene un usuario por ID
   */
  getUser(id: number): Observable<Usuario> {
    return this.usersApi.getUser(id).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Obtiene un usuario por email
   */
  getUserByEmail(correo: string): Observable<Usuario> {
    return this.usersApi.getUserByEmail(correo).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Mapea usuarios de domain a ViewModels
   */
  private mapUsersToViewModels(usuarios: Usuario[]): UserViewModel[] {
    return usuarios.map(user => ({
      idUsuario: user.idUsuario,
      correo: user.correo,
      tipoUsuario: user.tipoUsuario,
      activo: user.activo
    }));
  }

  // ==================== CLIENTES ====================

  /**
   * Obtiene la lista de clientes
   */
  getClients(): Observable<Cliente[]> {
    return this.usersApi.listClients().pipe(
      map(response => response.data!)
    );
  }

  /**
   * Obtiene la lista enriquecida de clientes
   */
  getClientsEnriched(): Observable<ClienteEnrichedDto[]> {
    return this.usersApi.listClientsEnriched().pipe(
      map(response => response.data!)
    );
  }

  /**
   * Obtiene un cliente enriquecido por ID
   */
  getClientEnriched(id: number): Observable<ClienteEnrichedDto> {
    return this.usersApi.getClientEnriched(id).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Busca clientes
   */
  searchClients(searchParams: any): Observable<Cliente[]> {
    return this.usersApi.searchClients(searchParams).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Mapea clientes de domain a ViewModels
   */
  mapClientsToViewModels(clientes: Cliente[]): ClientViewModel[] {
    return clientes.map(client => ({
      idUsuario: client.idUsuario,
      direccion: client.direccion,
      nombre: client.nombre,
      telefono: client.telefono,
      correo: client.correo,
      activo: client.activo
    }));
  }

  // ==================== EMPLEADOS ====================

  /**
   * Obtiene la lista de empleados
   */
  getEmployees(): Observable<EmployeeViewModel[]> {
    return this.usersApi.listEmployees().pipe(
      map(response => this.mapEmployeesToViewModels(response.data!))
    );
  }

  /**
   * Obtiene un empleado por ID
   */
  getEmployee(id: number): Observable<GetEmployeeResponseDto> {
    return this.usersApi.getEmployee(id).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Obtiene un empleado por documento
   */
  getEmployeeByDocument(documento: string): Observable<any> {
    return this.usersApi.getEmployeeByDocument(documento).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Crea un nuevo empleado
   */
  createEmployee(dto: CreateEmployeeRequestDto): Observable<ApiResponse<CreateEmployeeResponseDto>> {
    return this.usersApi.createEmployee(dto);
  }

  /**
   * Actualiza un empleado existente
   */
  updateEmployee(id: number, dto: UpdateEmployeeRequestDto): Observable<UpdateEmployeeResponseDto> {
    return this.usersApi.updateEmployee(id, dto);
  }

  /**
   * Elimina/desactiva un empleado
   */
  deleteEmployee(id: number): Observable<DeleteEmployeeResponseDto> {
    return this.usersApi.deleteEmployee(id);
  }

  /**
   * Mapea DTOs de domain a ViewModels para presentación
   */
  private mapEmployeesToViewModels(empleados: EmpleadoListItemDto[]): EmployeeViewModel[] {
    return empleados.map(emp => ({
      idUsuario: emp.idUsuario,
      nombre: emp.nombre,
      documento: emp.documento,
      telefono: emp.telefono || '',
      cargo: emp.cargo,
      correo: emp.correo || '',
      activo: emp.activo !== undefined ? emp.activo : true
    }));
  }

  /**
   * Mapea un DTO individual a ViewModel
   */
  mapEmployeeToViewModel(empleado: EmpleadoListItemDto): EmployeeViewModel {
    return {
      idUsuario: empleado.idUsuario,
      nombre: empleado.nombre,
      documento: empleado.documento,
      telefono: empleado.telefono || '',
      cargo: empleado.cargo,
      correo: empleado.correo || '',
      activo: empleado.activo !== undefined ? empleado.activo : true
    };
  }
}
