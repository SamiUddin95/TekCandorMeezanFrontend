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
    
    this.branchReturnService.getBranchReturnConfirmationDetails(this.chequeId).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.chequeDetails = response.data;
        } else {
          console.error('Failed to load branch return details:', response.errorMessage);
          alert('Failed to load branch return details');
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading branch return details:', error);
        alert('Error loading branch return details. Please try again.');
        this.isLoading = false;
      }
    });
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
