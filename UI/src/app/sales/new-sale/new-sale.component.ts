import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-new-sale',
  templateUrl: './new-sale.component.html',
  styleUrls: ['./new-sale.component.scss']
})
export class NewSaleComponent implements OnInit {

  constructor(private route: ActivatedRoute, public router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // console.log(params);
      if(params.loan_amount && params.loan_term && params.apr){
        sessionStorage.setItem('LoanAmount', params.loan_amount)
        sessionStorage.setItem('LoanTerm', params.loan_term)
        sessionStorage.setItem('Apr', params.apr)
        this.router.navigate(['sales/page1']);
      }else{
        this.router.navigate(['sales/404']);
      }      
    })
    
  }
}
