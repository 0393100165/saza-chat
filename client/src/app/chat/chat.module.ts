import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule, NgbDropdownModule, NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { TabsModule } from './tabs/tabs.module';

import { ChatRoutingModule } from './chat-routing.module';

import { IndexComponent } from './index/index.component';
import { ProfileDetailComponent } from './profile-detail/profile-detail.component';
import { TranslateModule } from '@ngx-translate/core';

import {MatTableModule} from '@angular/material/table';
import { MDBBootstrapModule } from 'angular-bootstrap-md';


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
    TranslateModule,
    MDBBootstrapModule.forRoot(),
    MatTableModule,
    FormsModule
  ],
  exports: [ProfileDetailComponent]
})
export class ChatModule { }
