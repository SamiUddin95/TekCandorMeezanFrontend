import {Component} from '@angular/core';
import {NgbDropdown, NgbDropdownMenu, NgbDropdownToggle} from "@ng-bootstrap/ng-bootstrap";
import {userDropdownItems} from '@layouts/components/data';
import {RouterLink} from '@angular/router';
import {NgIcon} from '@ng-icons/core';
import {AuthService} from '../../../../../services/auth.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-user-profile-topbar',
  imports: [
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownToggle,
    RouterLink,
    NgIcon,
    CommonModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  menuItems = userDropdownItems;

  constructor(private authService: AuthService) {}

  handleItemClick(item: any) {
    if (item.action === 'logout') {
      this.logout();
    }
  }

  logout() {
    this.authService.logout();
  }
}
