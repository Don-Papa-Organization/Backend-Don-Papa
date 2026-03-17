import { AgentState } from "./agent.state";

export const initialAgentState: AgentState = {
  loading: false,
  error: undefined,
  conversation: [],
  lastResponse: undefined,
  isPanelOpen: false
};
