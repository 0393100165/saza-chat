import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-detail',
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.scss']
})

/**
 * Profile-detail component
 */
export class ProfileDetailComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Hide user profile
   */
  // tslint:disable-next-line: typedef
  hideUserProfile() {
    document.getElementById('profile-detail').style.display = 'none';
  }
}
