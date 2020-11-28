import { Component, OnInit, ViewChild, OnDestroy  } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthfakeauthenticationService } from '../../../../core/services/authfake.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss']
})

/**
 * OTP comoponent
 */
export class OTPComponent implements OnInit, OnDestroy {

  submitted = false;
  error = '';
  success = '';
  loading = false;

  // set the currenr year
  year: number = new Date().getFullYear();

  destroy$: Subject<boolean> = new Subject<boolean>();

  // tslint:disable-next-line: max-line-length
  constructor(private route: ActivatedRoute, private router: Router, private routes: ActivatedRoute, public authFackservice: AuthfakeauthenticationService) { }

  ngOnInit(): void {
  }

  otp:string = '';
  showOtpComponent = true;
  @ViewChild('ngOtpInput', { static: false}) ngOtpInput: any;
  config = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: '',
    inputStyles: {
      'width': '50px',
      'height': '50px'
    }
  };
  onOtpChange(otp) {
    this.otp = otp;
  }

  setVal(val) {
    this.ngOtpInput.setValue(val);
  }

  toggleDisable(){
    if(this.ngOtpInput.otpForm){
      if(this.ngOtpInput.otpForm.disabled){
        this.ngOtpInput.otpForm.enable();
      }else{
        this.ngOtpInput.otpForm.disable();
      }
    }
  }

  onConfigChange() {
    this.showOtpComponent = false;
    this.otp = null;
    setTimeout(() => {
      this.showOtpComponent = true;
    }, 0);
  }

  // convenience getter for easy access to form fields

  /**
   * On submit form
   */
  onSubmit() {
    this.success = '';
    this.submitted = true;

    // stop here if form is invalid
    if(this.otp.length < 6)
      return this.error = 'Mã OTP phải đủ 6 ký tự số'
    //Gửi và kiểm tra OTP
    //Chưa làm
    /********************** register ******************************/
    var username = this.routes.snapshot.paramMap.get('username')
    var password = this.routes.snapshot.paramMap.get('password')
    var fullname = this.routes.snapshot.paramMap.get('fullname')
    var email = this.routes.snapshot.paramMap.get('email')
    var phone = this.routes.snapshot.paramMap.get('phone')
    var birthday = this.routes.snapshot.paramMap.get('birthday')

    this.authFackservice.register(username, password, fullname, email, phone, birthday)
      .pipe(takeUntil(this.destroy$)).subscribe(data => {
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
