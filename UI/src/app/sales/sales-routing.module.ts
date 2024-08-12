import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CompleteComponent} from './complete/complete.component';
import {Page1Component} from './page1/page1.component';
import {Page2Component} from './page2/page2.component';
import {Page3Component} from './page3/page3.component';
import {Page4Component} from './page4/page4.component';
import {UploadComponent} from './upload/upload.component';
import {LoanidGuard} from '../_guards';
import { NewSaleComponent } from './new-sale/new-sale.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';

const routes: Routes = [ 
  { path:'new', component: NewSaleComponent},
  { path:'complete', component: CompleteComponent,canActivate:[LoanidGuard]},
  { path:'page1', component: Page1Component},
  { path:'page2', component: Page2Component,canActivate:[LoanidGuard]},
  { path:'page3', component: Page3Component,canActivate:[LoanidGuard]},
  { path:'page4', component: Page4Component,canActivate:[LoanidGuard]},
  { path:'upload', component: UploadComponent,canActivate:[LoanidGuard]},
  { path:'404', component: PagenotfoundComponent},
  { path: "**", redirectTo: "404", pathMatch: "full" },  
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule { }
