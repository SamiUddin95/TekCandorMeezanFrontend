import {Component, OnInit} from '@angular/core';
import {NgbDropdown, NgbDropdownMenu} from "@ng-bootstrap/ng-bootstrap";
import {userDropdownItems} from '@layouts/components/data';
import {NgIcon} from '@ng-icons/core';
import {AuthService, User} from '../../../../../services/auth.service';
import {CommonModule} from '@angular/common';
import { ThemeTogglerComponent } from '../theme-toggler/theme-toggler.component';

@Component({
  selector: 'app-user-profile-topbar',
  imports: [
    NgbDropdown,
    NgbDropdownMenu,
    NgIcon,
    CommonModule,
    ThemeTogglerComponent
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  menuItems = userDropdownItems;
  currentUser: User | null = null;
  displayName: string = 'Administrator';
  initials: string = 'AD';
  branchOrHub: string = '';
  hubNames: string[] = [];

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

    this.branchOrHub = this.authService.getBranchOrHub();
    this.hubNames = this.authService.getHubNames();
  }

  get scopeLabel(): string {
    if (this.branchOrHub === 'HubWise') return 'Hub Wise';
    if (this.branchOrHub === 'BranchWise') return 'Branch Wise';
    return this.branchOrHub;
  }

  get isHubWise(): boolean {
    return this.branchOrHub === 'HubWise';
  }

  get scopeNamesDisplay(): string {
    if (this.hubNames.length === 0) return 'No assignment';
    if (this.hubNames.length <= 2) return this.hubNames.join(', ');
    return `${this.hubNames.slice(0, 2).join(', ')} +${this.hubNames.length - 2}`;
  }

  get scopeNamesTooltip(): string {
    return this.hubNames.join(', ');
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
