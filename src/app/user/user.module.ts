import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthModalComponent } from './auth-modal/auth-modal.component';
import { SharedModule } from '../shared/shared.module';
import { ModalComponent } from '../shared/modal/modal.component';



@NgModule({
  declarations: [
    AuthModalComponent,
    ModalComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    AuthModalComponent
  ]
})
export class UserModule { }
