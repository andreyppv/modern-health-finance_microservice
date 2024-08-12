import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxMaskModule } from 'ngx-mask';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminRoutingModule } from './admin-routing.module';
import { QuestionsComponent } from './questions/questions.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { PendingsComponent } from './pendings/pendings.component';
import { PendingsdetailsComponent } from './pendingsdetails/pendingsdetails.component';
import { DataTablesModule } from 'angular-datatables';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { IncompleteComponent } from './incomplete/incomplete.component';
import { IncompletedetailsComponent } from './incompletedetails/incompletedetails.component';
import { ApprovedComponent } from './approved/approved.component';
import { ApproveddetailsComponent } from './approveddetails/approveddetails.component';
import { DeniedComponent } from './denied/denied.component';
import { DenieddetailsComponent } from './denieddetails/denieddetails.component';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { UsersComponent } from './users/users.component';
import { UsersdetailsComponent } from './usersdetails/usersdetails.component';
import { StartApplicationComponent } from './start-application/start-application.component';
import { NgxFileDragDropModule } from 'ngx-file-drag-drop';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { NotificationComponent } from './notification/notification.component';
import { RolesComponent } from './roles/roles.component';
import { RolespermissionComponent } from './rolespermission/rolespermission.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { AuditlogComponent } from './auditlog/auditlog.component';
//import {DecisionEngineComponent } from './decision-engine/decision-engine.component';
import { MilestoneFundSetComponent } from './milestone-fund-set/milestone-fund-set.component';
import { AdminSecurityComponent } from './admin-security/admin-security.component';
import { TwoFactorAuthComponent } from './two-factor-auth/two-factor-auth.component';
import { LoginLogComponent } from './login-log/login-log.component';
import { FundingContractsComponent } from './funding-contracts/funding-contracts.component';
import { FundingContractsDetailsComponent } from './funding-contracts-details/funding-contracts-details.component';
import { LoanStagesComponent } from './loan-stages/loan-stages.component';
import { LoanStagesDetailsComponent } from './loan-stages-details/loan-stages-details.component';
import { FullCalendarModule } from '@fullcalendar/angular'; // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction'; // a plugin!
import listPlugin from '@fullcalendar/list';
import { PatientListComponent } from './patient-list/patient-list.component';
import { PatientManagementComponent } from './patient-management/patient-management.component';
import { PracticeManagementComponent } from './practice-management/practice-management.component';
import { PracticeSettingsComponent } from './practice-settings/practice-settings.component';
import { PracticeAdminComponent } from './practice-admin/practice-admin.component'; // a plugin!
import { ContractSingatureComponent } from './contract-singature/contract-singature.component';
import { SignaturePadModule } from 'angular2-signaturepad';
import { PracticeRulesComponent } from './practice-rules/practice-rules.component';
import { DecisionEngineComponent } from './decision-engine/decision-engine.component';

FullCalendarModule.registerPlugins([
  // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin,
  listPlugin,
]);

@NgModule({
  declarations: [
    DashboardComponent,
    QuestionsComponent,
    LoginComponent,
    PendingsComponent,
    PendingsdetailsComponent,
    IncompleteComponent,
    IncompletedetailsComponent,
    ApprovedComponent,
    ApproveddetailsComponent,
    DeniedComponent,
    DenieddetailsComponent,
    UsersComponent,
    UsersdetailsComponent,
    StartApplicationComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    NotificationComponent,
    RolesComponent,
    RolespermissionComponent,
    AuditlogComponent,
    ContractSingatureComponent,
    //DecisionEngineComponent,
    StartApplicationComponent,
    MilestoneFundSetComponent,
    AdminSecurityComponent,
    TwoFactorAuthComponent,
    LoginLogComponent,
    FundingContractsComponent,
    FundingContractsDetailsComponent,
    LoanStagesComponent,
    LoanStagesDetailsComponent,
    PatientListComponent,
    PatientManagementComponent,
    PracticeManagementComponent,
    PracticeSettingsComponent,
    PracticeAdminComponent,
    PracticeRulesComponent,
    DecisionEngineComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    DataTablesModule,
    TabsModule.forRoot(),
    AccordionModule.forRoot(),
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    SignaturePadModule,
    NgxMaskModule.forRoot(),
    NgxFileDragDropModule,
    AngularMultiSelectModule,
    FullCalendarModule, // register FullCalendar with you app
  ],
  schemas: [],
})
export class AdminModule {}
