import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiResponse } from "../../types/api-response.type";
import { Usuario } from "../../domain/users/models/usuario.model";
import { Cliente } from "../../domain/users/models/cliente.model";
import { AuthRegisterRequestDto } from "../../domain/users/dtos/request/auth-register.request.dto";
import { AuthVerifyEmailRequestDto } from "../../domain/users/dtos/request/auth-verify-email.request.dto";
import { AuthLoginRequestDto } from "../../domain/users/dtos/request/auth-login.request.dto";
import { AuthResendVerificationRequestDto } from "../../domain/users/dtos/request/auth-resend-verification.request.dto";
import { CreateClientForUserRequestDto } from "../../domain/users/dtos/request/create-client-for-user.request.dto";
import { CreateClientRequestDto } from "../../domain/users/dtos/request/create-client.request.dto";
import { SearchClientsRequestDto } from "../../domain/users/dtos/request/search-clients.request.dto";
import { ListClientsRequestDto } from "../../domain/users/dtos/request/list-clients.request.dto";
import { ListClientsEnrichedRequestDto } from "../../domain/users/dtos/request/list-clients-enriched.request.dto";
import { ListEmployeesRequestDto } from "../../domain/users/dtos/request/list-employees.request.dto";
import { CreateEmployeeRequestDto } from "../../domain/users/dtos/request/create-employee.request.dto";
import { ListUsersRequestDto } from "../../domain/users/dtos/request/list-users.request.dto";
import { AuthRegisterResponseDto } from "../../domain/users/dtos/response/auth-register.response.dto";
import { AuthVerifyEmailResponseDto } from "../../domain/users/dtos/response/auth-verify-email.response.dto";
import { AuthLoginResponseDto } from "../../domain/users/dtos/response/auth-login.response.dto";
import { AuthRefreshTokenResponseDto } from "../../domain/users/dtos/response/auth-refresh-token.response.dto";
import { AuthResendVerificationResponseDto } from "../../domain/users/dtos/response/auth-resend-verification.response.dto";
import { AuthLogoutResponseDto } from "../../domain/users/dtos/response/auth-logout.response.dto";
import { AuthProfileResponseDto } from "../../domain/users/dtos/response/auth-profile.response.dto";
import { AuthCheckEmailResponseDto } from "../../domain/users/dtos/response/auth-check-email.response.dto";
import { AuthUpdateProfileRequestDto } from "../../domain/users/dtos/request/auth-update-profile.request.dto";
import { AuthChangePasswordRequestDto } from "../../domain/users/dtos/request/auth-change-password.request.dto";
import { AuthForgotPasswordRequestDto } from "../../domain/users/dtos/request/auth-forgot-password.request.dto";
import { AuthResetPasswordRequestDto } from "../../domain/users/dtos/request/auth-reset-password.request.dto";
import { AuthUpdateProfileResponseDto } from "../../domain/users/dtos/response/auth-update-profile.response.dto";
import { AuthChangePasswordResponseDto } from "../../domain/users/dtos/response/auth-change-password.response.dto";
import { AuthForgotPasswordResponseDto } from "../../domain/users/dtos/response/auth-forgot-password.response.dto";
import { AuthResetPasswordResponseDto } from "../../domain/users/dtos/response/auth-reset-password.response.dto";
import { ClienteEnrichedDto } from "../../domain/users/dtos/response/list-clients-enriched.response.dto";
import { EmpleadoListItemDto } from "../../domain/users/dtos/response/list-employees.response.dto";
import { GetEmployeeResponseDto } from "../../domain/users/dtos/response/get-employee.response.dto";
import { GetEmployeeByDocumentResponseDto } from "../../domain/users/dtos/response/get-employee-by-document.response.dto";
import { CreateEmployeeResponseDto } from "../../domain/users/dtos/response/create-employee.response.dto";
import { UpdateEmployeeRequestDto } from "../../domain/users/dtos/request/update-employee.request.dto";
import { UpdateEmployeeResponseDto } from "../../domain/users/dtos/response/update-employee.response.dto";
import { DeleteEmployeeResponseDto } from "../../domain/users/dtos/response/delete-employee.response.dto";
import { API_ENDPOINTS, buildApiUrl } from "../../config/api.config";

