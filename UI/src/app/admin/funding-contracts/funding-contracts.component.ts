import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-funding-contracts',
  templateUrl: './funding-contracts.component.html',
  styleUrls: ['./funding-contracts.component.scss']
})
export class FundingContractsComponent implements OnInit {
  data:any=[]
  constructor(private service: HttpService) { }

  ngOnInit(): void {
    this.get()
  }

  get(){
    this.service.authget('loanstage/fundingcontract','admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.data= res['data']
      }
    },err=>{
      console.log(err)
    })
  }

}
