import { AgentAction, AgentMeta, AgentResponseFormat, AgentView } from "../../../../types/agent-response.type";

export interface AgentQueryResponseDto {
  ok: boolean;
  session_id: string;
  message: string;
  format: AgentResponseFormat;
  view?: AgentView | null;
  actions: AgentAction[];
  meta: AgentMeta;
}