@Injectable({ providedIn: "root" })
export class UsersApi {
	private readonly authRegisterUrl = buildApiUrl(API_ENDPOINTS.users.authRegister());
	private readonly authVerifyEmailUrl = buildApiUrl(API_ENDPOINTS.users.authVerifyEmail());
	private readonly authLoginUrl = buildApiUrl(API_ENDPOINTS.users.authLogin());
	private readonly authRefreshTokenUrl = buildApiUrl(API_ENDPOINTS.users.authRefreshToken());
	private readonly authResendVerificationUrl = buildApiUrl(API_ENDPOINTS.users.authResendVerification());
	private readonly authLogoutUrl = buildApiUrl(API_ENDPOINTS.users.authLogout());
	private readonly authProfileUrl = buildApiUrl(API_ENDPOINTS.users.authProfile());
	private readonly authChangePasswordUrl = buildApiUrl(API_ENDPOINTS.users.authChangePassword());
	private readonly authForgotPasswordUrl = buildApiUrl(API_ENDPOINTS.users.authForgotPassword());
	private readonly authResetPasswordUrl = buildApiUrl(API_ENDPOINTS.users.authResetPassword());
	private readonly clientsUrl = buildApiUrl(API_ENDPOINTS.users.clients());
	private readonly clientsSearchUrl = buildApiUrl(API_ENDPOINTS.users.clientsSearch());
	private readonly clientsEnrichedUrl = buildApiUrl(API_ENDPOINTS.users.clientsEnriched());
	private readonly employeesUrl = buildApiUrl(API_ENDPOINTS.users.employees());
	private readonly usersUrl = buildApiUrl(API_ENDPOINTS.users.users());

	constructor(private http: HttpClient) {}

	register(dto: AuthRegisterRequestDto): Observable<ApiResponse<AuthRegisterResponseDto>> {
		return this.http.post<ApiResponse<AuthRegisterResponseDto>>(this.authRegisterUrl, dto);
	}

	verifyEmail(dto: AuthVerifyEmailRequestDto): Observable<ApiResponse<AuthVerifyEmailResponseDto>> {
		return this.http.get<ApiResponse<AuthVerifyEmailResponseDto>>(this.authVerifyEmailUrl, {
			params: dto as any
		});
	}

	login(dto: AuthLoginRequestDto): Observable<ApiResponse<AuthLoginResponseDto>> {
		return this.http.post<ApiResponse<AuthLoginResponseDto>>(this.authLoginUrl, dto);
	}

	refreshToken(): Observable<ApiResponse<AuthRefreshTokenResponseDto>> {
		return this.http.post<ApiResponse<AuthRefreshTokenResponseDto>>(this.authRefreshTokenUrl, {});
	}

	resendVerification(dto: AuthResendVerificationRequestDto): Observable<ApiResponse<AuthResendVerificationResponseDto>> {
		return this.http.post<ApiResponse<AuthResendVerificationResponseDto>>(this.authResendVerificationUrl, dto);
	}

	logout(): Observable<ApiResponse<AuthLogoutResponseDto>> {
		return this.http.post<ApiResponse<AuthLogoutResponseDto>>(this.authLogoutUrl, {});
	}

	getProfile(): Observable<ApiResponse<AuthProfileResponseDto>> {
		return this.http.get<ApiResponse<AuthProfileResponseDto>>(this.authProfileUrl);
	}

	updateProfile(dto: AuthUpdateProfileRequestDto): Observable<ApiResponse<AuthUpdateProfileResponseDto>> {
		return this.http.put<ApiResponse<AuthUpdateProfileResponseDto>>(this.authProfileUrl, dto);
	}

	changePassword(dto: AuthChangePasswordRequestDto): Observable<ApiResponse<AuthChangePasswordResponseDto>> {
		return this.http.post<ApiResponse<AuthChangePasswordResponseDto>>(this.authChangePasswordUrl, dto);
	}

	forgotPassword(dto: AuthForgotPasswordRequestDto): Observable<ApiResponse<AuthForgotPasswordResponseDto>> {
		return this.http.post<ApiResponse<AuthForgotPasswordResponseDto>>(this.authForgotPasswordUrl, dto);
	}

	resetPassword(dto: AuthResetPasswordRequestDto): Observable<ApiResponse<AuthResetPasswordResponseDto>> {
		return this.http.post<ApiResponse<AuthResetPasswordResponseDto>>(this.authResetPasswordUrl, dto);
	}

