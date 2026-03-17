import { createAction, props } from "@ngrx/store";
import { AgentQueryRequestDto } from "../dtos/request/agent-query.request.dto";
import { AgentQueryResponseDto } from "../dtos/response/agent-query.response.dto";

export const queryAgent = createAction(
  "[Agent] Query",
  props<{ payload: AgentQueryRequestDto }>()
);

export const queryAgentSuccess = createAction(
  "[Agent] Query Success",
  props<{ response: AgentQueryResponseDto; userMessage: string }>()
);

export const queryAgentFailure = createAction(
  "[Agent] Query Failure",
  props<{ error: string; userMessage: string }>()
);

export const clearAgentConversation = createAction("[Agent] Clear Conversation");

export const toggleAgentPanel = createAction("[Agent] Toggle Panel");

export const openAgentPanel = createAction("[Agent] Open Panel");

export const closeAgentPanel = createAction("[Agent] Close Panel");
