import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthfakeauthenticationService } from '../../../core/services/authfake.service';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.component.html',
  styleUrls: ['./passwordreset.component.scss']
})
/**
 * Reset-password comoponent
 */
export class PasswordresetComponent implements OnInit, OnDestroy {

  resetForm: FormGroup;
  submitted = false;
  error = '';
  success = '';
  loading = false;

  destroy$: Subject<boolean> = new Subject<boolean>();

  // set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router,
    private authFackservice: AuthfakeauthenticationService) { }

  ngOnInit(): void {
    this.resetForm = this.formBuilder.group({
      username: ['', [Validators.required]],
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.resetForm.controls; }

  /**
   * On submit form
   */
  onSubmit() {
    this.success = '';
    this.submitted = true;

    // stop here if form is invalid
    if (this.resetForm.invalid) {
      return;
    }
    var username = this.f.username.value
    //Kiểm tra username có tồn tại ko
    this.authFackservice.FindUserbyUsername(username).pipe(takeUntil(this.destroy$)).subscribe(data => {
      if(Object.values(data)[0] === null)
        return this.error = 'Tên người dùng không tồn tại'
    })

    this.router.navigate(['/account/reset-password/otp', {
      username
    }]);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
