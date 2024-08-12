import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './account/login/login.component';
import { RegisterComponent } from './account/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReviewComponent } from './review/review.component';
import { HomeComponent } from './home/home.component';
import { PracticeStartApplicationComponent } from './practice-start-application/practice-start-application.component';
const routes: Routes = [
  { path: 'account/login', component: LoginComponent },
  { path: 'account/register', component: RegisterComponent },
  { path: 'account/emailVerified/:loanid', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'sales',
    loadChildren: () =>
      import('./sales/sales.module').then((m) => m.SalesModule),
  },
  {
    path: 'installer',
    loadChildren: () =>
      import('./installer/installer.module').then((m) => m.InstallerModule),
  },
  {
    path: 'borrower',
    loadChildren: () =>
      import('./borrower/borrower.module').then((m) => m.BorrowerModule),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
  },
  { path: 'review/:id', component: ReviewComponent },
  {
    path: 'startApplication/:practiceid',
    component: PracticeStartApplicationComponent,
  },
  { path: 'startApplication', component: PracticeStartApplicationComponent },
  //{ path: '', component: HomeComponent },
  { path: ':practiceUrl', component: PracticeStartApplicationComponent },
  // { path: '', redirectTo: "home", pathMatch: 'full' },
  { path: '**', redirectTo: 'borrower', pathMatch: 'full' },
];

@NgModule({
  //imports: [RouterModule.forRoot(routes,{scrollPositionRestoration: 'enabled',useHash: true, relativeLinkResolution: "legacy", })],
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
