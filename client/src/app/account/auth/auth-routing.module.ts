import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { PasswordresetComponent } from './passwordreset/passwordreset.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { OTPComponent } from './signup/otp/otp.component';
import { OTPResComponent } from './passwordreset/otp/otp.component';

const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'signup',
        component: SignupComponent,
    },
    {
        path: 'signup/otp',
        component: OTPComponent
    },
    {
        path: 'reset-password',
        component: PasswordresetComponent
    },
    {
        path: 'reset-password/otp',
        component: OTPResComponent
    },
    {
        path: 'lock-screen',
        component: LockscreenComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule { }
