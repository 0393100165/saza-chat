import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule, NgbDropdownModule, NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { TabsModule } from './tabs/tabs.module';

import { ChatRoutingModule } from './chat-routing.module';

import { IndexComponent } from './index/index.component';
import { ProfileDetailComponent } from './profile-detail/profile-detail.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [IndexComponent, ProfileDetailComponent],
  imports: [
    PerfectScrollbarModule,
    NgbAccordionModule,
    CommonModule,
    ChatRoutingModule,
    TabsModule,
    NgbTooltipModule,
    NgbDropdownModule,
    TranslateModule
  ],
  exports: [ProfileDetailComponent]
})
export class ChatModule { }
