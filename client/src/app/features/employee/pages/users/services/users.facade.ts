import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { UsersApi } from '../../../../../services/apis/users.api';
import { ApiResponse } from '../../../../../types/api-response.type';
import { AuthProfileResponseDto } from '../../../../../domain/users/dtos/response/auth-profile.response.dto';
import { AuthUpdateProfileRequestDto } from '../../../../../domain/users/dtos/request/auth-update-profile.request.dto';
import { AuthUpdateProfileResponseDto } from '../../../../../domain/users/dtos/response/auth-update-profile.response.dto';
import { AuthChangePasswordRequestDto } from '../../../../../domain/users/dtos/request/auth-change-password.request.dto';
import { AuthChangePasswordResponseDto } from '../../../../../domain/users/dtos/response/auth-change-password.response.dto';
import { AuthLogoutResponseDto } from '../../../../../domain/users/dtos/response/auth-logout.response.dto';
import { GetEmployeeByDocumentResponseDto } from '../../../../../domain/users/dtos/response/get-employee-by-document.response.dto';

@Injectable({
  providedIn: 'root'
})
export class UsersFacade {
  constructor(private usersApi: UsersApi) { }

  getEmployeeByDocument(documento: string): Observable<ApiResponse<GetEmployeeByDocumentResponseDto>> {
    return this.usersApi.getEmployeeByDocument(documento);
  }

  getProfile(): Observable<ApiResponse<AuthProfileResponseDto>> {
    return this.usersApi.getProfile();
  }

  updateProfile(dto: AuthUpdateProfileRequestDto): Observable<ApiResponse<AuthUpdateProfileResponseDto>> {
    return this.usersApi.updateProfile(dto);
  }

  changePassword(dto: AuthChangePasswordRequestDto): Observable<ApiResponse<AuthChangePasswordResponseDto>> {
    return this.usersApi.changePassword(dto);
  }

  logout(): Observable<ApiResponse<AuthLogoutResponseDto>> {
    return this.usersApi.logout();
  }
}
