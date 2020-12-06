import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
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

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private authFackservice: AuthfakeauthenticationService, private authService: AuthenticationService,
    private router: Router, public translate: TranslateService) { 
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
    console.log('addUser()');
  }

  infoUser(id){

  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
