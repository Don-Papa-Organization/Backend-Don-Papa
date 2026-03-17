import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { SharedModule } from './shared/shared-module';
import { LayoutModule } from './shared/layout/layout-module';
import { authReducer } from './domain/auth/state/auth.reducer';
import { AuthEffects } from './domain/auth/state/auth.effects';
import { agentReducer } from './domain/agent/state/agent.reducer';
import { AgentEffects } from './domain/agent/state/agent.effects';
import { credentialsInterceptor } from './core/interceptors/credentials.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { responseInterceptor } from './core/interceptors/response.interceptor';

@NgModule({
  declarations: [
    App
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    LayoutModule,
    StoreModule.forRoot({ auth: authReducer, agent: agentReducer }),
    EffectsModule.forRoot([AuthEffects, AgentEffects])
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withInterceptors([
        credentialsInterceptor,
        errorInterceptor,
        responseInterceptor
      ])
    )
  ],
  bootstrap: [App]
})
export class AppModule { }
