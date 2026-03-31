import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { PaginationComponent } from '../../../../components/pagination/pagination.component';
import { SpinnerComponent } from '../../../../components/spinner/spinner.component';
import { 
  tablerFileUpload,
  tablerUpload,
  tablerPhoto,
  tablerFileText,
  tablerCloudUpload,
  tablerFileImport,
  tablerSettings,
  tablerList,
  tablerCalendar,
  tablerInbox,
  tablerEye,
  tablerFileDescription,
  tablerInfoCircle,
  tablerListDetails,
  tablerCircleCheck,
  tablerPhotoPlus,
  tablerFilePlus,
  tablerCheck,
  tablerX,
  tablerServer
} from '@ng-icons/tabler-icons';
import { ChequeDepositService, ImportRecord } from '../../../../services/cheque-deposit.service';
import { UploadFileService } from '../../../../services/upload-file.service';
import Swal from 'sweetalert2';
declare var bootstrap: any;

@Component({
  selector: 'app-upload-file',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIcon,
    PaginationComponent,
    SpinnerComponent
  ],
  providers: [provideIcons({
    tablerFileUpload,
    tablerUpload,
    tablerPhoto,
    tablerFileText,
    tablerCloudUpload,
    tablerFileImport,
    tablerSettings,
    tablerList,
    tablerCalendar,
    tablerInbox,
    tablerEye,
    tablerFileDescription,
    tablerInfoCircle,
    tablerListDetails,
    tablerCircleCheck,
    tablerPhotoPlus,
    tablerFilePlus,
    tablerCheck,
    tablerX,
    tablerServer
  })],
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit {
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('detailsModal') detailsModal!: ElementRef<HTMLDivElement>;
  
  selectedImage: File | null = null;
  selectedFile: File | null = null;
  isImporting = false;
  isLoading = false;

  // Service options
  services = {
    import: false,
    startService: false,
    ssCardService: false,
    sftpImageUpload: false
  };

  filterDate: string = '';
  importHistory: ImportRecord[] = [];
  filteredImports: ImportRecord[] = [];
  selectedImport: ImportRecord | null = null;
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;

  constructor(
    private chequeDepositService: ChequeDepositService,
    private uploadFileService: UploadFileService
  ) { }

  ngOnInit(): void {
    this.loadImportHistory();
  }

  // Image upload methods
  triggerImageUpload(): void {
    this.imageInput.nativeElement.click();
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        if (file.size <= 5 * 1024 * 1024) { // 5MB
          this.selectedImage = file;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'File Too Large',
            text: 'Image file must be less than 5MB'
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Please select a JPG/JPEG image file'
        });
      }
    }
  }

  clearImage(): void {
    this.selectedImage = null;
    this.imageInput.nativeElement.value = '';
  }

  // File upload methods
  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type === 'text/plain') {
        if (file.size <= 10 * 1024 * 1024) { // 10MB
          this.selectedFile = file;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'File Too Large',
            text: 'Text file must be less than 10MB'
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Please select a TXT file'
        });
      }
    }
  }

  clearFile(): void {
    this.selectedFile = null;
    this.fileInput.nativeElement.value = '';
  }

  // Upload file method
  uploadFile(): void {
    if (!this.selectedFile) {
      Swal.fire({
        icon: 'warning',
        title: 'No File Selected',
        text: 'Please select a file to upload'
      });
      return;
    }

    Swal.fire({
      title: 'Uploading File',
      text: 'Please wait while we upload the file...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.chequeDepositService.uploadFile(this.selectedFile).subscribe({
      next: (response: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Upload Successful',
          text: 'File has been successfully uploaded',
          timer: 2000,
          showConfirmButton: false
        });
        
        // Clear file selection
        this.clearFile();
        
        // Reload import history
        this.loadImportHistory();
      },
      error: (error: any) => {
        console.error('Upload error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: error?.error?.message || 'Failed to upload file'
        });
      }
    });
  }

  // Import file method
  importFile(): void {
    if (!this.selectedFile) {
      Swal.fire({
        icon: 'warning',
        title: 'No File Selected',
        text: 'Please select a file to import'
      });
      return;
    }

    Swal.fire({
      title: 'Importing File',
      text: 'Please wait while we import the file...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.isImporting = true;

    this.chequeDepositService.importFile(this.services).subscribe({
      next: (response: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Import Completed',
          text: response?.message || 'File has been successfully imported',
          timer: 3000,
          showConfirmButton: false
        });
        
        // Clear file selection
        this.clearFile();
        
        // Reload import history
        this.loadImportHistory();
      },
      error: (error: any) => {
        console.error('Import error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Import Failed',
          text: error?.error?.message || 'Failed to import file'
        });
      },
      complete: () => {
        this.isImporting = false;
      }
    });
  }

  // Load import history
  loadImportHistory(): void {
    this.isLoading = true;
    
    this.chequeDepositService.getImportHistory(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        
        if (response?.status === 'success' && response?.data?.items) {
          this.importHistory = response.data.items;
          this.totalRecords = response.data.totalCount || 0;
          this.totalPages = response.data.totalPages || 0;
          
          // Apply initial filter
          this.filterImports();
        } else {
          this.importHistory = [];
          this.totalRecords = 0;
          this.totalPages = 0;
          this.filteredImports = [];
        }
        
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Import history error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load import history'
        });
        
        this.importHistory = [];
        this.filteredImports = [];
        this.totalRecords = 0;
        this.totalPages = 0;
        this.isLoading = false;
      }
    });
  }

  // Filter imports by date
  filterImports(): void {
    if (this.filterDate) {
      const filterDateObj = new Date(this.filterDate);
      filterDateObj.setHours(0, 0, 0, 0); // Set to start of day
      
      this.filteredImports = this.importHistory.filter(importRecord => {
        const importDate = new Date(importRecord.date);
        importDate.setHours(0, 0, 0, 0); // Set to start of day
        return importDate.getTime() === filterDateObj.getTime();
      });
    } else {
      this.filteredImports = [...this.importHistory];
    }
  }

  // Pagination
  onPageChange(event: { page: number; pageSize: number }): void {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.loadImportHistory();
  }

  // Import data method
  importData(): void {
    Swal.fire({
      title: 'Importing Data',
      text: 'Please wait while we import the data...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Call import API
    this.chequeDepositService.importData().subscribe({
      next: (response: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Import Completed',
          text: response?.message || 'Data has been successfully imported',
          timer: 3000,
          showConfirmButton: false
        });
        
        // Reload import history
        this.loadImportHistory();
      },
      error: (error: any) => {
        console.error('Import error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Import Failed',
          text: error?.error?.message || 'Failed to import data'
        });
      }
    });
  }

  // Start Service method
  startService(): void {
    Swal.fire({
      title: 'Starting Service',
      text: 'Please wait while we start the service...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Call start service API with isChecked=true
    this.uploadFileService.startService(true).subscribe({
      next: (response: any) => {
        
        if (response.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Service Started',
            text: response.data || 'Service has been successfully started',
            timer: 3000,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Service Start Failed',
            text: response.errorMessage || 'Failed to start service'
          });
        }
      },
      error: (error: any) => {
        console.error('Start service error:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        
        Swal.fire({
          icon: 'error',
          title: 'Service Start Failed',
          text: error.error?.message || error.message || 'Failed to start service'
        });
      }
    });
  }

  // SS Card Service method
  ssCardService(): void {
    Swal.fire({
      title: 'Processing SS Card Service',
      text: 'Please wait while we process SS Card service...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Call the new get-signatures API
    this.uploadFileService.getSignatures().subscribe({
      next: (response: any) => {
        Swal.fire({
          icon: 'success',
          title: 'SS Card Service Completed',
          text: response.data || 'Signatures retrieved successfully',
          timer: 3000,
          showConfirmButton: false
        });
      },
      error: (error: any) => {
        console.error('SS Card service error:', error);
        Swal.fire({
          icon: 'error',
          title: 'SS Card Service Failed',
          text: error.error?.message || error.message || 'Failed to retrieve signatures. Please try again.'
        });
      }
    });
  }

  // SFTP Image Upload method
  sftpImageUpload(): void {
    Swal.fire({
      title: 'Importing Images',
      text: 'Please wait while we import images...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Call the new import-images API
    this.uploadFileService.importImages().subscribe({
      next: (response: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Image Import Completed',
          text: response.data || 'Images have been successfully imported',
          timer: 3000,
          showConfirmButton: false
        });
      },
      error: (error: any) => {
        console.error('Image import error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Image Import Failed',
          text: error.error?.message || error.message || 'Failed to import images. Please try again.'
        });
      }
    });
  }

  // Show import details
  showImportDetails(importRecord: ImportRecord): void {
    Swal.fire({
      title: 'Loading Details',
      text: 'Please wait while we fetch import details...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Call API to get detailed import information
    this.chequeDepositService.getImportDetails(importRecord.id).subscribe({
      next: (response: any) => {
        Swal.close();
        
        // Update selected import with detailed data
        this.selectedImport = {
          ...importRecord,
          details: response.data?.items || response.data || response
        };
        
        // Show modal using Bootstrap
        const modal = new bootstrap.Modal(this.detailsModal.nativeElement);
        modal.show();
      },
      error: (error: any) => {
        console.error('Error fetching import details:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load import details'
        });
      }
    });
  }
}
