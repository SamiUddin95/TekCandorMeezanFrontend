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
    
    this.systemRejectedChequesService.getSystemRejectedChequeDetails(this.chequeId).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.chequeDetails = response.data;
        } else {
          console.error('Failed to load cheque details:', response.errorMessage);
          alert('Failed to load cheque details');
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading cheque details:', error);
        alert('Error loading cheque details. Please try again.');
        this.isLoading = false;
      }
    });
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
    }
  }

  validateAccountNumber(): void {
    if (this.chequeDetails?.accountNumber && this.chequeDetails.accountNumber.length !== 16) {
      // Show validation error
    }
  }
}
