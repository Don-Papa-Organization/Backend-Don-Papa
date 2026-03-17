import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_ENDPOINTS, buildApiUrl } from "../../config/api.config";
import { AgentQueryRequestDto } from "../../domain/agent/dtos/request/agent-query.request.dto";
import { AgentQueryResponseDto } from "../../domain/agent/dtos/response/agent-query.response.dto";

@Injectable({ providedIn: "root" })
export class AgentApi {
  private readonly queryUrl = buildApiUrl(API_ENDPOINTS.agent.query());
  private readonly healthUrl = buildApiUrl(API_ENDPOINTS.agent.health());

  constructor(private http: HttpClient) {}

  query(dto: AgentQueryRequestDto): Observable<AgentQueryResponseDto> {
    return this.http.post<AgentQueryResponseDto>(this.queryUrl, dto);
  }

  health(): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(this.healthUrl);
  }
}
