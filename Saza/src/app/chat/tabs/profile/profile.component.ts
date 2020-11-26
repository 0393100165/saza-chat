import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
/**
 * Tabs-Profile component
 */
export class ProfileComponent implements OnInit {
  nickname = ''
  status = ''
  status_message =''
  fullname = ''
  email = ''
  phone = ''
  address = ''
  
  constructor() { }

  ngOnInit(): void {
    //Get user from localStorage
    var data = localStorage.getItem('currentUser')    
    var user = JSON.parse(data)[0]

    this.nickname = user.nicnname
    this.status = user.status
    this.status_message = user.status_message
    this.fullname = user.firstName + ' ' + user.lastName
    this.email = user.email
    this.phone = user.phone
    this.address = user.address
  }

}
