import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { SpinnerComponent } from '../../../../components/spinner/spinner.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, forkJoin } from 'rxjs';
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
    NgIcon,
    SpinnerComponent
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
  currentImageType: string = 'front';
  currentChequeImage: string = '';
  signatureImages: any[] = [];
  signatureVerificationStatus: 'verified' | 'rejected' | null = null;
  signatureMatchScore: number | null = null;
  isVerifyingSignature = false;
  isLoadingSignatureImages: boolean = false;
  signatureImageError: string = '';
  currentSignatureIndex: number = 0;
  
  // Signature magnifier properties
  showSignatureMagnifier: boolean = false;
  signatureMagnifierX: number = 0;
  signatureMagnifierY: number = 0;
  signatureMagnifierBgPosition: string = '0 0';
  
  // Image blob URLs for authenticated access
  frontImageUrl: string = '';
  backImageUrl: string = '';
  ultraImageUrl: string = '';
  
  // Magnifier properties
  showMagnifier: boolean = false;
  magnifierX: number = 0;
  magnifierY: number = 0;
  magnifierBgPosition: string = '0 0';

  // Cheque image manipulation properties
  chequeZoom: number = 1;
  chequeRotation: number = 0;
  chequeBrightness: number = 100;
  chequeContrast: number = 100;
  chequePanX: number = 0;
  chequePanY: number = 0;
  isChequeDragging: boolean = false;
  chequeDragStartX: number = 0;
  chequeDragStartY: number = 0;

  // Signature image manipulation properties
  signatureZoom: number = 1;
  signatureRotation: number = 0;
  signatureBrightness: number = 100;
  signatureContrast: number = 100;
  signaturePanX: number = 0;
  signaturePanY: number = 0;
  isSignatureDragging: boolean = false;
  signatureDragStartX: number = 0;
  signatureDragStartY: number = 0;

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
          this.initializeChequeImages();
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
        this.initializeChequeImages();
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

  // Handle thumbnail image loading errors
  onThumbnailError(event: any): void {
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNmM3NTdkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
  }

  // Initialize cheque images
  initializeChequeImages(): void {
    if (this.chequeDetails) {
      this.loadAllChequeImages();
      // Load signature images if available in cheque details
      if (this.chequeDetails.signature && Array.isArray(this.chequeDetails.signature)) {
        this.loadSignatureImagesFromPaths(this.chequeDetails.signature);
      }
    }
  }

  // Load signature images from file paths
  private loadSignatureImagesFromPaths(imagePaths: string[]): void {
    console.log('Loading signature images from paths:', imagePaths);
    this.isLoadingSignatureImages = true;
    this.signatureImageError = '';
    
    const imageObservables = imagePaths.map((path, index) => {
      return this.loadSignatureImage(path).pipe(
        map((blobUrl: string) => ({
          id: index + 1,
          url: blobUrl,
          title: `Signature ${index + 1}`
        }))
      );
    });

    forkJoin(imageObservables).subscribe({
      next: (images: any[]) => {
        console.log('Signature images loaded successfully:', images);
        this.signatureImages = images;
        this.isLoadingSignatureImages = false;
      },
      error: (error: any) => {
        console.error('Error loading signature images:', error);
        this.signatureImageError = 'Failed to load signature images';
        this.isLoadingSignatureImages = false;
      }
    });
  }

  // Load all cheque images with authentication
  loadAllChequeImages(): void {
    const baseUrl = 'https://localhost:44367/api/ChequeDeposit/image/';
    
    // Load front image
    if (this.chequeDetails?.imgF) {
      this.loadAuthenticatedImage(baseUrl + this.chequeDetails.imgF).subscribe({
        next: (blobUrl: any) => {
          this.frontImageUrl = blobUrl;
          if (this.currentImageType === 'front') {
            this.currentChequeImage = blobUrl;
          }
        },
        error: (err: any) => console.error('Error loading front image:', err)
      });
    }

    // Load back image
    if (this.chequeDetails?.imgR) {
      this.loadAuthenticatedImage(baseUrl + this.chequeDetails.imgR).subscribe({
        next: (blobUrl: any) => {
          this.backImageUrl = blobUrl;
          if (this.currentImageType === 'back') {
            this.currentChequeImage = blobUrl;
          }
        },
        error: (err: any) => console.error('Error loading back image:', err)
      });
    }

    // Load ultra violet image
    if (this.chequeDetails?.imgU) {
      this.loadAuthenticatedImage(baseUrl + this.chequeDetails.imgU).subscribe({
        next: (blobUrl: any) => {
          this.ultraImageUrl = blobUrl;
          if (this.currentImageType === 'ultra') {
            this.currentChequeImage = blobUrl;
          }
        },
        error: (err: any) => console.error('Error loading ultra image:', err)
      });
    }

    // Set default to front image
    this.selectImage('front');
  }

  // Load image with authentication and convert to blob URL
  loadAuthenticatedImage(imageUrl: string) {
    return this.http.get(imageUrl, { responseType: 'blob' }).pipe(
      map((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        return url;
      })
    );
  }

  // Select image type to display
  selectImage(type: string): void {
    this.currentImageType = type;
    
    switch (type) {
      case 'front':
        this.currentChequeImage = this.frontImageUrl;
        break;
      case 'back':
        this.currentChequeImage = this.backImageUrl;
        break;
      case 'ultra':
        this.currentChequeImage = this.ultraImageUrl;
        break;
      default:
        this.currentChequeImage = this.frontImageUrl;
    }
  }

  // Mouse move for magnifier effect
  onMouseMove(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // Calculate mouse position relative to image
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calculate background position for magnifier
    const bgX = (x / rect.width) * 100;
    const bgY = (y / rect.height) * 100;
    
    this.magnifierX = x - 100; // Center the lens (100 is half of 200px lens size)
    this.magnifierY = y - 100;
    this.magnifierBgPosition = `${bgX}% ${bgY}%`;
    this.showMagnifier = true;
  }

  // Mouse leave to hide magnifier
  onMouseLeave(): void {
    this.showMagnifier = false;
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
  /**
   * Auto signature verification: compares the signature on file with the signature
   * on the cheque image and returns a match accuracy.
   * TODO: replace the simulated score with the AI verification service response.
   */
  onVerifySignature(): void {
    if (this.signatureImages.length === 0) {
      Swal.fire({ icon: 'info', title: 'No Signatures', text: 'Load signature images first.' });
      return;
    }

    this.isVerifyingSignature = true;
    Swal.fire({
      title: 'Verifying Signature',
      html: 'Comparing signature on file with the cheque signature…',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.runSignatureMatch()
      .then(score => {
        this.isVerifyingSignature = false;
        this.signatureMatchScore = score;
        this.signatureVerificationStatus = score >= 70 ? 'verified' : 'rejected';
        this.showSignatureResult(score);
      })
      .catch(() => {
        this.isVerifyingSignature = false;
        Swal.fire({ icon: 'error', title: 'Verification Failed', text: 'Unable to verify the signature.' });
      });
  }

  /** Simulated match score — swap for the AI verification API call when available. */
  private runSignatureMatch(): Promise<number> {
    return new Promise(resolve => setTimeout(() => resolve(5), 1500));
  }

  private showSignatureResult(score: number): void {
    const sigList = this.signatureImages.map((img: any, i: number) =>
      `<img src="${img.url}" style="max-width:100%;max-height:200px;object-fit:contain;border:1px solid #e5e7eb;border-radius:8px;background:#fff;" alt="Signature ${i + 1}"/>`
    ).join('');
    const chequeImg = this.frontImageUrl
      ? `<img src="${this.frontImageUrl}" style="max-width:100%;max-height:260px;object-fit:contain;border:1px solid #e5e7eb;border-radius:8px;background:#fff;" alt="Cheque Front"/>`
      : `<div style="display:flex;align-items:center;justify-content:center;height:180px;background:#f8fafc;border-radius:8px;color:#9ca3af;font-size:12px;">Cheque image not loaded</div>`;
    const verified = this.signatureVerificationStatus === 'verified';
    const color = verified ? '#198754' : '#dc2626';

    Swal.fire({
      title: 'Signature Verification Result',
      width: 820,
      html: `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;text-align:left;">
          <div>
            <h6 style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;margin:0 0 8px;letter-spacing:.5px;">Signature on File</h6>
            <div style="display:flex;flex-direction:column;gap:8px;">${sigList}</div>
          </div>
          <div>
            <h6 style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;margin:0 0 8px;letter-spacing:.5px;">Signature on Cheque</h6>
            ${chequeImg}
          </div>
        </div>
        <div style="margin-top:16px;text-align:left;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:12.5px;font-weight:700;color:#374151;">Match Accuracy</span>
            <span style="font-size:16px;font-weight:800;color:${color};">${score.toFixed(1)}%</span>
          </div>
          <div style="height:8px;background:#e5e7eb;border-radius:99px;overflow:hidden;">
            <div style="height:100%;width:${score}%;background:${color};border-radius:99px;"></div>
          </div>
          <p style="margin-top:8px;font-size:12px;font-weight:700;color:${color};">
            ${verified ? 'Signature matched' : 'Signature does not match'} the cheque signature.
          </p>
        </div>`,
      confirmButtonText: 'Close',
      confirmButtonColor: '#5a2181'
    });
  }

  fetchSignatureImages(): void {
    if (!this.chequeDetails) {
      this.signatureImageError = 'No cheque details available';
      return;
    }

    // Start loading state
    this.isLoadingSignatureImages = true;
    this.signatureImageError = '';
    this.signatureImages = [];
    this.signatureVerificationStatus = null;
    this.signatureMatchScore = null;

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
      // If data is an array of file paths (strings)
      data.forEach((imagePath: string, index: number) => {
        if (imagePath && typeof imagePath === 'string') {
          // Load image via authenticated API
          this.loadSignatureImage(imagePath).subscribe({
            next: (blobUrl: string) => {
              images.push({
                id: index + 1,
                url: blobUrl,
                title: `Signature ${index + 1}`
              });
            },
            error: (err: any) => {
              console.error('Error loading signature image:', err);
            }
          });
        }
      });
    } else if (typeof data === 'object') {
      // If data is an object with image properties
      Object.keys(data).forEach((key, index) => {
        const imagePath = data[key];
        if (imagePath && typeof imagePath === 'string') {
          this.loadSignatureImage(imagePath).subscribe({
            next: (blobUrl: string) => {
              images.push({
                id: index + 1,
                url: blobUrl,
                title: `Signature ${index + 1}`
              });
            },
            error: (err: any) => {
              console.error('Error loading signature image:', err);
            }
          });
        }
      });
    }
    return images;
  }

  // Load signature image via authenticated API
  private loadSignatureImage(imagePath: string) {
    const baseUrl = 'https://localhost:44367/api/ChequeDeposit/signature-image';
    const encodedPath = encodeURIComponent(imagePath);
    const fullUrl = `${baseUrl}?imagePath=${encodedPath}`;
    console.log('Loading signature image from:', fullUrl);
    
    return this.http.get(fullUrl, { responseType: 'blob' }).pipe(
      map((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        console.log('Signature image blob URL created:', url);
        return url;
      })
    );
  }

  // Signature image navigation
  previousSignatureImage(): void {
    if (this.currentSignatureIndex > 0) {
      this.currentSignatureIndex--;
    } else {
      this.currentSignatureIndex = this.signatureImages.length - 1;
    }
  }

  nextSignatureImage(): void {
    if (this.currentSignatureIndex < this.signatureImages.length - 1) {
      this.currentSignatureIndex++;
    } else {
      this.currentSignatureIndex = 0;
    }
  }

  selectSignatureImage(index: number): void {
    this.currentSignatureIndex = index;
  }

  // Signature magnifier
  onSignatureMouseMove(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const bgX = (x / rect.width) * 100;
    const bgY = (y / rect.height) * 100;
    
    this.signatureMagnifierX = x - 100;
    this.signatureMagnifierY = y - 100;
    this.signatureMagnifierBgPosition = `${bgX}% ${bgY}%`;
    this.showSignatureMagnifier = true;
  }

  onSignatureMouseLeave(): void {
    this.showSignatureMagnifier = false;
  }

  onSignatureImageError(event: any): void {
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNmM3NTdkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
  }

  onSignatureThumbnailError(event: any): void {
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNmM3NTdkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
  }

  // Cheque image manipulation methods
  zoomChequeIn(): void {
    if (this.chequeZoom < 3) {
      this.chequeZoom += 0.25;
    }
  }

  zoomChequeOut(): void {
    if (this.chequeZoom > 0.5) {
      this.chequeZoom -= 0.25;
    }
  }

  resetChequeZoom(): void {
    this.chequeZoom = 1;
  }

  rotateChequeLeft(): void {
    this.chequeRotation -= 90;
  }

  rotateChequeRight(): void {
    this.chequeRotation += 90;
  }

  resetChequeRotation(): void {
    this.chequeRotation = 0;
  }

  increaseChequeBrightness(): void {
    if (this.chequeBrightness < 200) {
      this.chequeBrightness += 10;
    }
  }

  decreaseChequeBrightness(): void {
    if (this.chequeBrightness > 50) {
      this.chequeBrightness -= 10;
    }
  }

  resetChequeBrightness(): void {
    this.chequeBrightness = 100;
  }

  increaseChequeContrast(): void {
    if (this.chequeContrast < 200) {
      this.chequeContrast += 10;
    }
  }

  decreaseChequeContrast(): void {
    if (this.chequeContrast > 50) {
      this.chequeContrast -= 10;
    }
  }

  resetChequeContrast(): void {
    this.chequeContrast = 100;
  }

  resetAllChequeSettings(): void {
    this.chequeZoom = 1;
    this.chequeRotation = 0;
    this.chequeBrightness = 100;
    this.chequeContrast = 100;
    this.chequePanX = 0;
    this.chequePanY = 0;
  }

  // Signature image manipulation methods
  zoomSignatureIn(): void {
    if (this.signatureZoom < 3) {
      this.signatureZoom += 0.25;
    }
  }

  zoomSignatureOut(): void {
    if (this.signatureZoom > 0.5) {
      this.signatureZoom -= 0.25;
    }
  }

  resetSignatureZoom(): void {
    this.signatureZoom = 1;
  }

  rotateSignatureLeft(): void {
    this.signatureRotation -= 90;
  }

  rotateSignatureRight(): void {
    this.signatureRotation += 90;
  }

  resetSignatureRotation(): void {
    this.signatureRotation = 0;
  }

  increaseSignatureBrightness(): void {
    if (this.signatureBrightness < 200) {
      this.signatureBrightness += 10;
    }
  }

  decreaseSignatureBrightness(): void {
    if (this.signatureBrightness > 50) {
      this.signatureBrightness -= 10;
    }
  }

  resetSignatureBrightness(): void {
    this.signatureBrightness = 100;
  }

  increaseSignatureContrast(): void {
    if (this.signatureContrast < 200) {
      this.signatureContrast += 10;
    }
  }

  decreaseSignatureContrast(): void {
    if (this.signatureContrast > 50) {
      this.signatureContrast -= 10;
    }
  }

  resetSignatureContrast(): void {
    this.signatureContrast = 100;
  }

  resetAllSignatureSettings(): void {
    this.signatureZoom = 1;
    this.signatureRotation = 0;
    this.signatureBrightness = 100;
    this.signatureContrast = 100;
    this.signaturePanX = 0;
    this.signaturePanY = 0;
  }

  // Get cheque image transform style
  getChequeImageStyle(): any {
    return {
      transform: `translate(${this.chequePanX}px, ${this.chequePanY}px) scale(${this.chequeZoom}) rotate(${this.chequeRotation}deg)`,
      filter: `brightness(${this.chequeBrightness}%) contrast(${this.chequeContrast}%)`
    };
  }

  // Get signature image transform style
  getSignatureImageStyle(): any {
    return {
      transform: `translate(${this.signaturePanX}px, ${this.signaturePanY}px) scale(${this.signatureZoom}) rotate(${this.signatureRotation}deg)`,
      filter: `brightness(${this.signatureBrightness}%) contrast(${this.signatureContrast}%)`
    };
  }

  // Cheque image drag handlers
  onChequeMouseDown(event: MouseEvent): void {
    if (this.chequeZoom > 1) {
      this.isChequeDragging = true;
      this.chequeDragStartX = event.clientX - this.chequePanX;
      this.chequeDragStartY = event.clientY - this.chequePanY;
      event.preventDefault();
    }
  }

  onChequeMouseMove(event: MouseEvent): void {
    // Handle magnifier when zoom is 1x
    if (this.chequeZoom === 1) {
      const target = event.target as HTMLElement;
      const rect = target.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const bgX = (x / rect.width) * 100;
      const bgY = (y / rect.height) * 100;

      this.magnifierX = x - 100;
      this.magnifierY = y - 100;
      this.magnifierBgPosition = `${bgX}% ${bgY}%`;
      this.showMagnifier = true;
    }
    // Handle drag when zoom is > 1x
    else if (this.isChequeDragging && this.chequeZoom > 1) {
      this.chequePanX = event.clientX - this.chequeDragStartX;
      this.chequePanY = event.clientY - this.chequeDragStartY;
    }
  }

  onChequeMouseUp(): void {
    this.isChequeDragging = false;
  }

  onChequeMouseLeave(): void {
    this.isChequeDragging = false;
    this.showMagnifier = false;
  }

  // Signature image drag handlers
  onSignatureMouseDown(event: MouseEvent): void {
    if (this.signatureZoom > 1) {
      this.isSignatureDragging = true;
      this.signatureDragStartX = event.clientX - this.signaturePanX;
      this.signatureDragStartY = event.clientY - this.signaturePanY;
      event.preventDefault();
    }
  }

  onSignatureDragMove(event: MouseEvent): void {
    // Handle magnifier when zoom is 1x
    if (this.signatureZoom === 1) {
      const target = event.target as HTMLElement;
      const rect = target.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const bgX = (x / rect.width) * 100;
      const bgY = (y / rect.height) * 100;

      this.signatureMagnifierX = x - 100;
      this.signatureMagnifierY = y - 100;
      this.signatureMagnifierBgPosition = `${bgX}% ${bgY}%`;
      this.showSignatureMagnifier = true;
    }
    // Handle drag when zoom is > 1x
    else if (this.isSignatureDragging && this.signatureZoom > 1) {
      this.signaturePanX = event.clientX - this.signatureDragStartX;
      this.signaturePanY = event.clientY - this.signatureDragStartY;
    }
  }

  onSignatureDragEnd(): void {
    this.isSignatureDragging = false;
  }

  onSignatureDragLeave(): void {
    this.isSignatureDragging = false;
    this.showSignatureMagnifier = false;
  }
}
