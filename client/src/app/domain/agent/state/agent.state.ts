import { AgentQueryResponseDto } from "../dtos/response/agent-query.response.dto";
import { AgentMessage } from "../models/agent-message.model";

export interface AgentState {
  loading: boolean;
  error?: string;
  conversation: AgentMessage[];
  lastResponse?: AgentQueryResponseDto;
  isPanelOpen: boolean;
}
