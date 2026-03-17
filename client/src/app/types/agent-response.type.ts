export type AgentResponseFormat = "text" | "clarification" | "selection" | "confirmation" | "error";

export interface AgentAction {
  type: string;
  label: string;
  value?: string;
}

export interface AgentMeta {
  tools_used: number;
  tools_called: string[];
  model?: string;
  user_role?: string;
  status_code: number;
}

export interface AgentView {
  type: string;
  title?: string;
  description?: string;
  options?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface AgentResponseEnvelope {
  ok: boolean;
  session_id: string;
  message: string;
  format: AgentResponseFormat;
  view?: AgentView | null;
  actions: AgentAction[];
  meta: AgentMeta;
}
