import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

/**
 * Tabs-settings component
 */
export class SettingsComponent implements OnInit {
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
  sexopt = []
  
  constructor() { }

  ngOnInit(): void {
    //Get user from localStorage
    var data = localStorage.getItem('currentUser')    
    var user = JSON.parse(data)[0]

    this.url_avatar = user.url_avatar
    this.nickname = user.nickname
    this.status = user.status
    this.status_message = user.status_message
    this.fullname = user.fullname
    this.email = user.email
    this.phone = user.phone
    this.address = user.address
    this.sex = user.sex
    this.birthday = user.birthday
    this.sexopt = ['Nam', 'Nữ', 'Không xác định']
  }

  editavatar(){
    
  }

  active(){

  }

  bussy(){

  }

  editprofile(){
    this.editable = true
    console.log('editprofile');
  }

  saveprofile(){
    this.editable = false
    console.log('save'); 
  }

  cancel(){
    this.editable = false
    console.log('cancel'); 
  }
}
