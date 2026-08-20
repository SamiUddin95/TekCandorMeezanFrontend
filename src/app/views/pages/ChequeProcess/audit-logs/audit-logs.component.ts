import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';

export interface AuditLog {
  id: number;
  who: string;
  what: string;
  when: string;
  ipAddress: string;
  module: string;
  actionType: string;
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.scss']
})
export class AuditLogsComponent {
  auditLogs: AuditLog[] = [
    {
      id: 1,
      who: 'admin@meezanbank.com',
      what: 'User login successful',
      when: '2024-08-13 09:15:23',
      ipAddress: '192.168.1.100',
      module: 'Security',
      actionType: 'Login'
    },
    {
      id: 2,
      who: 'operator1@meezanbank.com',
      what: 'File upload - batch_20240813_001.csv',
      when: '2024-08-13 09:30:45',
      ipAddress: '192.168.1.105',
      module: 'Cheque Process',
      actionType: 'File Upload'
    },
    {
      id: 3,
      who: 'supervisor@meezanbank.com',
      what: 'Authorized cheque #1234567890',
      when: '2024-08-13 10:15:12',
      ipAddress: '192.168.1.110',
      module: 'Cheque Process',
      actionType: 'Authorization'
    },
    {
      id: 4,
      who: 'admin@meezanbank.com',
      what: 'Manual intervention - cheque #0987654321',
      when: '2024-08-13 10:45:33',
      ipAddress: '192.168.1.100',
      module: 'Cheque Process',
      actionType: 'Manual Intervention'
    },
    {
      id: 5,
      who: 'operator2@meezanbank.com',
      what: 'Deleted transaction #TXN-2024-001234',
      when: '2024-08-13 11:20:15',
      ipAddress: '192.168.1.115',
      module: 'Cheque Process',
      actionType: 'Deletion'
    },
    {
      id: 6,
      who: 'supervisor@meezanbank.com',
      what: 'Cancelled cheque #5555555555',
      when: '2024-08-13 11:45:00',
      ipAddress: '192.168.1.110',
      module: 'Cheque Process',
      actionType: 'Cancellation'
    },
    {
      id: 7,
      who: 'admin@meezanbank.com',
      what: 'Reversed transaction #TXN-2024-001235',
      when: '2024-08-13 12:10:45',
      ipAddress: '192.168.1.100',
      module: 'Cheque Process',
      actionType: 'Reversal'
    },
    {
      id: 8,
      who: 'operator1@meezanbank.com',
      what: 'Imported manual cheque - amount PKR 50,000',
      when: '2024-08-13 13:30:22',
      ipAddress: '192.168.1.105',
      module: 'Cheque Process',
      actionType: 'Manual Import'
    },
    {
      id: 9,
      who: 'supervisor@meezanbank.com',
      what: 'Rejected cheque #7777777777 - insufficient funds',
      when: '2024-08-13 14:15:33',
      ipAddress: '192.168.1.110',
      module: 'Cheque Process',
      actionType: 'Rejection'
    },
    {
      id: 10,
      who: 'admin@meezanbank.com',
      what: 'User logout',
      when: '2024-08-13 15:00:00',
      ipAddress: '192.168.1.100',
      module: 'Security',
      actionType: 'Logout'
    }
  ];

  filteredLogs: AuditLog[] = [...this.auditLogs];
  searchTerm: string = '';
  selectedModule: string = 'All';
  selectedActionType: string = 'All';

  modules: string[] = ['All', 'Security', 'Cheque Process'];
  actionTypes: string[] = ['All', 'Login', 'Logout', 'File Upload', 'Authorization', 'Manual Intervention', 'Deletion', 'Cancellation', 'Reversal', 'Manual Import', 'Rejection'];

  filterLogs(): void {
    this.filteredLogs = this.auditLogs.filter(log => {
      const matchesSearch = this.searchTerm === '' || 
        log.who.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        log.what.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        log.ipAddress.includes(this.searchTerm);
      
      const matchesModule = this.selectedModule === 'All' || log.module === this.selectedModule;
      const matchesAction = this.selectedActionType === 'All' || log.actionType === this.selectedActionType;

      return matchesSearch && matchesModule && matchesAction;
    });
  }

  getActionTypeBadgeClass(actionType: string): string {
    switch (actionType) {
      case 'Login':
        return 'badge-success';
      case 'Logout':
        return 'badge-secondary';
      case 'File Upload':
        return 'badge-info';
      case 'Authorization':
        return 'badge-primary';
      case 'Manual Intervention':
        return 'badge-warning';
      case 'Deletion':
        return 'badge-danger';
      case 'Cancellation':
        return 'badge-danger';
      case 'Reversal':
        return 'badge-warning';
      case 'Manual Import':
        return 'badge-info';
      case 'Rejection':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  onSearchChange(): void {
    this.filterLogs();
  }

  onModuleChange(): void {
    this.filterLogs();
  }

  onActionTypeChange(): void {
    this.filterLogs();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedModule = 'All';
    this.selectedActionType = 'All';
    this.filterLogs();
  }
}
