import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BranchReturnService } from '../../../../services/branch-return.service';
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
  selector: 'app-branch-return-details',
  templateUrl: './branch-return-details.component.html',
  styleUrls: ['./branch-return-details.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  providers: [provideIcons({ tablerArrowLeft, tablerFileText, tablerDownload, tablerPrinter, tablerCheck, tablerUser, tablerX }), DatePipe]
})
export class BranchReturnDetailsComponent implements OnInit {

  chequeId: number = 0;
  chequeDetails: any = null;
  isLoading: boolean = false;
  selectedReturnReason: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private branchReturnService: BranchReturnService
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
    
    // Hardcoded data for now - will be replaced with real API later
    const mockData = {
      id: this.chequeId,
      chequeNumber: '02066693',
      accountNumber: '0099340204346125',
      amount: 130560,
      status: 'Rejected',
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
      branchStatus: null,
      cbcStatus: null,
      error: true,
      export: true,
      branchRemarks: '',
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
    this.router.navigate(['/pages/ChequeProcess/branch-return-confirmations']);
  }

  confirmReturn(): void {
    // Confirm return functionality
    console.log('Confirming return:', this.chequeId);
    if (this.selectedReturnReason) {
      // Process return confirmation
      alert('Return confirmed successfully!');
    } else {
      alert('Please select a return reason.');
    }
  }

  getAccountDetails(): void {
    // Get account details functionality
    console.log('Getting account details for:', this.chequeDetails?.accountNumber);
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
