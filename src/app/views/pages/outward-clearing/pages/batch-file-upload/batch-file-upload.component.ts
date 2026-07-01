import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgIcon } from '@ng-icons/core';
import { PaginationComponent } from '@app/components/pagination/pagination.component';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';

declare var bootstrap: any;

export interface BatchImportRecord {
  id: number;
  batchId: string;
  branchName: string;
  fileName: string;
  date: string;
  totalRecords: number;
  successfullRecords: number;
  failureRecords: number;
  status: string;
  details?: BatchImportDetail[];
}

export interface BatchImportDetail {
  data: string;
  date: string;
  errorDescription: string;
}

@Component({
  selector: 'app-batch-file-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, NgIcon, SpinnerComponent],
  templateUrl: './batch-file-upload.component.html',
  styleUrl: './batch-file-upload.component.scss'
})
export class BatchFileUploadComponent implements OnInit {
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('detailsModal') detailsModal!: ElementRef<HTMLDivElement>;
  
  selectedImage: File | null = null;
  selectedFile: File | null = null;
  isImporting = false;
  isLoading = false;
  filterDate: string = '';
  importHistory: BatchImportRecord[] = [];
  filteredImports: BatchImportRecord[] = [];
  selectedImport: BatchImportRecord | null = null;
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;

  constructor() { }

  ngOnInit(): void {
    // Load hardcoded data
    this.loadHardcodedData();
  }

  onPageChange(event: { page: number; pageSize: number }) {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.loadHardcodedData();
  }

  loadHardcodedData() {
    this.isLoading = true;
    
    // Simulate API delay
    setTimeout(() => {
      this.importHistory = [
        {
          id: 1,
          batchId: 'BATCH-001',
          branchName: 'Main Branch',
          fileName: 'batch_001.txt',
          date: '2026-05-06T10:30:00',
          totalRecords: 150,
          successfullRecords: 145,
          failureRecords: 5,
          status: 'Completed',
          details: [
            { data: 'CHK001', date: '2026-05-06T10:30:15', errorDescription: 'Invalid amount format' },
            { data: 'CHK002', date: '2026-05-06T10:30:20', errorDescription: 'Branch code not found' }
          ]
        },
        {
          id: 2,
          batchId: 'BATCH-002',
          branchName: 'Gulshan Branch',
          fileName: 'batch_002.txt',
          date: '2026-05-05T14:20:00',
          totalRecords: 200,
          successfullRecords: 200,
          failureRecords: 0,
          status: 'Completed'
        },
        {
          id: 3,
          batchId: 'BATCH-003',
          branchName: 'Clifton Branch',
          fileName: 'batch_003.txt',
          date: '2026-05-04T09:15:00',
          totalRecords: 120,
          successfullRecords: 115,
          failureRecords: 5,
          status: 'Completed',
          details: [
            { data: 'CHK003', date: '2026-05-04T09:15:30', errorDescription: 'Account number invalid' },
            { data: 'CHK004', date: '2026-05-04T09:15:35', errorDescription: 'Payee name missing' }
          ]
        }
      ];
      
      this.filteredImports = [...this.importHistory];
      this.totalRecords = this.importHistory.length;
      this.isLoading = false;
    }, 500);
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

    // Simulate upload
    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: 'File Uploaded Successfully',
        text: `${this.selectedFile!.name} has been uploaded. Now you can import it.`,
        timer: 3000,
        showConfirmButton: false
      });
    }, 1500);
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

    // Simulate import
    setTimeout(() => {
      const newRecord: BatchImportRecord = {
        id: this.importHistory.length + 1,
        batchId: 'BATCH-004',
        branchName: 'DHA Branch',
        fileName: this.selectedFile?.name || 'batch_004.txt',
        date: new Date().toISOString(),
        totalRecords: 100,
        successfullRecords: 95,
        failureRecords: 5,
        status: 'Completed',
        details: [
          { data: 'CHK005', date: new Date().toISOString(), errorDescription: 'Sample error' }
        ]
      };

      this.importHistory.unshift(newRecord);
      this.filteredImports = [...this.importHistory];
      this.totalRecords = this.importHistory.length;
      this.isImporting = false;

      Swal.fire({
        icon: 'success',
        title: 'Import Completed',
        text: 'File has been successfully imported',
        timer: 3000,
        showConfirmButton: false
      });
    }, 2000);
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
      
      if (file.size > 5 * 1024 * 1024) {
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
      
      if (file.size > 10 * 1024 * 1024) {
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

  showImportDetails(importRecord: BatchImportRecord) {
    this.selectedImport = importRecord;
    const modal = new bootstrap.Modal(this.detailsModal.nativeElement);
    modal.show();
  }
}
