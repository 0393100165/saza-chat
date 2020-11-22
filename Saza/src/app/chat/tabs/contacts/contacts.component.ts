import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { contacts } from './data';
import { Contacts } from './contacts.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
/**
 * Tab-contacts component
 */
export class ContactsComponent implements OnInit {

  contacts: Contacts[];
  contactsList: any;

  constructor(private modalService: NgbModal, public translate: TranslateService) { }

  ngOnInit(): void {
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
}
