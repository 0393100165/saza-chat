import { AfterViewInit, Component, HostListener, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Messages } from './data';
import { Message } from './chat.model';

import { AuthenticationService } from '../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../core/services/authfake.service';

import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import {SocketioService} from '../index/socketio.service';

export interface UserData {
  id: number
  username: string
  fullname: string
  nickname: string
  isAdministrator: number
  status: string
  sex: string
  email: string
  phone: string
  address: string
  birthday: string
  status_message: string
  url_avatar:string
}

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})

/**
 * Chat-component
 */
export class IndexComponent implements OnInit, AfterViewInit, OnDestroy {
  
  displayedColumns: string[] = ['id', 'username', 'fullname', 'nickname', 'isAdministrator', 'status',
   'sex', 'email', 'phone', 'address', 'birthday', 'status_message', 'url_avatar', 'star'];
  dataSource: MatTableDataSource<UserData>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
 
  activetab = 2;
  Messages: Message[];
  url_avatar = '';
  isAdmin: boolean = false;
  showprofile: boolean = false;

  userForm: FormGroup;
  submitted = false;
  
  error = ''
  

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private authFackservice: AuthfakeauthenticationService, private authService: AuthenticationService,
    private router: Router, public translate: TranslateService, private formBuilder: FormBuilder,
    private modalService: NgbModal, private socketService : SocketioService) { 
    this.authFackservice.getAll().pipe(takeUntil(this.destroy$)).subscribe(
      data => {
        // Assign the data to the data source for the table to render
        this.dataSource = new MatTableDataSource(data['user']);

        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error => {
        console.error(error);
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ngOnInit(): void {
    var user = JSON.parse(localStorage.getItem('currentUser'))[0]

    this.Messages = Messages;
    this.url_avatar = user.url_avatar;
    this.isAdmin = user.isAdministrator === 1 ? true : false
    if(this.isAdmin){
      this.activetab = 1
    }

    //from them khach hang
    this.userForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      fullname: ['', Validators.required],
      birthday: ['', Validators.required],
      admin: [false],
    });

    this.socketService.listenMessage('XXX').pipe(takeUntil(this.destroy$)).subscribe((data) => {
      console.log(data);
    })
  }

  get f() { return this.userForm.controls; }

  openContactsModal(content) {
    this.modalService.open(content, { centered: true });
  }

  /**
   * Show user profile
   */
  // tslint:disable-next-line: typedef
  showUserProfile() {
    document.getElementById('profile-detail').style.display = 'block';
  }

  /**
   * Close user chat
   */
  // tslint:disable-next-line: typedef
  closeUserChat() {
    document.getElementById('chat-room').classList.remove('user-chat-show');
  }

  /**
   * Logout the user
   */
  logout() {
    this.authFackservice.logout();
    this.router.navigate(['/account/login']);
  }

  SendMessage(value: string){
    console.log(value);
  }

  lockUser(id){
    this.authFackservice.lockUser(id).pipe(takeUntil(this.destroy$)).subscribe(
      data => {
       if(data){
        this.authFackservice.getAll().pipe(takeUntil(this.destroy$)).subscribe(
          data => {
            // Assign the data to the data source for the table to render
            this.dataSource = new MatTableDataSource(data['user']);
    
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          },
          error => {
            console.error(error);
          });
       }
      },
      error => {
        console.error(error);
      });
  }

  unlockUser(id){
    this.authFackservice.unlockUser(id).pipe(takeUntil(this.destroy$)).subscribe(
      data => {
       if(data){
        this.authFackservice.getAll().pipe(takeUntil(this.destroy$)).subscribe(
          data => {
            // Assign the data to the data source for the table to render
            this.dataSource = new MatTableDataSource(data['user']);
    
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          },
          error => {
            console.error(error);
          });
       }
      },
      error => {
        console.error(error);
      });
  }

  addUser(){
    this.submitted = true;
    console.log(this.f.username.value);
    
    if (this.userForm.invalid)
      return;

    var username = this.f.username.value
    var password = this.f.password.value
    var fullname = this.f.fullname.value
    var birthday = this.f.birthday.value
    var email = ' '
    var phone = ' '

    if(!this.f.admin.value) {
      /***********Kiểm tra username có hợp lệ */
      if(!isNaN(username)){
        const re = /[0-9]{9,11}$/ //Kiểm tra sô đt
        if(re.test(String(username))){
          //Username là số dt
          phone = username
        }
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
    }
    //Username đã có
    this.authFackservice.FindUserbyUsername(username)
      .pipe(takeUntil(this.destroy$)).subscribe(data => {
        if(data != null)
          return this.error = 'Tên người dùng đã tồn tại'
      })

    //Người dùng nhập năm lớn hơn năm hiện tại
    if(((new Date().getTime() -  new Date(birthday).getTime())/31556952000) < 0)
      return this.error = 'Ngày sinh phải bé hơn ngày hiện tại'
    
    this.authFackservice.register(username, password,
      this.f.admin.value ? 1 : 0, fullname, email, phone, birthday)
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
