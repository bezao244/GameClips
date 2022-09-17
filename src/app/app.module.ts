import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { SharedModule } from './shared/shared.module';
import { AuthModalComponent } from './user/auth-modal/auth-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    AuthModalComponent
  ],
  imports: [
    BrowserModule,
    SharedModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
