import { createReducer, on } from "@ngrx/store";
import { initialAuthState } from "./auth.initial-state";
import * as AuthActions from "./auth.actions";

export const authReducer = createReducer(
  initialAuthState,

  on(
    AuthActions.login,
    AuthActions.register,
    AuthActions.verifyEmail,
    AuthActions.resendVerification,
    AuthActions.refreshToken,
    AuthActions.loadProfile,
    AuthActions.checkEmail,
    AuthActions.logout,
    AuthActions.updateProfile,
    AuthActions.changePassword,
    AuthActions.forgotPassword,
    AuthActions.resetPassword,
    (state) => ({
      ...state,
      loading: true,
      error: undefined,
      emailExists: state.emailExists,
      message: undefined
    })
  ),

  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: true,
    loading: false
  })),

  on(AuthActions.loadProfileSuccess, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: true,
    loading: false
  })),

  on(AuthActions.updateProfileSuccess, (state, { profile, message }) => ({
    ...state,
    profile,
    user: {
      idUsuario: profile.id,
      correo: profile.correo,
      tipoUsuario: profile.tipoUsuario,
      activo: profile.activo
    },
    message,
    loading: false
  })),

  on(AuthActions.refreshTokenSuccess, (state, { accessToken }) => ({
    ...state,
    accessToken,
    loading: false
  })),

  on(
    AuthActions.registerSuccess,
    AuthActions.verifyEmailSuccess,
    AuthActions.resendVerificationSuccess,
    AuthActions.checkEmailSuccess,
    AuthActions.changePasswordSuccess,
    AuthActions.forgotPasswordSuccess,
    AuthActions.resetPasswordSuccess,
    (state, action) => ({
      ...state,
      loading: false,
      message: (action as { message?: string }).message
    })
  ),

  on(AuthActions.checkEmail, (state) => ({
    ...state,
    emailExists: undefined
  })),

  on(AuthActions.checkEmailSuccess, (state, { exists }) => ({
    ...state,
    loading: false,
    emailExists: exists
  })),

  on(AuthActions.logoutSuccess, () => ({
    ...initialAuthState
  })),

  on(
    AuthActions.loginFailure,
    AuthActions.registerFailure,
    AuthActions.verifyEmailFailure,
    AuthActions.resendVerificationFailure,
    AuthActions.refreshTokenFailure,
    AuthActions.loadProfileFailure,
    AuthActions.checkEmailFailure,
    AuthActions.logoutFailure,
    AuthActions.updateProfileFailure,
    AuthActions.changePasswordFailure,
    AuthActions.forgotPasswordFailure,
    AuthActions.resetPasswordFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error
    })
  ),

  on(AuthActions.clearAuthMessages, (state) => ({
    ...state,
    error: undefined,
    message: undefined
  }))
);