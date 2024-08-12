import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentsManagementComponent } from './documents-management/documents-management.component';
import { MakePaymentComponent } from './make-payment/make-payment.component';
import { OverViewComponent } from './over-view/over-view.component';
import { PaymentMethodComponent } from './payment-method/payment-method.component';
import { PaymentScheduleComponent } from './payment-schedule/payment-schedule.component';
import { ToDoListComponent } from './to-do-list/to-do-list.component';
import { VerifyComponent } from './verify/verify.component';
import { LoginComponent } from './login/login.component';
import {borrowerGuard,borrowerloginGuard} from '../_guards';

import { PlaidComponent } from './plaid/plaid.component';


import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SettingsComponent } from './settings/settings.component';
import { TwoFactorAuthComponent } from './two-factor-auth/two-factor-auth.component';
import { InitialNoteComponent } from './initial-note/initial-note.component';

const routes: Routes = [
  { path:'overview', component: OverViewComponent,canActivate:[borrowerGuard]},
  { path:'todo-list', component: ToDoListComponent,canActivate:[borrowerGuard]},
  { path:'payment-schedule', component: PaymentScheduleComponent,canActivate:[borrowerGuard]},
  { path:'make-payment', component: MakePaymentComponent,canActivate:[borrowerGuard]},
  { path:'payment-method', component: PaymentMethodComponent,canActivate:[borrowerGuard]},
  { path:'docs-management', component: DocumentsManagementComponent,canActivate:[borrowerGuard]},
  { path:'verify', component: VerifyComponent},
  { path:'plaid/:id', component: PlaidComponent},
  { path:'login', component: LoginComponent,canActivate:[borrowerloginGuard]},
  { path:'forgot-password', component: ForgotPasswordComponent,canActivate:[borrowerloginGuard]},
  { path:'passwordReset', component: ResetPasswordComponent,canActivate:[borrowerloginGuard]},
  { path:'settings', component: SettingsComponent,canActivate:[borrowerGuard]},
  { path:'twofactorauth', component: TwoFactorAuthComponent,canActivate:[borrowerloginGuard]},
  { path:'promissory-note/:id', component: InitialNoteComponent,canActivate:[borrowerloginGuard]},
  { path: "**", redirectTo: "login", pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BorrowerRoutingModule { }
