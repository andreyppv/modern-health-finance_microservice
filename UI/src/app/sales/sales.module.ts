import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesRoutingModule } from './sales-routing.module';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxMaskModule } from 'ngx-mask';
import { NgxBootstrapIconsModule } from 'ngx-bootstrap-icons';
import { checkCircleFill,arrowClockwise,cloudUploadFill, folderFill, fileEarmarkFill, download, trashFill } from 'ngx-bootstrap-icons';
import { NgxFileDropModule } from 'ngx-file-drop';
import {CompleteComponent} from './complete/complete.component';
import {Page1Component} from './page1/page1.component';
import {Page2Component} from './page2/page2.component';
import {Page3Component} from './page3/page3.component';
import {Page4Component} from './page4/page4.component';
import {UploadComponent} from './upload/upload.component';
import { NewSaleComponent } from './new-sale/new-sale.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { SignatureFieldComponent } from '../signature-field/signature-field.component';
import { SignaturePadModule } from 'angular2-signaturepad';



const icons = {
  checkCircleFill,
  arrowClockwise,
  cloudUploadFill,
  folderFill,
  fileEarmarkFill,
  download,
  trashFill
};

@NgModule({
  declarations: [
    CompleteComponent,
    Page1Component,
    Page2Component,
    Page3Component,
    Page4Component,
    UploadComponent,
    NewSaleComponent,
    PagenotfoundComponent,
    SignatureFieldComponent
  ],
  imports: [
    CommonModule,
    SalesRoutingModule,
    FormsModule,
    NgxBootstrapIconsModule.pick(icons),
    NgxFileDropModule,
    BsDatepickerModule.forRoot(),
    NgxMaskModule.forRoot(),
    SignaturePadModule,
    ReactiveFormsModule
  ],providers:[
  ]
})
export class SalesModule { }
