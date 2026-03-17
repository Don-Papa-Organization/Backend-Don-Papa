export type AgentMessageSender = "user" | "agent";

export interface AgentMessage {
  id: string;
  sender: AgentMessageSender;
  message: string;
  createdAt: string;
}
