import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerRefresh, tablerSearch } from '@ng-icons/tabler-icons';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import { SafeUrlPipe } from '../../../../../../pipes/safe-url.pipe';

@Component({
  selector: 'app-outward-approved-report',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, SpinnerComponent, SafeUrlPipe],
  providers: [provideIcons({ tablerRefresh, tablerSearch })],
  templateUrl: './outward-approved-report.component.html',
  styleUrls: ['./outward-approved-report.component.scss']
})
export class OutwardApprovedReportComponent implements OnInit {

  // Filter properties
  fromDate: string = '';
  toDate: string = '';

  // Report display
  showReport = false;
  reportUrl = '';
  isReportLoading = false;

  // private readonly ssrsBaseUrl = 'http://muhammad-ameen/ReportServer/Pages/ReportViewer.aspx?%2fSSRS_Reports%2fOutwardApproved&rs:Command=Render';
   private readonly ssrsBaseUrl = 'http://localhost/Reports/report/SSRS_Reports/OutwardApproved';

  constructor() {}

  ngOnInit(): void {}

  onSearch(): void {
    debugger;
    if (!this.fromDate || !this.toDate) {
      return;
    }
    let url = this.ssrsBaseUrl;
    if (this.fromDate) url += `&FromDate=${encodeURIComponent(this.fromDate)}`;
    if (this.toDate) url += `&ToDate=${encodeURIComponent(this.toDate)}`;
    url += '&rs:Embed=true&rc:Toolbar=true&rc:Parameters=false';
    this.isReportLoading = true;
    this.showReport = true;
    this.reportUrl = url;
  }

  onReportLoad(): void {
    this.isReportLoading = false;
  }

  onReset(): void {
    this.fromDate = '';
    this.toDate = '';
    this.showReport = false;
    this.reportUrl = '';
    this.isReportLoading = false;
  }
}
