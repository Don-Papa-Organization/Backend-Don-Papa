import { createReducer, on } from "@ngrx/store";
import { initialAgentState } from "./agent.initial-state";
import * as AgentActions from "./agent.actions";
import { AgentMessage } from "../models/agent-message.model";

const createMessage = (sender: "user" | "agent", message: string): AgentMessage => ({
  id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  sender,
  message,
  createdAt: new Date().toISOString()
});

export const agentReducer = createReducer(
  initialAgentState,

  on(AgentActions.queryAgent, (state, { payload }) => ({
    ...state,
    loading: true,
    error: undefined,
    conversation: [...state.conversation, createMessage("user", payload.message)]
  })),

  on(AgentActions.queryAgentSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    lastResponse: response,
    conversation: [...state.conversation, createMessage("agent", response.message)]
  })),

  on(AgentActions.queryAgentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(AgentActions.clearAgentConversation, (state) => ({
    ...state,
    conversation: [],
    error: undefined,
    lastResponse: undefined
  })),

  on(AgentActions.toggleAgentPanel, (state) => ({
    ...state,
    isPanelOpen: !state.isPanelOpen
  })),

  on(AgentActions.openAgentPanel, (state) => ({
    ...state,
    isPanelOpen: true
  })),

  on(AgentActions.closeAgentPanel, (state) => ({
    ...state,
    isPanelOpen: false
  }))
);
