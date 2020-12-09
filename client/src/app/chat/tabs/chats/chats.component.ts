import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

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

  constructor(public translate: TranslateService) { }

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    dots: false,
    margin: 16,
    navSpeed: 700,
    items: 4,
    nav: false
  };

  ngOnInit(): void {

    this.chat = chat;
  }

  /**
   * Show user chat
   */
  // tslint:disable-next-line: typedef
  showChat() {
    document.getElementById('chat-room').classList.add('user-chat-show');
  }
}
