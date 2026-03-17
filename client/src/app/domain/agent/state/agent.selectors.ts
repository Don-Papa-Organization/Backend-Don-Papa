import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AgentState } from "./agent.state";

export const selectAgentState = createFeatureSelector<AgentState>("agent");

export const selectAgentLoading = createSelector(
  selectAgentState,
  (state) => state.loading
);

export const selectAgentError = createSelector(
  selectAgentState,
  (state) => state.error
);

export const selectAgentConversation = createSelector(
  selectAgentState,
  (state) => state.conversation
);

export const selectAgentLastResponse = createSelector(
  selectAgentState,
  (state) => state.lastResponse
);

export const selectAgentPanelOpen = createSelector(
  selectAgentState,
  (state) => state.isPanelOpen
);
