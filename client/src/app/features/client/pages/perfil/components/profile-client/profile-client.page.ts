import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { AuthChangePasswordRequestDto } from '../../../../../../domain/users/dtos/request/auth-change-password.request.dto';
import { AuthUpdateProfileRequestDto } from '../../../../../../domain/users/dtos/request/auth-update-profile.request.dto';
import { AuthProfileResponseDto } from '../../../../../../domain/users/dtos/response/auth-profile.response.dto';
import { CreateClientRequestDto } from '../../../../../../domain/users/dtos/request/create-client.request.dto';
import { UsersApi } from '../../../../../../services/apis/users.api';
import { SharedModule } from '../../../../../../shared/shared-module';
import * as AuthActions from '../../../../../../domain/auth/state/auth.actions';
import { TipoUsuario } from '../../../../../../types/tipo.usuario';
import { TabItem } from '../../../../../../shared/ui/ui-tabs/ui-tabs';
import { OrdersConsolidatedPage } from '../../../pedidos/components/orders/list/orders-consolidated.page';

@Component({
  selector: 'app-profile-client-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, OrdersConsolidatedPage],
  templateUrl: './profile-client.page.html',
  styleUrl: './profile-client.page.scss'
})
export class ProfileClientPage implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly modalTabs: TabItem[] = [
    { id: 'datos', label: 'Editar datos' },
    { id: 'clave', label: 'Cambiar contrasena' }
  ];

  perfil: AuthProfileResponseDto | null = null;

  loadingPerfil = true;

  errorPerfil = '';

  mensajePerfil = '';
  tipoMensajePerfil: 'success' | 'error' = 'success';
  guardandoPerfil = false;
  mostrarModalEditar = false;
  tabModalActiva: 'datos' | 'clave' = 'datos';

  mensajeClave = '';
  tipoMensajeClave: 'success' | 'error' = 'success';
  guardandoClave = false;

  seccionActiva: 'datos' | 'seguridad' | 'pedidos' = 'datos';

  seleccionarSeccion(seccion: 'datos' | 'seguridad' | 'pedidos'): void {
    this.seccionActiva = seccion;
  }

  formPerfil = {
    nombre: '',
    telefono: '',
    direccion: ''
  };

  private snapshotPerfil = {
    nombre: '',
    telefono: '',
    direccion: ''
  };

  formClave: AuthChangePasswordRequestDto = {
    contrasenaActual: '',
    nuevaContrasena: '',
    confirmarContrasena: ''
  };

  constructor(
    private readonly usersApi: UsersApi,
    private readonly store: Store
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get telefonoError(): string {
    const telefono = this.formPerfil.telefono.trim();

    if (!telefono) {
      return '';
    }

    if (!/^\d+$/.test(telefono)) {
      return 'El telefono solo puede contener numeros.';
    }

    if (telefono.length !== 10) {
      return 'El telefono debe tener exactamente 10 digitos.';
    }

    return '';
  }

  get puedeGuardarPerfil(): boolean {
    return true;
  }

  get hayCambiosPerfil(): boolean {
    return (
      this.formPerfil.nombre.trim() !== this.snapshotPerfil.nombre ||
      this.formPerfil.telefono.trim() !== this.snapshotPerfil.telefono ||
      this.formPerfil.direccion.trim() !== this.snapshotPerfil.direccion
    );
  }

  get confirmacionClaveError(): string {
    if (!this.formClave.nuevaContrasena || !this.formClave.confirmarContrasena) {
      return '';
    }

    if (this.formClave.nuevaContrasena !== this.formClave.confirmarContrasena) {
      return 'La confirmacion de contrasena no coincide.';
    }

    return '';
  }

  get puedeEnviarCambioClave(): boolean {
    return (
      !!this.formClave.contrasenaActual &&
      !!this.formClave.nuevaContrasena &&
      !!this.formClave.confirmarContrasena &&
      !this.confirmacionClaveError
    );
  }

  get camposFaltantesTexto(): string {
    if (!this.perfil) {
      return '';
    }

    const faltantes: string[] = [];

    if (!this.perfil.cliente?.nombre?.trim()) {
      faltantes.push('Nombre');
    }

    if (!this.perfil.cliente?.telefono?.trim()) {
      faltantes.push('Telefono');
    }

    if (!this.perfil.cliente?.direccion?.trim()) {
      faltantes.push('Direccion');
    }

    return faltantes.join(', ');
  }

  abrirModalEditar(tab: 'datos' | 'clave' = 'datos'): void {
    this.tabModalActiva = tab;
    this.mostrarModalEditar = true;
    this.mensajePerfil = '';
    this.mensajeClave = '';

    if (tab === 'datos') {
      this.sincronizarFormularioPerfil(this.perfil);
    }
  }

  cerrarModalEditar(): void {
    if (this.guardandoPerfil || this.guardandoClave) {
      return;
    }

    this.mostrarModalEditar = false;
    this.tabModalActiva = 'datos';
    this.resetClaveForm();
    this.sincronizarFormularioPerfil(this.perfil);
  }

  onModalTabChange(tabId: string): void {
    this.tabModalActiva = tabId === 'clave' ? 'clave' : 'datos';
    this.mensajePerfil = '';
    this.mensajeClave = '';
  }

  irATabClave(): void {
    this.tabModalActiva = 'clave';
    this.mensajePerfil = '';
    this.mensajeClave = '';
  }

  actualizarPerfil(): void {
    this.mensajePerfil = '';
    console.log('[TRACE] --- actualizarPerfil START ---');
    console.log('[TRACE] formPerfil:', JSON.stringify(this.formPerfil));
    console.log('[TRACE] snapshotPerfil:', JSON.stringify(this.snapshotPerfil));
    console.log('[TRACE] perfil (this.perfil):', JSON.stringify(this.perfil));
    console.log('[TRACE] puedeGuardarPerfil:', this.puedeGuardarPerfil);

    if (!this.puedeGuardarPerfil) {
      console.log('[TRACE] BLOQUEADO: puedeGuardarPerfil es false');
      this.tipoMensajePerfil = 'error';
      this.mensajePerfil = this.telefonoError || 'Corrige los datos para continuar.';
      return;
    }

    const payload = this.construirPayloadPerfil();
    console.log('[TRACE] payload construido:', JSON.stringify(payload));
    const tieneCambios = Object.keys(payload).length > 0;
    console.log('[TRACE] tieneCambios:', tieneCambios);

    if (!tieneCambios) {
      console.log('[TRACE] BLOQUEADO: no hay cambios');
      this.tipoMensajePerfil = 'error';
      this.mensajePerfil = 'No hay cambios por guardar.';
      return;
    }

    this.guardandoPerfil = true;
    console.log('[TRACE] Llamando updateProfile...');

    this.usersApi
      .updateProfile(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('[TRACE] updateProfile RESPONSE success:', response.success);
          console.log('[TRACE] updateProfile RESPONSE data:', JSON.stringify(response.data));
          console.log('[TRACE] updateProfile RESPONSE message:', response.message);

          if (!response.success || !response.data) {
            console.log('[TRACE] FALLO: response.success=false o !response.data');
            this.tipoMensajePerfil = 'error';
            this.mensajePerfil = response.message || 'No se pudo actualizar el perfil.';
            this.guardandoPerfil = false;
            return;
          }

          console.log('[TRACE] SUCCESS - asignando perfil');
          this.perfil = response.data;
          console.log('[TRACE] perfil asignado:', JSON.stringify(this.perfil));
          console.log('[TRACE] perfil.cliente:', JSON.stringify(this.perfil?.cliente));
          console.log('[TRACE] llamando sincronizarFormularioPerfil');
          this.sincronizarFormularioPerfil(this.perfil);
          console.log('[TRACE] formPerfil sincronizado:', JSON.stringify(this.formPerfil));
          console.log('[TRACE] snapshotPerfil sincronizado:', JSON.stringify(this.snapshotPerfil));
          this.tipoMensajePerfil = 'success';
          this.mensajePerfil = response.message || 'Perfil actualizado correctamente.';
          this.guardandoPerfil = false;
          console.log('[TRACE] --- actualizarPerfil END SUCCESS ---');
        },
        error: (error) => {
          console.log('[TRACE] updateProfile ERROR completo:', JSON.stringify(error));
          console.log('[TRACE] error.response:', JSON.stringify(error?.response));
          console.log('[TRACE] error.status:', error?.status);
          console.log('[TRACE] error.error:', JSON.stringify(error?.error));
          const message = this.obtenerMensajeError(error, 'No se pudo actualizar el perfil.');
          console.log('[TRACE] mensaje extraido:', message);
          console.log('[TRACE] debeCrearCliente:', this.debeCrearCliente(message));

          if (this.debeCrearCliente(message)) {
            console.log('[TRACE] Ejecutando crearClienteYReintentar');
            this.crearClienteYReintentar(payload);
            return;
          }

          this.tipoMensajePerfil = 'error';
          this.mensajePerfil = message;
          this.guardandoPerfil = false;
          console.log('[TRACE] --- actualizarPerfil END ERROR ---');
        }
      });
  }

  cambiarClave(): void {
    this.mensajeClave = '';

    if (!this.puedeEnviarCambioClave) {
      this.tipoMensajeClave = 'error';
      this.mensajeClave = this.confirmacionClaveError || 'Completa todos los campos para cambiar la contrasena.';
      return;
    }

    this.guardandoClave = true;

    this.usersApi
      .changePassword(this.formClave)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.tipoMensajeClave = 'error';
            this.mensajeClave = response.message || 'No se pudo cambiar la contraseña.';
            this.guardandoClave = false;
            return;
          }

          this.tipoMensajeClave = 'success';
          this.mensajeClave = response.data?.message || response.message || 'Contraseña actualizada correctamente.';
          this.guardandoClave = false;
          this.resetClaveForm();
        },
        error: (error) => {
          this.tipoMensajeClave = 'error';
          this.mensajeClave = this.obtenerMensajeError(error, 'No se pudo cambiar la contraseña.');
          this.guardandoClave = false;
        }
      });
  }

  cerrarSesion(): void {
    this.store.dispatch(AuthActions.logout());
  }

  reintentarPerfil(): void {
    this.cargarPerfil();
  }

  private cargarPerfil(): void {
    this.loadingPerfil = true;
    this.errorPerfil = '';
    console.log('[TRACE] --- getProfile START ---');

    this.usersApi
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('[TRACE] getProfile success:', response.success);
          console.log('[TRACE] getProfile data:', JSON.stringify(response.data));
          console.log('[TRACE] getProfile data.cliente:', JSON.stringify(response.data?.cliente));

          if (!response.success || !response.data) {
            this.errorPerfil = response.message || 'No se pudo cargar el perfil.';
            this.loadingPerfil = false;
            return;
          }

          this.perfil = response.data;
          console.log('[TRACE] perfil asignado:', JSON.stringify(this.perfil));
          this.sincronizarFormularioPerfil(this.perfil);
          this.loadingPerfil = false;
          console.log('[TRACE] --- getProfile END ---');
        },
        error: (error) => {
          console.log('[TRACE] getProfile ERROR:', JSON.stringify(error));
          this.errorPerfil = this.obtenerMensajeError(error, 'No se pudo cargar el perfil.');
          this.loadingPerfil = false;
        }
      });
  }

  estadoCampo(valor?: string): 'Completo' | 'Faltante' {
    return valor?.trim() ? 'Completo' : 'Faltante';
  }

  private sincronizarFormularioPerfil(profile: AuthProfileResponseDto | null): void {
    console.log('[TRACE] sincronizarFormularioPerfil - input profile:', JSON.stringify(profile));
    console.log('[TRACE] sincronizarFormularioPerfil - profile.cliente:', JSON.stringify(profile?.cliente));
    console.log('[TRACE] sincronizarFormularioPerfil - profile.cliente.nombre:', profile?.cliente?.nombre);
    console.log('[TRACE] sincronizarFormularioPerfil - profile.cliente.telefono:', profile?.cliente?.telefono);
    console.log('[TRACE] sincronizarFormularioPerfil - profile.cliente.direccion:', profile?.cliente?.direccion);

    this.formPerfil = {
      nombre: profile?.cliente?.nombre || '',
      telefono: profile?.cliente?.telefono || '',
      direccion: profile?.cliente?.direccion || ''
    };

    this.snapshotPerfil = {
      nombre: this.formPerfil.nombre.trim(),
      telefono: this.formPerfil.telefono.trim(),
      direccion: this.formPerfil.direccion.trim()
    };

    console.log('[TRACE] sincronizarFormularioPerfil - formPerfil result:', JSON.stringify(this.formPerfil));
    console.log('[TRACE] sincronizarFormularioPerfil - snapshotPerfil result:', JSON.stringify(this.snapshotPerfil));
  }

  private debeCrearCliente(message: string): boolean {
    return this.perfil?.tipoUsuario === TipoUsuario.cliente && message.toLowerCase().includes('cliente no encontrado');
  }

  private crearClienteYReintentar(payload: AuthUpdateProfileRequestDto): void {
    const nombre = payload.nombre || this.formPerfil.nombre.trim();
    const telefono = payload.telefono || this.formPerfil.telefono.trim();
    const direccion = payload.direccion || this.formPerfil.direccion.trim();

    if (!nombre || !telefono || !direccion) {
      this.tipoMensajePerfil = 'error';
      this.mensajePerfil = 'Para completar tu perfil debes registrar nombre, teléfono y dirección.';
      this.guardandoPerfil = false;
      return;
    }

    const createClientDto: CreateClientRequestDto = {
      nombre,
      telefono,
      direccion,
      correo: this.perfil?.correo
    };

    this.usersApi
      .createClient(createClientDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.tipoMensajePerfil = 'error';
            this.mensajePerfil = response.message || 'No se pudo crear el perfil de cliente.';
            this.guardandoPerfil = false;
            return;
          }

          this.usersApi
            .updateProfile(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (profileResponse) => {
                if (!profileResponse.success || !profileResponse.data) {
                  this.tipoMensajePerfil = 'error';
                  this.mensajePerfil = profileResponse.message || 'Se creó el cliente, pero no se pudo actualizar el perfil.';
                  this.guardandoPerfil = false;
                  return;
                }

                this.perfil = profileResponse.data;
                this.sincronizarFormularioPerfil(this.perfil);
                this.tipoMensajePerfil = 'success';
                this.mensajePerfil = 'Perfil de cliente creado y actualizado correctamente.';
                this.guardandoPerfil = false;
              },
              error: (profileError) => {
                this.tipoMensajePerfil = 'error';
                this.mensajePerfil = this.obtenerMensajeError(profileError, 'Se creó el cliente, pero no se pudo actualizar el perfil.');
                this.guardandoPerfil = false;
              }
            });
        },
        error: (createError) => {
          this.tipoMensajePerfil = 'error';
          this.mensajePerfil = this.obtenerMensajeError(createError, 'No se pudo crear el perfil de cliente.');
          this.guardandoPerfil = false;
        }
      });
  }

  private construirPayloadPerfil(): AuthUpdateProfileRequestDto {
    const payload: AuthUpdateProfileRequestDto = {};

    const nombre = this.formPerfil.nombre.trim();
    const telefono = this.formPerfil.telefono.trim();
    const direccion = this.formPerfil.direccion.trim();

    if (nombre !== this.snapshotPerfil.nombre) {
      payload.nombre = nombre || undefined;
    }

    if (telefono !== this.snapshotPerfil.telefono) {
      payload.telefono = telefono || undefined;
    }

    if (direccion !== this.snapshotPerfil.direccion) {
      payload.direccion = direccion || undefined;
    }

    return payload;
  }

  private resetClaveForm(): void {
    this.formClave = {
      contrasenaActual: '',
      nuevaContrasena: '',
      confirmarContrasena: ''
    };
  }

  private obtenerMensajeError(error: any, fallback = 'Ocurrió un error inesperado.'): string {
    return error?.error?.message || error?.message || fallback;
  }
}
