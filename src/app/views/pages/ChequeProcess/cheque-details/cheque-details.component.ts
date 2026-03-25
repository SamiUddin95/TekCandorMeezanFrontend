import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PendingChequeService, PendingChequeRecord } from '../../../../services/pending-cheque.service';
import { ChequeDepositService } from '../../../../services/cheque-deposit.service';
import { FilterService } from '../../../../services/filter.service';
import Swal from 'sweetalert2';
declare var bootstrap: any;

@Component({
  selector: 'app-cheque-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIcon
  ],
  templateUrl: './cheque-details.component.html',
  styleUrl: './cheque-details.component.scss'
})
export class ChequeDetailsComponent implements OnInit {
  @Input() chequeId: number = 0;
  @ViewChild('detailsModal') detailsModal!: ElementRef;

  chequeDetails: any = null;
  isLoading: boolean = false;
  relatedCheques: any[] = [];
  transactionHistory: any[] = [];
  documents: any[] = [];
  selectedReturnReason: string = '';
  returnReasonOptions: any[] = [];
  currentImageIndex: number = 0;
  totalImages: number = 2;
  signatureImages: any[] = [];
  isLoadingSignatureImages: boolean = false;
  signatureImageError: string = '';

  constructor(
    private pendingChequeService: PendingChequeService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private chequeDepositService: ChequeDepositService,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.loadReturnReasonOptions();
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.chequeId = +id;
        
        // Check if we have data from navigation state (from API call)
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras?.state?.['chequeData']) {
          // Use the API data from navigation state
          this.chequeDetails = navigation.extras.state['chequeData'];
          this.isLoading = false;
        } else {
          // Fallback to loading data normally
          this.loadChequeDetails();
        }
      }
    });
  }

  // Load cheque details
  loadChequeDetails(): void {
    this.isLoading = true;
    
    // Use service for API call
    this.chequeDepositService.getChequeDetails(this.chequeId).subscribe({
      next: (data: any) => {
        this.chequeDetails = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading cheque details:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load cheque details'
        });
        this.isLoading = false;
      }
    });
  }

  // Load return reason options
  loadReturnReasonOptions(): void {
    this.filterService.getReturnReasonOptions().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data && response.data.returnReasons) {
          this.returnReasonOptions = response.data.returnReasons.map((reason: any) => ({
            value: reason.value,
            label: reason.text
          }));
        } else {
          this.returnReasonOptions = [];
        }
      },
      error: (error: any) => {
        console.error('Error loading return reason options:', error);
        this.returnReasonOptions = [];
      }
    });
  }

  // Show modal
  showModal(): void {
    const modal = new bootstrap.Modal(this.detailsModal.nativeElement);
    modal.show();
  }

  // Hide modal
  hideModal(): void {
    const modal = bootstrap.Modal.getInstance(this.detailsModal.nativeElement);
    if (modal) {
      modal.hide();
    }
  }

  // Go back
  goBack(): void {
    this.router.navigate(['/pages/ChequeProcess/pending-cheque']);
  }

  // Handle image loading errors
  onImageError(event: any): void {
    // Set a fallback image if the API image fails to load
    event.target.src = '';
  }

  // Format date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    } else {
      this.currentImageIndex = this.totalImages - 1;
    }
  }

  nextImage(): void {
    if (this.currentImageIndex < this.totalImages - 1) {
      this.currentImageIndex++;
    } else {
      this.currentImageIndex = 0;
    }
  }

  approveCheque(): void {
    Swal.fire({
      title: 'Approve Cheque',
      text: 'Are you sure you want to approve this cheque?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Approve'
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO: Call approve API
        Swal.fire({
          icon: 'success',
          title: 'Approved',
          text: 'Cheque has been approved successfully',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  getAccountDetails(): void {
    Swal.fire({
      title: 'Account Details',
      html: `
        <div style="text-align: left;">
          <p><strong>Account Number:</strong> ${this.chequeDetails.accountNumber}</p>
          <p><strong>Account Title:</strong> ${this.chequeDetails.customerName}</p>
          <p><strong>Account Balance:</strong> ${this.chequeDetails.accountBalance}</p>
          <p><strong>Account Status:</strong> ${this.chequeDetails.accountStatus}</p>
          <p><strong>Customer NIC:</strong> ${this.chequeDetails.nicNumber}</p>
          <p><strong>Customer Phone:</strong> ${this.chequeDetails.customerPhone}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#007bff',
      confirmButtonText: 'Close'
    });
  }

  sendToRejection(): void {
    if (!this.selectedReturnReason) {
      Swal.fire({
        icon: 'warning',
        title: 'Return Reason Required',
        text: 'Please select a return reason before sending to rejection.',
        confirmButtonColor: '#007bff'
      });
      return;
    }

    Swal.fire({
      title: 'Send to Rejection',
      text: `Are you sure you want to reject this cheque for: ${this.selectedReturnReason.replace('_', ' ').toUpperCase()}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Reject'
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO: Call rejection API
        Swal.fire({
          icon: 'success',
          title: 'Rejected',
          text: 'Cheque has been sent to rejection successfully',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  // Fetch signature images
  fetchSignatureImages(): void {
    if (!this.chequeDetails) {
      this.signatureImageError = 'No cheque details available';
      return;
    }

    // Start loading state
    this.isLoadingSignatureImages = true;
    this.signatureImageError = '';
    this.signatureImages = [];

    // Prepare request body
    const requestBody = {
      id: this.chequeDetails.id,
      accountNumber: this.chequeDetails.accountNumber || '',
      chequeNumber: this.chequeDetails.chequeNumber || ''
    };

    // Call API to get signature images
    this.chequeDepositService.getSignatureImages(requestBody).subscribe({
      next: (response: any) => {
        // Stop loading state
        this.isLoadingSignatureImages = false;
        
        // Handle the response and populate signatureImages array
        if (response.status === 'success' && response.data) {
          this.signatureImages = this.processSignatureImageData(response.data);
          
          if (this.signatureImages.length === 0) {
            this.signatureImageError = 'No signature images found in response';
          }
        } else {
          this.signatureImages = [];
          this.signatureImageError = response.errorMessage || 'No signature images found or error in response';
        }
      },
      error: (error: any) => {
        // Stop loading state and set error
        this.isLoadingSignatureImages = false;
        this.signatureImages = [];
        
        // Extract error message from response
        if (error.error?.message) {
          this.signatureImageError = error.error.message;
        } else if (error.message) {
          this.signatureImageError = error.message;
        } else if (error.status === 500) {
          this.signatureImageError = 'Server error occurred. Please try again later.';
        } else {
          this.signatureImageError = 'Failed to load signature images. Please try again.';
        }
      }
    });
  }

  // Process signature image data from API response
  private processSignatureImageData(data: any): any[] {
    const images: any[] = [];
    
    if (Array.isArray(data)) {
      // If data is an array of image objects
      data.forEach((image: any, index: number) => {
        if (image.imageUrl || image.imageData || image.url) {
          images.push({
            id: index + 1,
            url: image.imageUrl || image.imageData || image.url,
            title: `Signature Image ${index + 1}`
          });
        }
      });
    } else if (typeof data === 'object') {
      // If data is an object with image properties
      Object.keys(data).forEach((key, index) => {
        const imageUrl = data[key];
        if (imageUrl && typeof imageUrl === 'string') {
          images.push({
            id: index + 1,
            url: imageUrl,
            title: `Signature Image ${index + 1}`
          });
        }
      });
    }
    return images;
  }
}
