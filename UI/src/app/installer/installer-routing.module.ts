import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { CustomersComponent } from './customers/customers.component';

import { ApplicationDetailsComponent } from './application-details/application-details.component';
import { ProfileViewComponent } from './profile-view/profile-view.component';
import { SettingsComponent } from './settings/settings.component';
import { LoginComponent } from './login/login.component';
import {installerGuard,installerloginGuard,InstallerPagesGuard} from '../_guards';
import { UserManagementComponent } from './user-management/user-management.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { InstallInfoComponent } from './install-info/install-info.component';
import { TwoFactorAuthComponent } from './two-factor-auth/two-factor-auth.component';
import { TransactionComponent } from './transaction/transaction.component';

const routes: Routes = [
  { path:'login', component: LoginComponent,canActivate:[installerloginGuard]},
  { path:'forgot-password', component: ForgotPasswordComponent,canActivate:[installerloginGuard]},
  { path:'passwordReset', component: ResetPasswordComponent,canActivate:[installerloginGuard]},
  { path:'main', component: MainComponent,canActivate:[installerGuard,InstallerPagesGuard]},
  { path:'customers', component: CustomersComponent,canActivate:[installerGuard,InstallerPagesGuard]},

  { path:'main/applicationdetails/:id', component: ApplicationDetailsComponent,canActivate:[installerGuard,InstallerPagesGuard]},
  { path:'main/applicationdetails/:id/i_info', component: InstallInfoComponent,canActivate:[installerGuard,InstallerPagesGuard]},
  { path:'profile', component: ProfileViewComponent,canActivate:[installerGuard,InstallerPagesGuard]},
  { path:'profile/settings', component: SettingsComponent,canActivate:[installerGuard,InstallerPagesGuard]},
  { path:'profile/usermanagement', component: UserManagementComponent,canActivate:[installerGuard,InstallerPagesGuard]},
  { path:'twofactorauth', component: TwoFactorAuthComponent,canActivate:[installerloginGuard]},
  { path:'transaction', component: TransactionComponent,canActivate:[installerGuard]},
  { path: "**", redirectTo: "login", pathMatch: "full" },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InstallerRoutingModule { }
