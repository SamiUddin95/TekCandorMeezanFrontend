// Reusable export report methods for all report components
import Swal from 'sweetalert2';
import { SSRSReportService } from '../services/ssrs-report.service';

export class ExportReportHelper {
  static exportReport(
    ssrsService: SSRSReportService,
    reportType: 'BranchWise' | 'Final' | 'CBC' | 'ReturnMemo' | 'ReturnRegister' | 'InwardClearing' | 'ClearingLog',
    format: 'PDF' | 'EXCEL' | 'CSV',
    parameters: { [key: string]: any },
    subscriptions: any
  ): void {
    Swal.fire({
      title: 'Exporting...',
      text: `Please wait while we export the ${format} report.`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    let exportMethod;
    switch (reportType) {
      case 'BranchWise':
        exportMethod = ssrsService.exportBranchWiseReport(format, parameters);
        break;
      case 'Final':
        exportMethod = ssrsService.exportFinalReport(format, parameters);
        break;
      case 'CBC':
        exportMethod = ssrsService.exportCBCReport(format, parameters);
        break;
      case 'ReturnMemo':
        exportMethod = ssrsService.exportReturnMemoReport(format, parameters);
        break;
      case 'ReturnRegister':
        exportMethod = ssrsService.exportReturnRegisterReport(format, parameters);
        break;
      case 'InwardClearing':
        exportMethod = ssrsService.exportInwardClearingReport(format, parameters);
        break;
      case 'ClearingLog':
        exportMethod = ssrsService.exportClearingLogReport(format, parameters);
        break;
    }

    subscriptions.add(
      exportMethod.subscribe({
        next: (httpResponse: any) => {
          Swal.close();
          console.log('SSRS HttpResponse:', httpResponse);
          
          if (httpResponse.status === 200) {
            const response = httpResponse.body;
            
            if (response && response.status === 'success' && response.data && response.data.fileData) {
              ExportReportHelper.downloadReportFile(ssrsService, response.data.fileData, format, response.data.fileName, reportType);
            } else if (httpResponse.body instanceof Blob) {
              ExportReportHelper.downloadBlobFile(httpResponse.body, format, reportType);
            } else if (typeof response === 'string' && response.length > 100) {
              ExportReportHelper.downloadReportFile(ssrsService, response, format, undefined, reportType);
            } else {
              console.log('Unexpected response structure:', response);
              Swal.fire({
                icon: 'error',
                title: 'Export Failed',
                text: 'Unexpected response format from server. Please check console for details.'
              });
            }
          } else {
            console.log('HTTP Error Response:', httpResponse);
            Swal.fire({
              icon: 'error',
              title: 'Export Failed',
              text: `Server returned status: ${httpResponse.status}`
            });
          }
        },
        error: (error: any) => {
          Swal.close();
          console.error('Export error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Export Failed',
            text: 'An error occurred while exporting the report. Please try again.'
          });
        }
      })
    );
  }

  private static downloadReportFile(
    ssrsService: SSRSReportService,
    base64Data: string,
    format: string,
    fileName: string | undefined,
    reportType: string
  ): void {
    let contentType = '';
    let fileExtension = '';
    
    switch (format) {
      case 'PDF':
        contentType = 'application/pdf';
        fileExtension = '.pdf';
        break;
      case 'EXCEL':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = '.xlsx';
        break;
      case 'CSV':
        contentType = 'text/csv';
        fileExtension = '.csv';
        break;
    }

    const finalFileName = fileName || `${reportType}Report_${new Date().toISOString().split('T')[0]}${fileExtension}`;
    ssrsService.downloadFile(base64Data, finalFileName, contentType);

    Swal.fire({
      icon: 'success',
      title: 'Export Successful',
      text: `The ${format} report has been downloaded successfully.`,
      timer: 2000,
      showConfirmButton: false
    });
  }

  private static downloadBlobFile(blob: Blob, format: string, reportType: string): void {
    let fileExtension = '';
    
    switch (format) {
      case 'PDF':
        fileExtension = '.pdf';
        break;
      case 'EXCEL':
        fileExtension = '.xlsx';
        break;
      case 'CSV':
        fileExtension = '.csv';
        break;
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}Report_${new Date().toISOString().split('T')[0]}${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    Swal.fire({
      icon: 'success',
      title: 'Export Successful',
      text: `The ${format} report has been downloaded successfully.`,
      timer: 2000,
      showConfirmButton: false
    });
  }
}
