import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthfakeauthenticationService } from '../../../core/services/authfake.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

/**
 * Tabs-settings component
 */
export class SettingsComponent implements OnInit, OnDestroy {

  profileForm: FormGroup;
  submitted = false;
  error = '';
  successmsg = false;
  url_avatar = ''
  nickname = ''
  status = ''
  status_message =''
  fullname = ''
  email = ''
  phone = ''
  address = ''
  sex = ''
  birthday = ''
  editable :boolean = false
  editemail :boolean = false
  editphone :boolean = false

  destroy$: Subject<boolean> = new Subject<boolean>();
  
  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router,
    private authFackservice: AuthfakeauthenticationService) { }

  ngOnInit(): void {
    this.profileForm = this.formBuilder.group({
      fullname: ['', Validators.required],
      birthday: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],
    });

    //Get user from localStorage
    var data = localStorage.getItem('currentUser')    
    var user = JSON.parse(data)[0]

    this.url_avatar = user.url_avatar
    this.nickname = user.nickname
    this.status = user.status
    this.status_message = user.status_message
    this.fullname = user.fullname
    this.email = user.email
    this.editemail = user.email === ' '
    this.phone = user.phone
    this.editphone = user.phone === ' '
    this.address = user.address
    this.sex = user.sex
    this.birthday = user.birthday
  }

  editavatar(){
    
  }

  active(){

  }

  bussy(){

  }

  // convenience getter for easy access to form fields
  get f() { return this.profileForm.controls; }

  editprofile(){
    this.editable = true
    console.log('editprofile');

  }

  onSubmit() {
    this.submitted = true;
    this.editable = false
    console.log(this.f.fullname.value);
     
  }

  cancel(){
    this.editable = false
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}