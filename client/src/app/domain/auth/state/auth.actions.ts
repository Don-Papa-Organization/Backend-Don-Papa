import { createAction, props } from "@ngrx/store";
import { Usuario } from "../../users/models/usuario.model";
import {
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthResendVerificationRequest,
  AuthVerifyEmailRequest,
  AuthUpdateProfileRequest,
  AuthChangePasswordRequest,
  AuthForgotPasswordRequest,
  AuthResetPasswordRequest
} from "../models/auth-requests.model";
import { UserProfile } from "../../../types/user-profile.type";

export const login = createAction(
  "[Auth] Login",
  props<{ payload: AuthLoginRequest }>()
);

export const loginSuccess = createAction(
  "[Auth] Login Success",
  props<{ user: Usuario }>()
);

export const loginFailure = createAction(
  "[Auth] Login Failure",
  props<{ error: string }>()
);

export const register = createAction(
  "[Auth] Register",
  props<{ payload: AuthRegisterRequest }>()
);

export const registerSuccess = createAction(
  "[Auth] Register Success",
  props<{ message: string }>()
);

export const registerFailure = createAction(
  "[Auth] Register Failure",
  props<{ error: string }>()
);

export const verifyEmail = createAction(
  "[Auth] Verify Email",
  props<{ payload: AuthVerifyEmailRequest }>()
);

export const verifyEmailSuccess = createAction(
  "[Auth] Verify Email Success",
  props<{ message: string }>()
);

export const verifyEmailFailure = createAction(
  "[Auth] Verify Email Failure",
  props<{ error: string }>()
);

export const resendVerification = createAction(
  "[Auth] Resend Verification",
  props<{ payload: AuthResendVerificationRequest }>()
);

export const resendVerificationSuccess = createAction(
  "[Auth] Resend Verification Success",
  props<{ message: string }>()
);

export const resendVerificationFailure = createAction(
  "[Auth] Resend Verification Failure",
  props<{ error: string }>()
);

export const refreshToken = createAction("[Auth] Refresh Token");

export const refreshTokenSuccess = createAction(
  "[Auth] Refresh Token Success",
  props<{ accessToken: string }>()
);

export const refreshTokenFailure = createAction(
  "[Auth] Refresh Token Failure",
  props<{ error: string }>()
);

export const loadProfile = createAction("[Auth] Load Profile");

export const loadProfileSuccess = createAction(
  "[Auth] Load Profile Success",
  props<{ user: Usuario }>()
);

export const loadProfileFailure = createAction(
  "[Auth] Load Profile Failure",
  props<{ error: string }>()
);

export const checkEmail = createAction(
  "[Auth] Check Email",
  props<{ email: string }>()
);

export const checkEmailSuccess = createAction(
  "[Auth] Check Email Success",
  props<{ exists: boolean }>()
);

export const checkEmailFailure = createAction(
  "[Auth] Check Email Failure",
  props<{ error: string }>()
);

export const logout = createAction("[Auth] Logout");

export const logoutSuccess = createAction("[Auth] Logout Success");

export const logoutFailure = createAction(
  "[Auth] Logout Failure",
  props<{ error: string }>()
);

export const updateProfile = createAction(
  "[Auth] Update Profile",
  props<{ payload: AuthUpdateProfileRequest }>()
);

export const updateProfileSuccess = createAction(
  "[Auth] Update Profile Success",
  props<{ profile: UserProfile; message: string }>()
);

export const updateProfileFailure = createAction(
  "[Auth] Update Profile Failure",
  props<{ error: string }>()
);

export const changePassword = createAction(
  "[Auth] Change Password",
  props<{ payload: AuthChangePasswordRequest }>()
);

export const changePasswordSuccess = createAction(
  "[Auth] Change Password Success",
  props<{ message: string }>()
);

export const changePasswordFailure = createAction(
  "[Auth] Change Password Failure",
  props<{ error: string }>()
);

export const forgotPassword = createAction(
  "[Auth] Forgot Password",
  props<{ payload: AuthForgotPasswordRequest }>()
);

export const forgotPasswordSuccess = createAction(
  "[Auth] Forgot Password Success",
  props<{ message: string }>()
);

export const forgotPasswordFailure = createAction(
  "[Auth] Forgot Password Failure",
  props<{ error: string }>()
);

export const resetPassword = createAction(
  "[Auth] Reset Password",
  props<{ payload: AuthResetPasswordRequest }>()
);

export const resetPasswordSuccess = createAction(
  "[Auth] Reset Password Success",
  props<{ message: string }>()
);

export const resetPasswordFailure = createAction(
  "[Auth] Reset Password Failure",
  props<{ error: string }>()
);

export const clearAuthMessages = createAction(
  "[Auth] Clear Messages"
);