import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManualImportComponent } from './manual-import/manual-import.component';
import { UploadFileComponent } from './upload-file/upload-file.component';
import { PendingChequeComponent } from './pending-cheque/pending-cheque.component';
import { ChequeDetailsComponent } from './cheque-details/cheque-details.component';

const routes: Routes = [
  {
    path: 'manual-import',
    component: ManualImportComponent,
    title: 'Manual Cheque Import'
  },
  {
    path: 'upload-file',
    component: UploadFileComponent,
    title: 'Upload File'
  },
  {
    path: 'pending-cheque',
    component: PendingChequeComponent,
    title: 'Pending Cheque'
  },
  {
    path: 'cheque-details/:id',
    component: ChequeDetailsComponent
  },
    {
    path: '',
    redirectTo: 'manual-import',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChequeProcessRoutingModule { }

export const CHEQUE_PROCESS_ROUTES = routes;
