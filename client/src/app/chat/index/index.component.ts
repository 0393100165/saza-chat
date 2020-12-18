import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Messages } from './data';
import { Message } from './chat.model';

import { AuthenticationService } from '../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../core/services/authfake.service';

import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { SocketioService } from '../index/socketio.service';

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
  url_avatar: string
}

export interface UserRecived {
  id?: number
  fullname?: string
  url_avatar?: string
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

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  activetab = 2;
  Messages: Message[];
  member = []
  url_avatar = '';
  user
  userRecived: UserRecived = null
  isAdmin: boolean = false;
  showprofile: boolean = false;
  friendRequest: any = []
  userForm: FormGroup;
  submitted = false;
  checkAdmin = false;
  idRoom
  
  notificationFr:number = 0
  notificationChat:number = 0

  success = ''
  error = ''


  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private authFackservice: AuthfakeauthenticationService, private authService: AuthenticationService,
    private router: Router, public translate: TranslateService, private formBuilder: FormBuilder,
    private modalService: NgbModal, private socketService: SocketioService) {
    this.authFackservice.getAll().pipe(takeUntil(this.destroy$)).subscribe(
      data => {
        // Assign the data to the data source for the table to render
        this.dataSource = new MatTableDataSource(data['user']);
        this.dataSource.sort = this.sort;
      },
      error => {
        console.error(error);
      });
  }

  ngAfterViewInit() {
    
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit(): void {
    var user = JSON.parse(localStorage.getItem('currentUser'))[0]

    this.Messages = Messages;
    this.url_avatar = user.url_avatar;
    this.user = user
    this.isAdmin = user.isAdministrator === 1 ? true : false
    if (this.isAdmin) {
      this.activetab = 3
    }

    //from them khach hang
    this.userForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      fullname: ['', Validators.required],
      birthday: ['', Validators.required],
    });
  
    this.socketService.listenMessage('Server-Send-Message').pipe(takeUntil(this.destroy$)).subscribe((data) => {
      console.log(data);
      
      var socketID = data[2];
      if (socketID != this.socketService.getIdSocket()) {
        if (data[1]) {
          const index =  this.member.indexOf(data[0])
          var name =  this.member[Number(index+1)]
          var profile =  this.member[Number(index+2)]
          var time = this.getTime(new Date())
          this.Messages.push({
            name: name, message: data[1], align: 'left',
            profile: profile, time: time
          })
        }
      }
    })

    this.authFackservice.getReceiveFriendRequest(user.username).pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.friendRequest = data
      this.notificationFr = this.friendRequest.length
    })

    this.socketService.listenFriendReq().pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data === this.user.username)
        this.authFackservice.getReceiveFriendRequest(user.username).pipe(takeUntil(this.destroy$)).subscribe((data) => {
          this.friendRequest = data
          this.notificationFr = this.friendRequest.length
        })
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
    // document.getElementById('profile-detail').style.display = 'block';
  }

  /**
   * Close user chat
   */
  // tslint:disable-next-line: typedef
  closeUserChat() {
    document.getElementById('chat-room').classList.remove('user-chat-show');
  }

  receiveMessage($event) {
    var info = $event
    
    this.idRoom = info['idRoom']    
    if(this.idRoom){
      this.socketService.joinRoom(this.idRoom);
      this.Messages = []
      this.member = []
      //get info
      if(!info['group']){
        this.userRecived = {id: info['id'], fullname: info['name'], url_avatar: info['profilePicture']}
        this.member.push(info['id'], info['name'], info['profilePicture'])
      } else {
        this.userRecived = {fullname: info['name']}
        this.member = info['member']
      }
      //Show chat
      this.authFackservice.getChats(this.idRoom).pipe(takeUntil(this.destroy$)).subscribe((data) => {       
        var name
        var message
        var align
        var profile
        var time
        if(data)
        for(var e in data) {          
          switch (Number(e) % 3) {
            case 0:
              if (data[e] === this.user.id) {
                name = this.user.fullname
                profile = this.user.url_avatar
                align = 'right'
              } else {
                const index =  this.member.indexOf(data[e])
                name =  this.member[Number(index+1)]
                profile =  this.member[Number(index+2)]
                align = 'left'
              }
              break
            case 1:
              message = data[e]
              break
            case 2:
              time = data[e]
              this.Messages.push({ name, message, align, profile, time})                
              break
          }
        }
      })
    }
  }

  /**
   * Logout the user
   */
  logout() {
    this.authFackservice.logout();
    this.router.navigate(['/account/login']);
  }

  sendMessage(value: string) {
    if (value) {
      var time = this.getTime(new Date())
      this.Messages.push({
        name: this.user.fullname, message: value, align: 'right',
        profile: this.url_avatar, time: time
      })
      //Gui _ Nhan
      this.socketService.SendMessage(this.idRoom, this.user.id, value);
      
    }
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) {console.log(err);}                 
  }

  addZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }

  getTime(date) {
    var d = date
    var h = this.addZero(d.getHours());
    var m = this.addZero(d.getMinutes());
    return h + ":" + m;
  }

  lockUser(id) {
    this.authFackservice.lockUser(id).pipe(takeUntil(this.destroy$)).subscribe(
      data => {
        if (data) {
          this.authFackservice.getAll().pipe(takeUntil(this.destroy$)).subscribe(
            data => {
              // Assign the data to the data source for the table to render
              this.dataSource = new MatTableDataSource(data['user']);
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

  unlockUser(id) {
    this.authFackservice.unlockUser(id).pipe(takeUntil(this.destroy$)).subscribe(
      data => {
        if (data) {
          this.authFackservice.getAll().pipe(takeUntil(this.destroy$)).subscribe(
            data => {
              // Assign the data to the data source for the table to render
              this.dataSource = new MatTableDataSource(data['user']);
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

  addUser() {
    this.submitted = true;
    if (this.userForm.invalid)
      return;
    //Người dùng nhập năm lớn hơn năm hiện tại
    if (((new Date().getTime() - new Date(birthday).getTime()) / 31556952000) < 0)
      return this.error = 'Ngày sinh phải bé hơn ngày hiện tại'

    var username = this.f.username.value
    var password = this.f.password.value
    var fullname = this.f.fullname.value
    var birthday = this.f.birthday.value
    var email = ' '
    var phone = ' '

    if (!this.checkAdmin) {
      /***********Kiểm tra username có hợp lệ */
      if (!isNaN(username)) {
        const re = /[0-9]{9,11}$/ //Kiểm tra sô đt
        if (re.test(String(username))) {
          //Username là số dt
          phone = username
        }
        else return this.error = 'Tên người dùng không hợp lệ'
      } else {
        //Check Email
        const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        username = username.toLowerCase()
        if (re.test(String(username)))
          //username là Email
          email = username
        else return this.error = 'Tên người dùng không hợp lệ'
      }
    }
    //Username đã có
    this.authFackservice.findUserbyUsername(username)
      .pipe(takeUntil(this.destroy$)).subscribe(data => {
        if (data['user'] != null)
          return this.error = 'Tên người dùng đã tồn tại'
        else{
          this.authFackservice.saveUser(username, password,
            this.checkAdmin ? 1 : 0, fullname, email, phone, birthday)
            .pipe(takeUntil(this.destroy$)).subscribe(data => {},
            error => {this.error = error ? error : '';});
            this.success = 'Thêm tài khoản thành công'
            this.submitted = false
            this.userForm.reset()
            this.checkAdmin = false
            this.authFackservice.getAll().pipe(takeUntil(this.destroy$)).subscribe(
              data => {
                // Assign the data to the data source for the table to render
                this.dataSource = new MatTableDataSource(data['user']);
                this.dataSource.sort = this.sort;
            },
            error => {this.error = error ? error : '';});
        }
    })
  }

  checkBoxAdmin(){
    this.checkAdmin = !this.checkAdmin
  }

  addFriend(id) {
    this.socketService.acceptFriend(id, this.user.username)
    this.removeFriendRequest(id)
  }

  refuse(id) {
    this.authFackservice.refuseFriendRequest(id, this.user.username).pipe(takeUntil(this.destroy$)).subscribe(data =>{})
    this.removeFriendRequest(id)
  }

  removeFriendRequest(id) {
    for (var i = 0; i < this.friendRequest.length; i++) {
      var obj = this.friendRequest[i];
  
      if (obj.id === id) {
        this.friendRequest.splice(i, 1);
      }
    }
    this.notificationFr--
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
