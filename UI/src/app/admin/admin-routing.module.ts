import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { QuestionsComponent } from './questions/questions.component';
import { LoginComponent } from './login/login.component';
import { adminGuard, adminloginGuard, AdminPagesGuard } from '../_guards';
import { PendingsComponent } from './pendings/pendings.component';
import { PendingsdetailsComponent } from './pendingsdetails/pendingsdetails.component';
import { IncompleteComponent } from './incomplete/incomplete.component';
import { StartApplicationComponent } from './start-application/start-application.component';
import { IncompletedetailsComponent } from './incompletedetails/incompletedetails.component';
import { ApprovedComponent } from './approved/approved.component';
import { ApproveddetailsComponent } from './approveddetails/approveddetails.component';
import { DeniedComponent } from './denied/denied.component';
import { DenieddetailsComponent } from './denieddetails/denieddetails.component';
import { UsersComponent } from './users/users.component';
import { UsersdetailsComponent } from './usersdetails/usersdetails.component';

import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { NotificationComponent } from './notification/notification.component';
import { RolesComponent } from './roles/roles.component';
import { RolespermissionComponent } from './rolespermission/rolespermission.component';
import { AuditlogComponent } from './auditlog/auditlog.component';
import { DecisionEngineComponent } from './decision-engine/decision-engine.component';
import { MilestoneFundSetComponent } from './milestone-fund-set/milestone-fund-set.component';
import { AdminSecurityComponent } from './admin-security/admin-security.component';
import { TwoFactorAuthComponent } from './two-factor-auth/two-factor-auth.component';
import { LoginLogComponent } from './login-log/login-log.component';
import { FundingContractsComponent } from './funding-contracts/funding-contracts.component';
import { FundingContractsDetailsComponent } from './funding-contracts-details/funding-contracts-details.component';
import { LoanStagesComponent } from './loan-stages/loan-stages.component';
import { LoanStagesDetailsComponent } from './loan-stages-details/loan-stages-details.component';
import { PatientListComponent } from './patient-list/patient-list.component';
import { PatientManagementComponent } from './patient-management/patient-management.component';
import { PracticeManagementComponent } from './practice-management/practice-management.component';
import { PracticeSettingsComponent } from './practice-settings/practice-settings.component';
import { PracticeAdminComponent } from './practice-admin/practice-admin.component';
import { ContractSingatureComponent } from './contract-singature/contract-singature.component';
import { PracticeRulesComponent } from './practice-rules/practice-rules.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  { path: 'login', component: LoginComponent, canActivate: [adminloginGuard] },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [adminloginGuard],
  },
  {
    path: 'passwordReset',
    component: ResetPasswordComponent,
    canActivate: [adminloginGuard],
  },
  {
    path: 'settings/questions',
    component: QuestionsComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  {
    path: 'pendings',
    component: PendingsComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  {
    path: 'pendings/:id',
    component: PendingsdetailsComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  {
    path: 'incomplete',
    component: IncompleteComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  {
    path: 'incomplete/:id',
    component: IncompletedetailsComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  {
    path: 'start-application',
    component: StartApplicationComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  {
    path: 'approved',
    component: ApprovedComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  {
    path: 'approved/:id',
    component: ApproveddetailsComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  {
    path: 'denied',
    component: DeniedComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  {
    path: 'denied/:id',
    component: DenieddetailsComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  {
    path: 'users',
    component: UsersComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  {
    path: 'users/:id',
    component: UsersdetailsComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  {
    path: 'settings/admin-security',
    component: AdminSecurityComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  {
    path: 'notification',
    component: NotificationComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  {
    path: 'settings/roles',
    component: RolesComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  {
    path: 'settings/roles/:id',
    component: RolespermissionComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  {
    path: 'settings/auditlog',
    component: AuditlogComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  {
    path: 'settings/decisionengine',
    component: DecisionEngineComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  //{path:'settings/decisionengine',component:DecisionEngineComponent,canActivate:[adminGuard,AdminPagesGuard]},
  {
    path: 'settings/milestone-fund-set',
    component: MilestoneFundSetComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  {
    path: 'start-application',
    component: StartApplicationComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  {
    path: 'twofactorauth',
    component: TwoFactorAuthComponent,
    canActivate: [adminloginGuard],
  },
  {
    path: 'login-log',
    component: LoginLogComponent,
    canActivate: [adminGuard, AdminPagesGuard],
  },
  {
    path: 'funding-contracts',
    component: FundingContractsComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'funding-contracts/:id',
    component: FundingContractsDetailsComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'loan-stages/:stage',
    component: LoanStagesComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'loan-stages/:stage/:id',
    component: LoanStagesDetailsComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'promissory-note/:loan_id',
    component: ContractSingatureComponent,
  },
  { path: 'patient-list', component: PatientListComponent, canActivate: [adminGuard] },
  { path: 'practice-management', component: PracticeManagementComponent, canActivate: [adminGuard] },
  { path: 'practice-settings', component: PracticeSettingsComponent, canActivate: [adminGuard] },
  { path: 'practice-admin', component: PracticeAdminComponent, canActivate: [adminGuard] },
  { path: 'practice-rules', component: PracticeRulesComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
