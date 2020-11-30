import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthenticationService } from '../../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../../core/services/authfake.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

/**
 * Login component
 */
export class LoginComponent implements OnInit, OnDestroy {
  
  loginForm: FormGroup;
  submitted = false;
  error = '';
  returnUrl: string;
  isLoggedIn: boolean = false;
  count = 0;

  // set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute,
    private router: Router, public authenticationService: AuthenticationService,
    public authFackservice: AuthfakeauthenticationService) { }

  destroy$: Subject<boolean> = new Subject<boolean>();

  ngOnInit(): void {
    var checklogin = this.authFackservice.checkLogin();
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
    
    // reset login status
    // this.authenticationService.logout();
    // get return url from route parameters or default to '/'
    // tslint:disable-next-line: no-string-literal
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    if(checklogin)
      this.router.navigate(['/']);
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    } else {
      this.authFackservice.login(this.f.email.value, this.f.password.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          data => {
            if(data != null)
              this.router.navigate(['/']);
            else {
              this.error = 'Tên người dùng hoặc mật khẩu không chính xác';
            }
          },
          error => {
            this.error = error ? error : '';
          });
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
