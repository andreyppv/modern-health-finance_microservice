import { Component, OnInit } from '@angular/core';
import { HttpService} from '../_service/http.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-borrower-sidebar',
  templateUrl: './borrower-sidebar.component.html',
  styleUrls: ['./borrower-sidebar.component.scss']
})
export class BorrowerSidebarComponent implements OnInit {

  constructor(private service:HttpService, public router:Router) { }

  ngOnInit(): void {
  }

  logout(){
    this.service.logout()
  }

  plaid(){
    this.router.navigate(['borrower/plaid/'+sessionStorage.getItem('LoanId')]);
  }
}
