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
      var username = this.f.username.value
      var password = this.f.password.value
      var fullname = this.f.fullname.value
      var birthday = this.f.birthday.value
      var email = ' '
      var phone = ' '
      /***********Kiểm tra username có hợp lệ */
      if(!isNaN(username)){
        const re = /[0-9]{9,11}$/ //Kiểm tra sô đt
        if(re.test(String(username)))
          //Username là số dt
          phone = username
        else return this.error = 'Tên người dùng không hợp lệ'
      }else{
        //Check Email
        const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        username = username.toLowerCase()
        if(re.test(String(username)))
          //username là Email
          email = username
        else return this.error = 'Tên người dùng không hợp lệ'
      }

      //Người dùng nhập năm lớn hơn năm hiện tại
      if(((new Date().getTime() -  new Date(birthday).getTime())/31556952000) < 0)
        return this.error = 'Ngày sinh phải bé hơn ngày hiện tại'

      /**************OTP */
      this.router.navigate(['/account/signup/otp', {
        username, 
        password, 
        fullname,
        birthday, 
        email, 
        phone
      }]);
    }
  }
  
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
