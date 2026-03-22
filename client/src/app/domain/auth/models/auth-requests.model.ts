import { TipoUsuario } from "../../../types/tipo.usuario";

export interface AuthLoginRequest {
  correo: string;
  contrasena: string;
}

export interface AuthRegisterRequest {
  correo: string;
  contrasena: string;
  tipoUsuario?: TipoUsuario;
}

export interface AuthVerifyEmailRequest {
  token: string;
}

export interface AuthResendVerificationRequest {
  correo: string;
}

export interface AuthUpdateProfileRequest {
  nombre?: string;
  telefono?: string;
  direccion?: string;
}

export interface AuthChangePasswordRequest {
  contrasenaActual: string;
  nuevaContrasena: string;
  confirmarContrasena: string;
}

export interface AuthForgotPasswordRequest {
  correo: string;
}

export interface AuthResetPasswordRequest {
  token: string;
  nuevaContrasena: string;
  confirmarContrasena: string;
}
