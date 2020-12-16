import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Contacts } from './contacts.model';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthfakeauthenticationService } from '../../../core/services/authfake.service';
import { SocketioService } from '../../index/socketio.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
/**
 * Tab-contacts component
 */
export class ContactsComponent implements OnInit, OnDestroy {

  contactForm: FormGroup;

  contacts: Contacts[] = []
  contactsList: any;

  searchText = '';
  userSearch = []
  friendList:any = []
  error = ''

  myName = ''
  id = ''

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private modalService: NgbModal, public translate: TranslateService, private formBuilder: FormBuilder,
    private authFackservice: AuthfakeauthenticationService, private socketService : SocketioService) { }

  ngOnInit(): void {
    var data = localStorage.getItem('currentUser')    
    var user = JSON.parse(data)[0]

    this.myName = user.fullname;
    this.id = user.id

    this.contactForm = this.formBuilder.group({
      name: ['', Validators.required],
      invitemessage: ['Xin chao bạn, mình là ' + this.myName + ' rất vui khi được làm quen với bạn.']
    });
    //getFrrend list
    this.authFackservice.getFriendlist(this.id).pipe(takeUntil(this.destroy$)).subscribe( data => {
      this.friendList = data
      var count = 0, idfr
      this.friendList.forEach(e => {          
        if(count % 2 === 0){
          idfr = e
        } else {
          var contact: Contacts = {id: idfr, name: e}
          this.contacts.push(contact)
        }
        count++
      });
      const sorted = this.contacts.sort((a, b) => a.name > b.name ? 1 : -1);
  
      const grouped = sorted.reduce((groups, contact) => {
        const letter = this.translate.instant(contact.name).charAt(0);
        groups[letter] = groups[letter] || [];
        groups[letter].push(contact);

        return groups;
      }, {});

      // contacts list
      this.contactsList = Object.keys(grouped).map(key => ({ key, contacts: grouped[key] }));
    },
    error => {
      console.error(error);
    });

    this.authFackservice.getAllEmailPhone().pipe(takeUntil(this.destroy$)).subscribe( data => {
      this.userSearch = data['userData']
      //Lấy danh sách người dùng
      var index = this.userSearch.indexOf(user.email, 0);
      //Bỏ số đt email của mình
      if (index > -1) {
        this.userSearch.splice(index, 1);
      }
      var index = this.userSearch.indexOf(user.phone, 0);
      if (index > -1) {
        this.userSearch.splice(index, 1);
      }
      //Bỏ email số đã gửi add fr req
      this.authFackservice.getSendFriendRequest(this.id).pipe(takeUntil(this.destroy$)).subscribe( data => {        
        for(var e in data){
          var index = this.userSearch.indexOf(data[e], 0);
          if (index > -1) {
            this.userSearch.splice(index, 1);
          }
        }
      },
      error => {
        console.error(error);
      });
      //Bỏ email số đã add fr
      for(var e in this.friendList){
        var index = this.userSearch.indexOf(this.friendList[e], 0);
        if (index > -1) {
          this.userSearch.splice(index, 1);
        }
      }
    },
    error => {
      console.error(error);
    });
  }

  get f() { return this.contactForm.controls; }

  /**
   * Contacts modal open
   * @param content content
   */
  // tslint:disable-next-line: typedef
  openContactsModal(content) {
    this.modalService.open(content, { centered: true });
  }

  close(){
    this.searchText = ''
    this.modalService.dismissAll()
  }

  onSubmit(){
    var usernameReceived = this.searchText
    
    this.authFackservice.findUserbyUsername(usernameReceived)
      .pipe(takeUntil(this.destroy$)).subscribe(data => {
        if(data['user'] === null)
          return this.error = 'Người dùng không tồn tại'
        else{
        //send
          this.socketService.sendFriend(this.id, usernameReceived, this.f.invitemessage.value)
          var index = this.userSearch.indexOf(usernameReceived, 0);
          if (index > -1) 
              this.userSearch.splice(index, 1);
          this.searchText = ''
          this.modalService.dismissAll()
        }
      })
  }

  getUser(event){
    var target = event.target || event.srcElement || event.currentTarget;
    var idAttr = target.attributes.id;
    var value = idAttr.nodeValue;
    
    this.searchText = value
  }

  mess(id){
    console.log(id);
  }

  block(id){
    console.log(id);
  }

  unfriend(id){
    console.log(id);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
