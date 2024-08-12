import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstallerRoutingModule } from './installer-routing.module';
import { MainComponent } from './main/main.component';
import { CustomersComponent } from './customers/customers.component';
import { NgxBootstrapIconsModule } from 'ngx-bootstrap-icons';
import { cloudArrowUpFill,search,currencyDollar,fileEarmarkFill,folderFill } from 'ngx-bootstrap-icons';
import { ApplicationDetailsComponent } from './application-details/application-details.component';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { NgxFileDropModule } from 'ngx-file-drop';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ProfileViewComponent } from './profile-view/profile-view.component';
import { SettingsComponent } from './settings/settings.component';
import { LoginComponent } from './login/login.component';
import { NgxMaskModule } from 'ngx-mask';
import { SignatureFieldComponent } from '../signature-field1/signature-field.component';
import { SignaturePadModule } from 'angular2-signaturepad';
import { UserManagementComponent } from './user-management/user-management.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { InstallInfoComponent } from './install-info/install-info.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TwoFactorAuthComponent } from './two-factor-auth/two-factor-auth.component';
import { TransactionComponent } from './transaction/transaction.component';

const icons = {
  cloudArrowUpFill,
  search,
  currencyDollar,
  fileEarmarkFill,
  folderFill
};



@NgModule({
  declarations: [
    MainComponent,
    CustomersComponent,
    ApplicationDetailsComponent,
    ProfileViewComponent,
    SettingsComponent,
    LoginComponent,
    SignatureFieldComponent,
    UserManagementComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    InstallInfoComponent,
    TwoFactorAuthComponent,
    TransactionComponent
  ],
  imports: [
    CommonModule,
    InstallerRoutingModule,
    NgxBootstrapIconsModule.pick(icons),
    FormsModule,
    BsDatepickerModule.forRoot(),
    NgxFileDropModule,
    NgxMaskModule.forRoot(),
    ReactiveFormsModule,
    SignaturePadModule,
    TabsModule.forRoot(),
  ]
})
export class InstallerModule { }
