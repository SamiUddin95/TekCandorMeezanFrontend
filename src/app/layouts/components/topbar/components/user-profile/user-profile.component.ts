import {Component, OnInit} from '@angular/core';
import {NgbDropdown, NgbDropdownMenu, NgbDropdownToggle} from "@ng-bootstrap/ng-bootstrap";
import {userDropdownItems} from '@layouts/components/data';
import {RouterLink} from '@angular/router';
import {NgIcon} from '@ng-icons/core';
import {AuthService, User} from '../../../../../services/auth.service';
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
export class UserProfileComponent implements OnInit {
  menuItems = userDropdownItems;
  currentUser: User | null = null;
  displayName: string = 'Administrator';
  initials: string = 'AD';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUserData();
  }

  private loadUserData() {
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser && this.currentUser.name) {
      this.displayName = this.currentUser.name;
      this.initials = this.getInitials(this.currentUser.name);
    } else { 
      this.displayName = 'Administrator';
      this.initials = 'AD';
    }
  }

  private getInitials(name: string): string {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1 && words[0].length >= 2) {
      return words[0].substring(0, 2).toUpperCase();
    } else if (words.length === 1) {
      return words[0][0].toUpperCase() + 'D';
    }
    return 'AD';
  }

  handleItemClick(item: any) {
    if (item.action === 'logout') {
      this.logout();
    }
  }

  logout() {
    this.authService.logout();
  }
}
