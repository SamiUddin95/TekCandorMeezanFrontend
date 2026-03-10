import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SystemRejectedChequesService } from '../../../../services/system-rejected-cheques.service';
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
  selector: 'app-system-rejected-cheques-details',
  templateUrl: './system-rejected-cheques-details.component.html',
  styleUrls: ['./system-rejected-cheques-details.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  providers: [provideIcons({ tablerArrowLeft, tablerFileText, tablerDownload, tablerPrinter, tablerCheck, tablerUser, tablerX }), DatePipe]
})
export class SystemRejectedChequesDetailsComponent implements OnInit {

  chequeId: number = 0;
  chequeDetails: any = null;
  isLoading: boolean = false;
  selectedActionReason: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private systemRejectedChequesService: SystemRejectedChequesService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.chequeId = +params['id'];
      if (this.chequeId) {
        this.loadChequeDetails();
      }
    });
  }

  loadChequeDetails(): void {
    this.isLoading = true;
    
    // Hardcoded data matching real API response
    const mockData = {
      id: this.chequeId,
      chequeNumber: '22741383',
      accountNumber: '0099340204346125',
      transactionCode: '000',
      status: 'Rejected',
      amount: 960000,
      accountBalance: '.00',
      accountTitle: '',
      accountStatus: 'Normal',
      postingRestriction: 'Account Inactive',
      senderBankCode: 'HABIB METROPOLITAN BANK LTD.',
      receiverBranchCode: '0005',
      hubCode: 'KARACHI-10',
      cycleCode: 'Normal',
      instrumentNo: 'Cheque',
      date: '2026-03-09T00:00:00',
      currency: null,
      branchStatus: null,
      cbcStatus: null,
      error: true,
      export: true,
      returnReason: '101-Amount in words and figures differs',
      frontImage: 'assets/images/cheque-front.jpg',
      backImage: 'assets/images/cheque-back.jpg',
      signatureImage: 'assets/images/signature.jpg'
    };
    
    setTimeout(() => {
      this.chequeDetails = mockData;
      this.isLoading = false;
    }, 1000);
  }

  goBack(): void {
    this.router.navigate(['/pages/ChequeProcess/system-rejected-cheques']);
  }

  processCheque(): void {
    // Process cheque functionality
    console.log('Processing cheque:', this.chequeId);
    if (this.selectedActionReason) {
      // Process cheque
      alert('Cheque processed successfully!');
    } else {
      alert('Please select a reason for processing.');
    }
  }

  getAccountDetails(): void {
    // Get account details functionality
    console.log('Getting account details for:', this.chequeDetails?.accountNumber);
  }

  rejectCheque(): void {
    // Reject cheque functionality
    console.log('Rejecting cheque:', this.chequeId);
    if (confirm('Are you sure you want to reject this cheque?')) {
      alert('Cheque rejected successfully!');
    }
  }

  onImageError(event: any): void {
    // Handle image loading errors
    event.target.src = 'assets/images/placeholder.png';
  }

  // Validation methods
  validateChequeNumber(): void {
    if (this.chequeDetails?.chequeNumber && this.chequeDetails.chequeNumber.length !== 8) {
      // Show validation error
    }
  }

  validateAccountNumber(): void {
    if (this.chequeDetails?.accountNumber && this.chequeDetails.accountNumber.length !== 16) {
      // Show validation error
    }
  }
}
