import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap } from "rxjs";
import { AgentApi } from "../../../services/apis/agent.api";
import * as AgentActions from "./agent.actions";

@Injectable()
export class AgentEffects {
  private readonly actions$ = inject(Actions);
  private readonly agentApi = inject(AgentApi);

  queryAgent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AgentActions.queryAgent),
      switchMap(({ payload }) =>
        this.agentApi.query(payload).pipe(
          map((response) => AgentActions.queryAgentSuccess({ response, userMessage: payload.message })),
          catchError((error) =>
            of(
              AgentActions.queryAgentFailure({
                error: error?.message || "Error inesperado al consultar el agente",
                userMessage: payload.message
              })
            )
          )
        )
      )
    )
  );
}
