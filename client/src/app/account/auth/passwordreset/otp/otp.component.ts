import { Component, OnInit, ViewChild, OnDestroy  } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthfakeauthenticationService } from '../../../../core/services/authfake.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

import * as firebase from 'firebase/app'
import { WindowService } from '../../../../core/services/window.service';

@Component({
  selector: 'app-otp-res',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss']
})

/**
 * OTP comoponent
 */
export class OTPResComponent implements OnInit, OnDestroy {

  submitted = false;
  error = '';
  success = '';
  loading = false;

  windowRef: any;
  user: any;
  verify:Boolean = false

  // set the currenr year
  year: number = new Date().getFullYear();

  destroy$: Subject<boolean> = new Subject<boolean>();

  // tslint:disable-next-line: max-line-length
  constructor(private route: ActivatedRoute, private router: Router, private routes: ActivatedRoute,
    public authFackservice: AuthfakeauthenticationService, private win: WindowService) { }

    ngOnInit(): void {
      firebase.initializeApp(environment.firebaseConfig);
  
      this.windowRef = this.win.windowRef
      this.windowRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container')
  
      this.windowRef.recaptchaVerifier.render()
  
      var phone = this.routes.snapshot.paramMap.get('phone')
      if(phone != ' ')
        this.sendLoginCode('+84'+phone)
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

    //Kiểm tra username đã tồn tại chưa
    var username = this.routes.snapshot.paramMap.get('username')
    this.authFackservice.findUserbyUsername(username)
        .pipe(takeUntil(this.destroy$)).subscribe(data => {
          if(data === null)
            return this.error = 'Tên người dùng không tồn tại'
    })

   this.verifyLoginCode()

   if(this.verify){

   }
  }

  sendLoginCode(num) {
    const appVerifier = this.windowRef.recaptchaVerifier;
    firebase.auth().signInWithPhoneNumber(num, appVerifier)
      .then(result => {
          this.windowRef.confirmationResult = result;
          this.loading = true;
      })
      .catch( error => this.error = error ? error : '' );
  }

  verifyLoginCode() {
    this.windowRef.confirmationResult
      .confirm(this.otp)
      .then( result => {this.verify = true})
    .catch( error => this.error = 'Mã xác thực OTP không đúng');
  }

  reSendOTP(){
    this.success = 'Mã OTP đã được gửi'
    this.loading = false;
    var phone = this.routes.snapshot.paramMap.get('phone')
    if(phone != ' ')
      this.sendLoginCode('+84'+phone)
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
