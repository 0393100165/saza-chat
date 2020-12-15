import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { groups } from '../groups/data';
import { Groups } from '../groups/groups.model';

import { chat } from './data';
import { Chats } from './chats.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
/**
 * Tab-chat component
 */
export class ChatsComponent implements OnInit {

  chat: Chats[];
  groupForm: FormGroup;

  constructor(public translate: TranslateService, private modalService: NgbModal, private formBuilder: FormBuilder) { }

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    dots: false,
    margin: 16,
    navSpeed: 700,
    items: 4,
    nav: false
  };

  public isCollapsed: boolean;
  groups: Groups[];

  ngOnInit(): void {
    this.groups = groups;
    this.groupForm = this.formBuilder.group({
      
    })
    // collpsed value
    this.isCollapsed = true;

    this.chat = chat;
  }

  openGroupModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  /**
   * Show user chat
   */
  // tslint:disable-next-line: typedef
  showChat() {
    document.getElementById('chat-room').classList.add('user-chat-show');
  }
}
