import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';
import { AuthfakeauthenticationService } from '../../../core/services/authfake.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})

/**
 * Signup component
 */
export class SignupComponent implements OnInit, OnDestroy {

  signupForm: FormGroup;
  submitted = false;
  error = '';
  successmsg = false;

  // set the currenr year
  year: number = new Date().getFullYear();

  destroy$: Subject<boolean> = new Subject<boolean>();

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router,
    public authFackservice: AuthfakeauthenticationService) { }

  ngOnInit(): void {
    this.signupForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      fullname: ['', Validators.required],
      birthday: ['', Validators.required],
    });
  }
  // convenience getter for easy access to form fields
  get f() { return this.signupForm.controls; }

  /**
   * On submit form
   */
  onSubmit() {
    this.submitted = true;

    if (this.signupForm.invalid) {
      return;
    } else {
        this.authFackservice.register(this.f.username.value, this.f.password.value,
         this.f.fullname.value, this.f.birthday.value.toString())
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          data => {
            if (Object.values(data)[0] != null) {
              this.router.navigate(['/']);
            } else {
              this.error = Object.values(data)[1];
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
