import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

import { AuthRoutingModule } from './auth-routing.module';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { PasswordresetComponent } from './passwordreset/passwordreset.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';

import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [LoginComponent, SignupComponent, PasswordresetComponent, LockscreenComponent],
  imports: [
    CommonModule,
    TranslateModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    NgbAlertModule
  ]
})
export class AuthModule { }
