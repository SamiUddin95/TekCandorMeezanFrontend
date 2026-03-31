import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { SpinnerComponent } from '../../../../components/spinner/spinner.component';
import { ActivatedRoute, Router } from '@angular/router';
import { InProcessChequesService } from '../../../../services/in-process-cheques.service';
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
  selector: 'app-in-process-cheques-details',
  templateUrl: './in-process-cheques-details.component.html',
  styleUrls: ['./in-process-cheques-details.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, SpinnerComponent],
  providers: [provideIcons({ tablerArrowLeft, tablerFileText, tablerDownload, tablerPrinter, tablerCheck, tablerUser, tablerX }), DatePipe]
})
export class InProcessChequesDetailsComponent implements OnInit {

  chequeId: number = 0;
  chequeDetails: any = null;
  isLoading: boolean = false;
  selectedActionReason: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inProcessChequesService: InProcessChequesService
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
      status: 'In Process',
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
      error: false,
      export: true,
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
    this.router.navigate(['/pages/ChequeProcess/in-process-cheques']);
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
