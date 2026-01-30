import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalRecords: number = 0;
  @Input() pageSizeOptions: number[] = [10, 15, 20, 25, 50, 100];
  
  @Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();

  totalPages: number = 0;
  startRecord: number = 0;
  endRecord: number = 0;
  pages: number[] = [];

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
    this.startRecord = (this.currentPage - 1) * this.pageSize + 1;
    this.endRecord = Math.min(this.currentPage * this.pageSize, this.totalRecords);
    
    // Generate page numbers
    this.pages = this.generatePageNumbers();
  }

  generatePageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 3;
    
    if (this.totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than or equal to max visible
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Complex ellipsis logic for large page counts
      if (this.currentPage <= 3) {
        // Show first few pages when current page is near start
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        // Add ellipsis and last page if not already included
        if (this.totalPages > 3 && pages[pages.length - 1] < this.totalPages - 1) {
          pages.push(this.totalPages);
        }
      } else if (this.currentPage >= this.totalPages - 2) {
        // Show last few pages when current page is near end
        pages.push(1); // Always show first page
        for (let i = this.totalPages - 2; i <= this.totalPages; i++) {
          if (i > 1) { // Avoid duplicate page 1
            pages.push(i);
          }
        }
      } else {
        // Show pages around current page - exactly 2 numbers in middle
        pages.push(1); // Always show first page
        pages.push(this.currentPage - 1); // Previous page
        pages.push(this.currentPage); // Current page
        pages.push(this.totalPages); // Always show last page
      }
    }
    
    return pages;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit({ page, pageSize: this.pageSize });
    }
  }

  onPageSizeChange(newPageSize: number): void {
    // Reset to first page when page size changes
    const newPage = 1;
    this.pageChange.emit({ page: newPage, pageSize: newPageSize });
  }

  onPrevious(): void {
    if (this.currentPage > 1) {
      this.onPageChange(this.currentPage - 1);
    }
  }

  onNext(): void {
    if (this.currentPage < this.totalPages) {
      this.onPageChange(this.currentPage + 1);
    }
  }

  onFirst(): void {
    if (this.currentPage > 1) {
      this.onPageChange(1);
    }
  }

  onLast(): void {
    if (this.currentPage < this.totalPages) {
      this.onPageChange(this.totalPages);
    }
  }

  // Helper methods for template
  get canGoFirst(): boolean {
    return this.currentPage > 1;
  }

  get canGoPrevious(): boolean {
    return this.currentPage > 1;
  }

  get canGoNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  get canGoLast(): boolean {
    return this.currentPage < this.totalPages;
  }

  get showFirstEllipsis(): boolean {
    return this.totalPages > 5 && this.currentPage > 3;
  }

  get showLastEllipsis(): boolean {
    return this.pages.length > 0 && this.pages[this.pages.length - 1] < this.totalPages - 1;
  }
}
