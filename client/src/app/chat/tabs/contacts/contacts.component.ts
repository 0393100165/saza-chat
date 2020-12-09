import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { contacts } from './data';
import { Contacts } from './contacts.model';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthfakeauthenticationService } from '../../../core/services/authfake.service';

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

  contacts: Contacts[];
  contactsList: any;

  searchText = '';
  userSearch = []
  error = ''

  myName = ''

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private modalService: NgbModal, public translate: TranslateService, private formBuilder: FormBuilder,
    private authFackservice: AuthfakeauthenticationService) { }

  ngOnInit(): void {
    var data = localStorage.getItem('currentUser')    
    var user = JSON.parse(data)[0]

    this.myName = user.fullname;

    this.contactForm = this.formBuilder.group({
      name: ['', Validators.required],
      invitemessage: ['Xin chao bạn, mình là ' + this.myName + ' rất vui khi được làm quen với bạn.']
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
    },
    error => {
      console.error(error);
    });
    
    const sorted = contacts.sort((a, b) => a.name > b.name ? 1 : -1);
    

    const grouped = sorted.reduce((groups, contact) => {
      const letter = this.translate.instant(contact.name).charAt(0);
      groups[letter] = groups[letter] || [];
      groups[letter].push(contact);

      return groups;
    }, {});

    // contacts list
    this.contactsList = Object.keys(grouped).map(key => ({ key, contacts: grouped[key] }));
  }


  /**
   * Contacts modal open
   * @param content content
   */
  // tslint:disable-next-line: typedef
  openContactsModal(content) {
    this.modalService.open(content, { centered: true });
  }

  onSubmit(){
    var name = this.searchText
    this.authFackservice.FindUserbyUsername(name)
      .pipe(takeUntil(this.destroy$)).subscribe(data => {
        if(data['user'] === null)
          return this.error = 'Người dùng không tồn tại'
        else{
        //send
        this.authFackservice.SendFriendRequest(this.myName, name)
          .pipe(takeUntil(this.destroy$)).subscribe(data => {
            console.log(data);  
          })
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
