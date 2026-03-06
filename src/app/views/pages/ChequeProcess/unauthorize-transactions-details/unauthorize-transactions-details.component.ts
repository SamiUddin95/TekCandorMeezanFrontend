import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UnauthorizeTransactionsService } from '../../../../services/unauthorize-transactions.service';
import {
  tablerArrowLeft,
  tablerFileText,
  tablerDownload,
  tablerPrinter,
  tablerCheck,
  tablerUser,
  tablerX
} from '@ng-icons/tabler-icons';

@Component({
  selector: 'app-unauthorize-transactions-details',
  templateUrl: './unauthorize-transactions-details.component.html',
  styleUrls: ['./unauthorize-transactions-details.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  providers: [provideIcons({ tablerArrowLeft, tablerFileText, tablerDownload, tablerPrinter, tablerCheck, tablerUser, tablerX }), DatePipe]
})
export class UnauthorizeTransactionsDetailsComponent implements OnInit {

  transactionId: number = 0;
  transactionDetails: any = null;
  isLoading: boolean = false;
  selectedActionReason: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private unauthorizeTransactionsService: UnauthorizeTransactionsService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.transactionId = +params['id'];
      if (this.transactionId) {
        this.loadTransactionDetails();
      }
    });
  }

  loadTransactionDetails(): void {
    this.isLoading = true;
    
    // Hardcoded data for now - will be replaced with real API later
    const mockData = {
      id: this.transactionId,
      chequeNumber: '02066693',
      accountNumber: '0099340204346125',
      amount: 130560,
      status: 'Unauthorized',
      accountTitle: 'John Doe',
      accountBalance: '.00',
      postingRestriction: 'No Restriction',
      senderBankCode: 'HABIB METROPOLITAN BANK LTD.',
      receiverBranchCode: '0005',
      hubCode: 'KARACHI-10',
      cycleCode: 'Normal',
      instrumentNo: 'Pay order',
      transactionCode: '020',
      date: '2026-03-06T00:00:00',
      accountStatus: 'Normal',
      currency: null,
      branchStatus: 'Active',
      cbcStatus: 'Pending',
      error: true,
      export: true,
      frontImage: 'assets/images/cheque-front.jpg',
      backImage: 'assets/images/cheque-back.jpg',
      signatureImage: 'assets/images/signature.jpg'
    };
    
    setTimeout(() => {
      this.transactionDetails = mockData;
      this.isLoading = false;
    }, 1000);
  }

  goBack(): void {
    this.router.navigate(['/pages/ChequeProcess/unauthorize-transactions']);
  }

  authorizeTransaction(): void {
    // Authorize transaction functionality
    console.log('Authorizing transaction:', this.transactionId);
    if (this.selectedActionReason) {
      // Process authorization
      alert('Transaction authorized successfully!');
    } else {
      alert('Please select a reason for authorization.');
    }
  }

  getAccountDetails(): void {
    // Get account details functionality
    console.log('Getting account details for:', this.transactionDetails?.accountNumber);
  }

  rejectTransaction(): void {
    // Reject transaction functionality
    console.log('Rejecting transaction:', this.transactionId);
    if (confirm('Are you sure you want to reject this transaction?')) {
      alert('Transaction rejected successfully!');
    }
  }

  onImageError(event: any): void {
    // Handle image loading errors
    event.target.src = 'assets/images/placeholder.png';
  }

  // Validation methods
  validateChequeNumber(): void {
    if (this.transactionDetails?.chequeNumber && this.transactionDetails.chequeNumber.length !== 8) {
      // Show validation error
    }
  }

  validateAccountNumber(): void {
    if (this.transactionDetails?.accountNumber && this.transactionDetails.accountNumber.length !== 16) {
      // Show validation error
    }
  }
}
