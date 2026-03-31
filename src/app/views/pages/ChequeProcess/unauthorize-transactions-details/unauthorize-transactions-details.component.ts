import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { SpinnerComponent } from '../../../../components/spinner/spinner.component';
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
  imports: [CommonModule, FormsModule, NgIcon, SpinnerComponent],
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
    
    this.unauthorizeTransactionsService.getUnauthorizeTransactionDetails(this.transactionId).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.transactionDetails = response.data;
        } else {
          console.error('Failed to load transaction details:', response.errorMessage);
          alert('Failed to load transaction details');
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading transaction details:', error);
        alert('Error loading transaction details. Please try again.');
        this.isLoading = false;
      }
    });
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
    // Handle image loading errors - show no image found message instead of trying to load placeholder
    event.target.style.display = 'none';
    
    // Create or update a "No Image" message
    const container = event.target.parentElement;
    if (container && !container.querySelector('.no-image-message')) {
      const noImageDiv = document.createElement('div');
      noImageDiv.className = 'no-image-message text-center p-4 bg-light';
      noImageDiv.innerHTML = '<p class="text-muted mb-0">No Image Available</p>';
      container.appendChild(noImageDiv);
    }
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
