import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { groups } from './data';
import { Groups } from './groups.model';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})

/**
 * Tabs-group component
 */
export class GroupsComponent implements OnInit {

  public isCollapsed: boolean;
  groups: Groups[];

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
    this.groups = groups;

    // collpsed value
    this.isCollapsed = true;
  }

  /**
   * Open add group modal
   * @param content content
   */
  // tslint:disable-next-line: typedef
  openGroupModal(content: any) {
    this.modalService.open(content, { centered: true });
  }
}
