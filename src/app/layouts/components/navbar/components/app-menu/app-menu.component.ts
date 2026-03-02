import {Component, TemplateRef, ViewChild, OnInit} from '@angular/core';
import {MenuItemType} from '@/app/types/layout';
import {CommonModule} from '@angular/common';
import {NgIcon} from '@ng-icons/core';
import {NgbDropdown, NgbDropdownMenu, NgbDropdownToggle} from '@ng-bootstrap/ng-bootstrap';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {filter} from 'rxjs';
import {MenuPermissionService} from '@/app/services/menu-permission.service';
import { menuItems} from '@layouts/components/data';

@Component({
    selector: 'app-menu-navbar',
    imports: [
        CommonModule,
        NgIcon,
        NgbDropdown,
        NgbDropdownToggle,
        RouterLink,
        NgbDropdownMenu
    ],
    templateUrl: './app-menu.component.html'
})
export class AppMenuComponent implements OnInit {

    constructor(
        public router: Router,
        private menuPermissionService: MenuPermissionService
    ) {
    }

    @ViewChild('MenuItemWithChildren', {static: true})
    menuItemWithChildren!: TemplateRef<{ item: MenuItemType, wrapperClass?: string, togglerClass?: string }>;

    @ViewChild('MenuItem', {static: true})
    menuItem!: TemplateRef<{ item: MenuItemType, linkClass?: string }>;

    menuItems: MenuItemType[] = [];

    ngOnInit() {
        this.loadMenuItems();
    }

    loadMenuItems() {
        // Get filtered menu items based on user permissions
        this.menuItems = this.menuPermissionService.getFilteredMenuItems();
        console.log('Filtered Menu Items:', this.menuItems);
    }

    hasSubMenu(item: MenuItemType): boolean {
        return !!item.children;
    }

    isChildActive(item: MenuItemType): boolean {
        if (item.url && this.router.url === item.url) return true;
        if (!item.children) return false;
        return item.children.some((child: any) => this.isChildActive(child));
    }

    isActive(item: MenuItemType): boolean {
        return item.url === this.router.url;
    }
}
