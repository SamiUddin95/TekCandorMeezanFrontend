import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CallbackChequeService } from '../../../../services/callback-cheque.service';
import { FilterService } from '../../../../services/filter.service';
import {
  tablerArrowLeft,
  tablerRefresh
} from '@ng-icons/tabler-icons';

@Component({
  selector: 'app-callback-cheque-details',
  templateUrl: './callback-cheque-details.component.html',
  styleUrls: ['./callback-cheque-details.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  providers: [provideIcons({ tablerArrowLeft, tablerRefresh })]
})
export class CallbackChequeDetailsComponent implements OnInit {

  chequeDetails: any = null;
  isLoading: boolean = false;
  chequeId: number = 0;
  cbcStatusOptions: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private callbackChequeService: CallbackChequeService,
    private filterService: FilterService
  ) { }

  ngOnInit(): void {
    this.loadCbcStatusOptions();
    
    this.route.params.subscribe(params => {
      this.chequeId = +params['id'];
      if (this.chequeId) {
        this.loadChequeDetails();
      }
    });
  }

  loadChequeDetails(): void {
    this.isLoading = true;
    
    this.callbackChequeService.getCallbackChequeDetails(this.chequeId).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.chequeDetails = response.data;
        } else {
          console.error('Failed to load cheque details:', response.errorMessage);
          alert('Failed to load cheque details');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading cheque details:', error);
        alert('Error loading cheque details. Please try again.');
        this.isLoading = false;
      }
    });
  }

  loadCbcStatusOptions(): void {
    this.filterService.getCbcStatusOptions().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data && response.data.cbcStatus) {
          this.cbcStatusOptions = response.data.cbcStatus.map((status: any) => ({
            value: status.value,
            label: status.text
          }));
        } else {
          this.cbcStatusOptions = [];
        }
      },
      error: (error: any) => {
        console.error('Error loading CBC status options:', error);
        this.cbcStatusOptions = [];
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/pages/ChequeProcess/callbackcheques']);
  }

  updateCallbackCheque(): void {
    if (!this.chequeDetails) return;

    // Prepare update data
    const updateData = {
      chequeNumber: this.chequeDetails.chequeNumber,
      accountNumber: this.chequeDetails.accountNumber,
      cbcStatus: this.chequeDetails.cbcStatus
    };

    this.callbackChequeService.updateCallbackCheque(this.chequeId, updateData).subscribe({
      next: (response) => {
        alert('Callback cheque updated successfully!');
        this.goBack();
      },
      error: (error) => {
        console.error('Error updating callback cheque:', error);
        alert('Error updating callback cheque. Please try again.');
      }
    });
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
    if (this.chequeDetails?.chequeNumber && this.chequeDetails.chequeNumber.length !== 8) {
      // Show validation error
      console.warn('Cheque number must be 8 digits');
    }
  }

  validateAccountNumber(): void {
    if (this.chequeDetails?.accountNumber && this.chequeDetails.accountNumber.length !== 16) {
      // Show validation error
      console.warn('Account number must be 16 digits');
    }
  }

  // Format amount for display
  formatAmount(amount: string): string {
    if (!amount) return '0.00';
    return parseFloat(amount).toLocaleString('en-PK', {
      style: 'currency',
      currency: 'PKR'
    });
  }

  // Get status badge class
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'badge bg-warning';
      case 'processing':
        return 'badge bg-info';
      case 'completed':
        return 'badge bg-success';
      case 'rejected':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }
}
