import {Component, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MenuItemType} from '@/app/types/layout';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgIcon} from '@ng-icons/core';
import {NgbCollapse} from '@ng-bootstrap/ng-bootstrap';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {filter} from 'rxjs';
import {scrollToElement} from '@/app/utils/layout-utils';
import {menuItems} from '@layouts/components/data';
import {LayoutStoreService} from '@core/services/layout-store.service';
import {MenuPermissionService} from '@/app/services/menu-permission.service';
import { StartBusinessDayService } from '../../../../../views/pages/outward-clearing/services/start-business-day.service';

@Component({
    selector: 'app-menu',
    imports: [NgIcon, NgbCollapse, RouterLink, CommonModule, FormsModule],
    templateUrl: './app-menu.component.html',
    styleUrls: ['./app-menu.component.scss']
})
export class AppMenuComponent implements OnInit {

    router = inject(Router)
    layout = inject(LayoutStoreService)
    menuPermissionService = inject(MenuPermissionService)
    startBusinessDayService = inject(StartBusinessDayService)

    @ViewChild('MenuItemWithChildren', {static: true})
    menuItemWithChildren!: TemplateRef<{ item: MenuItemType }>;

    @ViewChild('MenuItem', {static: true})
    menuItem!: TemplateRef<{ item: MenuItemType }>;

    menuItems: MenuItemType[] = [];
    
    // Search properties
    searchQuery: string = '';
    filteredItems: any[] = [];
    displayItems: MenuItemType[] = [];
    isBusinessDayStarted: boolean | null = null;

    ngOnInit(): void {
        // Load filtered menu items based on user permissions
        this.loadMenuItems();
        this.startBusinessDayService.businessDayStarted$.subscribe((started) => {
            this.isBusinessDayStarted = started;
            this.applyBusinessDayLock();
        });
        this.startBusinessDayService.syncBusinessDayStatus();

        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                this.expandActivePaths(this.menuItems);
                setTimeout(() => this.scrollToActiveLink(), 50);
            });

        this.expandActivePaths(this.menuItems);
        setTimeout(() => this.scrollToActiveLink(), 100);
    }

    loadMenuItems() {
        // Get filtered menu items based on user permissions
        this.menuItems = this.menuPermissionService.getFilteredMenuItems();
        this.applyBusinessDayLock();
        this.displayItems = [...this.menuItems];
        console.log('Sidebar Menu Items (Filtered):', this.menuItems);
    }

    private applyBusinessDayLock(): void {
        this.applyLockToItems(this.menuItems);
        this.displayItems = [...this.menuItems];
    }

    private applyLockToItems(items: MenuItemType[], isOutwardLocked = false): void {
        for (const item of items) {
            const isOutwardClearingRoot = item.label === 'Outward Clearing';
            const isStartBusinessDay = item.label === 'Start Business Day';

            const shouldLockOutwardChildren = isOutwardLocked || (isOutwardClearingRoot && this.isBusinessDayStarted === false);
            const isLocked = shouldLockOutwardChildren && !isOutwardClearingRoot && !isStartBusinessDay;

            item.isDisabled = isLocked;

            if (item.children && item.children.length > 0) {
                this.applyLockToItems(item.children, shouldLockOutwardChildren && !isStartBusinessDay);
            }

            if (isLocked) {
                item.isCollapsed = true;
            }
        }
    }

    hasSubMenu(item: MenuItemType): boolean {
        return !!item.children;
    }

    toggleMenuItem(item: MenuItemType): void {
        if (item.isDisabled) {
            return;
        }
        item.isCollapsed = !item.isCollapsed;
    }

    onMenuItemClick(event: Event, item: MenuItemType): void {
        if (!item.isDisabled) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
    }

    expandActivePaths(items: MenuItemType[]) {
        for (const item of items) {
            if (this.hasSubMenu(item)) {
                item.isCollapsed = !this.isChildActive(item);
                this.expandActivePaths(item.children || []);
            }
        }
    }

    isChildActive(item: MenuItemType): boolean {
        if (item.url && this.router.url === item.url) return true;
        if (!item.children) return false;
        return item.children.some((child: MenuItemType) => this.isChildActive(child));
    }

    isActive(item: MenuItemType): boolean {
        return item.url === this.router.url;
    }

    scrollToActiveLink(): void {
        const activeItem = document.querySelector('[data-active-link="true"]') as HTMLElement;
        const scrollContainer = document.querySelector("#sidenav .simplebar-content-wrapper") as HTMLElement;

        if (activeItem && scrollContainer) {
            const containerRect = scrollContainer.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();

            const offset = itemRect.top - containerRect.top - window.innerHeight * 0.4;

            scrollToElement(scrollContainer, scrollContainer.scrollTop + offset, 500);
        }
    }

    // Search methods
    filterMenu(): void {
        const query = this.searchQuery.toLowerCase().trim();
        
        if (!query) {
            this.displayItems = [...this.menuItems];
            this.filteredItems = [];
            return;
        }

        this.filteredItems = [];
        this.searchInMenuItems(this.menuItems, query, '');
        
        // Filter display items to show only matching items
        if (query) {
            this.displayItems = this.menuItems.filter(item => 
                this.itemMatches(item, query)
            );
        } else {
            this.displayItems = [...this.menuItems];
        }
    }

    searchInMenuItems(items: MenuItemType[], query: string, parentLabel: string): void {
        items.forEach(item => {
            if (!item.isTitle && item.label) {
                const itemLabel = item.label.toLowerCase();
                if (itemLabel.includes(query)) {
                    this.filteredItems.push({
                        ...item,
                        parentLabel: parentLabel || null
                    });
                }
                
                // Search in children
                if (item.children && item.children.length > 0) {
                    this.searchInMenuItems(item.children, query, item.label);
                }
            }
        });
    }

    itemMatches(item: MenuItemType, query: string): boolean {
        if (item.isTitle) return false;
        
        const label = item.label?.toLowerCase() || '';
        if (label.includes(query)) return true;
        
        if (item.children && item.children.length > 0) {
            return item.children.some(child => this.itemMatches(child, query));
        }
        
        return false;
    }

    clearSearch(): void {
        this.searchQuery = '';
        this.filteredItems = [];
        this.displayItems = [...this.menuItems];
    }

    navigateToItem(item: any): void {
        if (item.url && !item.isDisabled) {
            this.router.navigate([item.url]);
            this.clearSearch();
        }
    }

    navigateToFirstMatch(): void {
        if (this.filteredItems.length > 0) {
            this.navigateToItem(this.filteredItems[0]);
        }
    }

}
