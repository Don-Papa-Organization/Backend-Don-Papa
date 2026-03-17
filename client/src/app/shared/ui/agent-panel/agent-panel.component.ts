import { Component, OnInit, OnDestroy } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AgentState } from "../../../domain/agent/state/agent.state";
import { AgentMessage } from "../../../domain/agent/models/agent-message.model";
import { AgentQueryResponseDto } from "../../../domain/agent/dtos/response/agent-query.response.dto";
import * as AgentActions from "../../../domain/agent/state/agent.actions";
import * as AgentSelectors from "../../../domain/agent/state/agent.selectors";

@Component({
  selector: "app-agent-panel",
  standalone: false,
  templateUrl: "./agent-panel.component.html",
  styleUrls: ["./agent-panel.component.scss"]
})
export class AgentPanelComponent implements OnInit, OnDestroy {
  conversation$: Observable<AgentMessage[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | undefined>;
  lastResponse$: Observable<AgentQueryResponseDto | undefined>;
  isPanelOpen$: Observable<boolean>;

  messageInput: string = "";
  isMinimized = false;
  private destroy$ = new Subject<void>();

  constructor(private store: Store<{ agent: AgentState }>) {
    this.conversation$ = this.store.select(AgentSelectors.selectAgentConversation);
    this.loading$ = this.store.select(AgentSelectors.selectAgentLoading);
    this.error$ = this.store.select(AgentSelectors.selectAgentError);
    this.lastResponse$ = this.store.select(AgentSelectors.selectAgentLastResponse);
    this.isPanelOpen$ = this.store.select(AgentSelectors.selectAgentPanelOpen);
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closePanel(): void {
    this.isMinimized = false;
    this.store.dispatch(AgentActions.closeAgentPanel());
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }

  sendMessage(): void {
    if (this.messageInput.trim()) {
      this.store.dispatch(AgentActions.queryAgent({ 
        payload: { message: this.messageInput.trim() } 
      }));
      this.messageInput = "";
    }
  }

  selectOption(option: string): void {
    this.store.dispatch(AgentActions.queryAgent({ 
      payload: { message: option } 
    }));
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  getOptionValue(option: Record<string, unknown>): string {
    return (option['value'] as string) || '';
  }

  getOptionLabel(option: Record<string, unknown>): string {
    return (option['label'] as string) || '';
  }

  getOptionImageUrl(option: Record<string, unknown>): string | null {
    return (option['image_url'] as string) || null;
  }

  getOptionDescription(option: Record<string, unknown>): string | null {
    return (option['description'] as string) || null;
  }
}
