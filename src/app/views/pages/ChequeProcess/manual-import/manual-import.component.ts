import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ChequeDepositService, ImportRecord, ImportDetail } from '../../../../services/cheque-deposit.service';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { NgIcon } from '@ng-icons/core';
declare var bootstrap: any;

@Component({
  selector: 'app-manual-import',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, NgIcon],
  templateUrl: './manual-import.component.html',
  styleUrls: ['./manual-import.component.scss']
})
export class ManualImportComponent implements OnInit {
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('detailsModal') detailsModal!: ElementRef<HTMLDivElement>;
  selectedImage: File | null = null;
  selectedFile: File | null = null;
  isImporting = false;
  isLoading = false;
  filterDate: string = '';
  importHistory: ImportRecord[] = [];
  filteredImports: ImportRecord[] = [];
  selectedImport: ImportRecord | null = null;
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;

  constructor(private chequeDepositService: ChequeDepositService) { }

  ngOnInit(): void {
    this.loadImportHistory();
  }

   onPageChange(event: { page: number; pageSize: number }) {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.loadImportHistory();
  }

  loadImportHistory() {
    this.isLoading = true;
    
    this.chequeDepositService.getManualImportHistory(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.importHistory = response.data.items;
          this.filteredImports = [...this.importHistory];
          this.totalRecords = response.data.totalCount;
          this.totalPages = response.data.totalPages;
        } else {
          this.importHistory = [];
          this.filteredImports = [];
          this.totalRecords = 0;
          this.totalPages = 0;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading import history:', error);
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

   uploadFile() {
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
      text: 'Please wait while we upload your file...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.chequeDepositService.uploadFile(this.selectedFile).subscribe({
      next: (response: any) => {
        console.log('Upload response:', response);
        Swal.fire({
          icon: 'success',
          title: 'File Uploaded Successfully',
          text: response?.message || `${this.selectedFile!.name} has been uploaded. Now you can import it.`,
          timer: 3000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        console.error('Upload error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: error.error?.message || error.message || 'Failed to upload file'
        });
      }
    });
  }

  importFile() {
    Swal.fire({
      title: 'Importing File',
      text: 'Please wait while we import the file...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.isImporting = true;

    this.chequeDepositService.importFile().subscribe({
      next: (response: any) => {
        console.log('Import response:', response);
        Swal.fire({
          icon: 'success',
          title: 'Import Completed',
          text: response?.message || 'File has been successfully imported',
          timer: 3000,
          showConfirmButton: false
        });
        
        this.isImporting = false;
        
        this.loadImportHistory();
      },
      error: (error) => {
        console.error('Import error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Import Failed',
          text: error.error?.message || error.message || 'Failed to import file. Please try again.'
        });
        this.isImporting = false;
      }
    });
  }

  triggerImageUpload() {
    this.imageInput.nativeElement.click();
  }

  onImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.jpg') && !file.name.toLowerCase().endsWith('.jpeg')) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Only JPG files are allowed for image upload'
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Image size should not exceed 5MB'
        });
        return;
      }
      this.selectedImage = file;
    }
  }

  clearImage() {
    this.selectedImage = null;
    this.imageInput.nativeElement.value = '';
  }

  triggerFileUpload() {
    this.fileInput.nativeElement.click();
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.txt')) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Only TXT files are allowed for file upload'
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'File size should not exceed 10MB'
        });
        return;
      }
      this.selectedFile = file;
    }
  }

  clearFile() {
    this.selectedFile = null;
    this.fileInput.nativeElement.value = '';
  }

  filterImports() {
    this.filteredImports = this.importHistory.filter(importRecord => {
      let matchesDate = true;
      if (this.filterDate) {
        const filterDate = new Date(this.filterDate);
        const importDate = new Date(importRecord.date);
        matchesDate = importDate.toDateString() === filterDate.toDateString();
      }
      return matchesDate;
    });
  }

  showImportDetails(importRecord: ImportRecord) {
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
          text: 'Failed to load import details. Please try again.'
        });
      }
    });
  }

}
