import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { UsersApi } from "../../services/apis/users.api";
import { Usuario } from "../../domain/users/models/usuario.model";
import {
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthResendVerificationRequest,
  AuthVerifyEmailRequest,
  AuthUpdateProfileRequest,
  AuthChangePasswordRequest,
  AuthForgotPasswordRequest,
  AuthResetPasswordRequest
} from "../../domain/auth/models/auth-requests.model";
import { UserProfile } from "../../types/user-profile.type";

@Injectable({ providedIn: "root" })
export class AuthService {
  constructor(private usersApi: UsersApi) {}

  private resolveMessageResponse(res: unknown, fallbackMessage: string): string {
    const response = res as any;
    const message = response?.data?.message ?? response?.message;
    const isSuccess = response?.success === undefined ? !!message : !!response?.success;

    if (!isSuccess || !message) {
      throw new Error(response?.message || fallbackMessage);
    }

    return message;
  }

  login(payload: AuthLoginRequest): Observable<Usuario> {
    return this.usersApi.login(payload).pipe(
      map((res) => {
        const response = res as any;

        const userData = response?.data?.user ?? response?.user;
        const isSuccess = response?.success === undefined ? !!userData : !!response?.success;

        if (!isSuccess || !userData) {
          throw new Error(response?.message || "Error de autenticación");
        }

        const idUsuario = userData.id ?? userData.userId;
        const correo = userData.correo ?? userData.email;

        if (idUsuario === undefined || idUsuario === null || !correo || !userData.tipoUsuario) {
          throw new Error("Respuesta de autenticación inválida");
        }

        return {
          idUsuario,
          correo,
          tipoUsuario: userData.tipoUsuario,
          activo: userData.activo
        };
      })
    );
  }

  register(payload: AuthRegisterRequest): Observable<string> {
    return this.usersApi.register(payload).pipe(
      map((res) => this.resolveMessageResponse(res, "Error al registrar"))
    );
  }

  verifyEmail(payload: AuthVerifyEmailRequest): Observable<string> {
    return this.usersApi.verifyEmail(payload).pipe(
      map((res) => this.resolveMessageResponse(res, "Error al verificar"))
    );
  }

  resendVerification(payload: AuthResendVerificationRequest): Observable<string> {
    return this.usersApi.resendVerification(payload).pipe(
      map((res) => this.resolveMessageResponse(res, "Error al reenviar"))
    );
  }

  refreshToken(): Observable<string> {
    return this.usersApi.refreshToken().pipe(
      map((res) => {
        const token = res.data?.accessToken;
        if (!res.success || !token) {
          throw new Error(res.message || "Error al refrescar token");
        }
        return token;
      })
    );
  }

  loadProfile(): Observable<Usuario> {
    return this.usersApi.getProfile().pipe(
      map((res) => {
        if (!res.success || !res.data) {
          throw new Error(res.message || "Error al cargar perfil");
        }

        return {
          idUsuario: res.data.id,
          correo: res.data.correo,
          tipoUsuario: res.data.tipoUsuario,
          activo: res.data.activo
        };
      })
    );
  }

  checkEmail(email: string): Observable<boolean> {
    return this.usersApi.checkEmail(email).pipe(
      map((res) => {
        if (!res.success || res.data?.exists === undefined) {
          throw new Error(res.message || "Error al verificar email");
        }
        return res.data.exists;
      })
    );
  }

  logout(): Observable<void> {
    return this.usersApi.logout().pipe(
      map((res) => {
        if (!res.success) {
          throw new Error(res.message || "Error al cerrar sesión");
        }
      })
    );
  }

  updateProfile(payload: AuthUpdateProfileRequest): Observable<UserProfile> {
    return this.usersApi.updateProfile(payload).pipe(
      map((res) => {
        if (!res.success || !res.data) {
          throw new Error(res.message || "Error al actualizar perfil");
        }
        return res.data;
      })
    );
  }

  changePassword(payload: AuthChangePasswordRequest): Observable<string> {
    return this.usersApi.changePassword(payload).pipe(
      map((res) => {
        if (!res.success) {
          throw new Error(res.message || "Error al cambiar contraseña");
        }
        return res.data?.message || res.message || "Contraseña actualizada correctamente";
      })
    );
  }

  forgotPassword(payload: AuthForgotPasswordRequest): Observable<string> {
    return this.usersApi.forgotPassword(payload).pipe(
      map((res) => {
        if (!res.success) {
          throw new Error(res.message || "Error al enviar correo de recuperación");
        }
        return res.data?.message || res.message || "Correo de recuperación enviado";
      })
    );
  }

  resetPassword(payload: AuthResetPasswordRequest): Observable<string> {
    return this.usersApi.resetPassword(payload).pipe(
      map((res) => {
        if (!res.success) {
          throw new Error(res.message || "Error al restablecer contraseña");
        }
        return res.data?.message || res.message || "Contraseña restablecida correctamente";
      })
    );
  }
}