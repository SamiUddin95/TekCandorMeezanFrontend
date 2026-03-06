import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';

// Components
import { ManualImportComponent } from './manual-import/manual-import.component';
import { UploadFileComponent } from './upload-file/upload-file.component';
import { PendingChequeComponent } from './pending-cheque/pending-cheque.component';
import { ChequeDetailsComponent } from './cheque-details/cheque-details.component';
// Callback components are standalone

// Icons
import {
  tablerSearch,
  tablerFilter,
  tablerRefresh,
  tablerEye,
  tablerEdit,
  tablerTrash,
  tablerCe,
  tablerBuilding,
  tablerUser,
  tablerCalendar,
  tablerClock,
  tablerCheck,
  tablerX,
  tablerArrowLeft,
  tablerPencil,
  tablerUpload,
  tablerFileUpload,
  tablerPhoneCall
} from '@ng-icons/tabler-icons';

// Shared Components will be handled dynamically

@NgModule({
  declarations: [
    ManualImportComponent,
    UploadFileComponent,
    PendingChequeComponent,
    ChequeDetailsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([]),
    NgIcon
  ],
  providers: [
    provideIcons({
      tablerSearch,
      tablerFilter,
      tablerRefresh,
      tablerEye,
      tablerEdit,
      tablerTrash,
      tablerCe,
      tablerBuilding,
      tablerUser,
      tablerCalendar,
      tablerClock,
      tablerCheck,
      tablerX,
      tablerArrowLeft,
      tablerPencil,
      tablerUpload,
      tablerFileUpload,
      tablerPhoneCall
    })
  ],
  exports: [
    ManualImportComponent,
    UploadFileComponent,
    PendingChequeComponent,
    ChequeDetailsComponent
  ]
})
export class ChequeProcessModule { }
