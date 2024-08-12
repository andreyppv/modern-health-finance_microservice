import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from "angular-datatables";
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { BorrowerRoutingModule } from './borrower-routing.module';
import { OverViewComponent } from './over-view/over-view.component';
import { ToDoListComponent } from './to-do-list/to-do-list.component';
import { PaymentScheduleComponent } from './payment-schedule/payment-schedule.component';
import { MakePaymentComponent } from './make-payment/make-payment.component';
import { PaymentMethodComponent } from './payment-method/payment-method.component';
import { DocumentsManagementComponent } from './documents-management/documents-management.component';
import { LoginComponent } from './login/login.component';
import { VerifyComponent } from './verify/verify.component';
import { NgxFileDropModule } from 'ngx-file-drop';
import { NgxMaskModule } from 'ngx-mask';
import { PlaidComponent } from './plaid/plaid.component';
import { NgxPlaidLinkModule } from "ngx-plaid-link";

import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SettingsComponent } from './settings/settings.component';
import { TwoFactorAuthComponent } from './two-factor-auth/two-factor-auth.component';
import { InitialNoteComponent } from './initial-note/initial-note.component';

import { SignatureFieldComponent } from '../signature-field2/signature-field.component';
import { SignaturePadModule } from 'angular2-signaturepad';

@NgModule({
  declarations: [
    OverViewComponent,
    ToDoListComponent,
    PaymentScheduleComponent,
    MakePaymentComponent,
    PaymentMethodComponent,
    DocumentsManagementComponent,
    LoginComponent,
    VerifyComponent,
    PlaidComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    SettingsComponent,
    TwoFactorAuthComponent,
    InitialNoteComponent,
    SignatureFieldComponent
  ],
  imports: [
    CommonModule,
    BorrowerRoutingModule,
    DataTablesModule,
    TabsModule.forRoot(),
    NgxMaskModule.forRoot(),
    FormsModule,
    NgxFileDropModule,
    ReactiveFormsModule,
    NgxPlaidLinkModule,
    SignaturePadModule
  ]
})
export class BorrowerModule { }
