import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ReportsApi } from '../../../../../services/apis/reports.api';
import { ApiResponse } from '../../../../../types/api-response.type';
import { Bitacora } from '../../../../../domain/reports/models/bitacora.model';
import { BitacoraIncidentRequestDto } from '../../../../../domain/reports/dtos/request/bitacora-incident.request.dto';
import { BitacoraCommentRequestDto } from '../../../../../domain/reports/dtos/request/bitacora-comment.request.dto';

@Injectable({
  providedIn: 'root'
})
export class ReportsFacade {
  constructor(private reportsApi: ReportsApi) { }

  registerIncident(dto: BitacoraIncidentRequestDto): Observable<ApiResponse<Bitacora>> {
    return this.reportsApi.registerIncident(dto);
  }

  registerComment(dto: BitacoraCommentRequestDto): Observable<ApiResponse<Bitacora>> {
    return this.reportsApi.registerComment(dto);
  }
}