	checkEmail(email: string): Observable<ApiResponse<AuthCheckEmailResponseDto>> {
		return this.http.get<ApiResponse<AuthCheckEmailResponseDto>>(buildApiUrl(API_ENDPOINTS.users.authCheckEmail(email)));
	}

	listClients(dto?: ListClientsRequestDto): Observable<ApiResponse<Cliente[]>> {
		return this.http.get<ApiResponse<Cliente[]>>(this.clientsUrl, {
			params: dto as any
		});
	}

	searchClients(dto: SearchClientsRequestDto): Observable<ApiResponse<Cliente[]>> {
		return this.http.get<ApiResponse<Cliente[]>>(this.clientsSearchUrl, {
			params: dto as any
		});
	}

	listClientsEnriched(dto?: ListClientsEnrichedRequestDto): Observable<ApiResponse<ClienteEnrichedDto[]>> {
		return this.http.get<ApiResponse<ClienteEnrichedDto[]>>(this.clientsEnrichedUrl, {
			params: dto as any
		});
	}

	getClientEnriched(id: number): Observable<ApiResponse<ClienteEnrichedDto>> {
		return this.http.get<ApiResponse<ClienteEnrichedDto>>(buildApiUrl(API_ENDPOINTS.users.clientEnrichedDetail(id)));
	}

	getClient(id: number): Observable<ApiResponse<Cliente>> {
		return this.http.get<ApiResponse<Cliente>>(buildApiUrl(API_ENDPOINTS.users.clientDetail(id)));
	}

	createClientForUser(dto: CreateClientForUserRequestDto): Observable<ApiResponse<Cliente>> {
		return this.http.post<ApiResponse<Cliente>>(buildApiUrl(API_ENDPOINTS.users.clientForUser(dto.idUsuario)), dto);
	}

	createClient(dto: CreateClientRequestDto): Observable<ApiResponse<Cliente>> {
		return this.http.post<ApiResponse<Cliente>>(buildApiUrl(API_ENDPOINTS.users.clientCreate()), dto);
	}

	listEmployees(dto?: ListEmployeesRequestDto): Observable<ApiResponse<EmpleadoListItemDto[]>> {
		return this.http.get<ApiResponse<EmpleadoListItemDto[]>>(this.employeesUrl, {
			params: dto as any
		});
	}

	getEmployee(id: number): Observable<ApiResponse<GetEmployeeResponseDto>> {
		return this.http.get<ApiResponse<GetEmployeeResponseDto>>(buildApiUrl(API_ENDPOINTS.users.employeeDetail(id)));
	}

	getEmployeeByDocument(documento: string): Observable<ApiResponse<GetEmployeeByDocumentResponseDto>> {
		return this.http.get<ApiResponse<GetEmployeeByDocumentResponseDto>>(buildApiUrl(API_ENDPOINTS.users.employeeByDocument(documento)));
	}

	createEmployee(dto: CreateEmployeeRequestDto): Observable<ApiResponse<CreateEmployeeResponseDto>> {
		return this.http.post<ApiResponse<CreateEmployeeResponseDto>>(this.employeesUrl, dto);
	}

	updateEmployee(id: number, dto: UpdateEmployeeRequestDto): Observable<UpdateEmployeeResponseDto> {
		return this.http.put<UpdateEmployeeResponseDto>(buildApiUrl(API_ENDPOINTS.users.employeeDetail(id)), dto);
	}

	deleteEmployee(id: number): Observable<DeleteEmployeeResponseDto> {
		return this.http.delete<DeleteEmployeeResponseDto>(buildApiUrl(API_ENDPOINTS.users.employeeDetail(id)));
	}

	listUsers(dto?: ListUsersRequestDto): Observable<ApiResponse<Usuario[]>> {
		return this.http.get<ApiResponse<Usuario[]>>(this.usersUrl, {
			params: dto as any
		});
	}

	getUser(id: number): Observable<ApiResponse<Usuario>> {
		return this.http.get<ApiResponse<Usuario>>(buildApiUrl(API_ENDPOINTS.users.userDetail(id)));
	}

	getUserByEmail(correo: string): Observable<ApiResponse<Usuario>> {
		return this.http.get<ApiResponse<Usuario>>(buildApiUrl(API_ENDPOINTS.users.userByEmail(correo)));
	}
}
