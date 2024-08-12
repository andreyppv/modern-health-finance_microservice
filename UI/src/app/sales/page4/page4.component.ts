import { Component, OnInit,TemplateRef } from '@angular/core';
import { Router } from "@angular/router";
import {  CurrencyPipe} from '@angular/common';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-page4',
  templateUrl: './page4.component.html',
  styleUrls: ['./page4.component.scss']
})
export class Page4Component implements OnInit {
  f1:any ={}
  income1:any = true;
  income2:any = false;
  language1:any = true;
  language2:any = false;
  savedata:any = {};
  modalRef: BsModalRef;
  constructor(private modalService: BsModalService,public router:Router,private currencyPipe : CurrencyPipe,private service: HttpService) { }

  ngOnInit(): void {
    window.top.postMessage(4,'*');
    this.f1.homeoccupancy="Primary";
    this.f1.homeOwnership="Not Owned";
  }

  number(data){
    return data.target.value = data.target.value.replace(/[^0-9.]/g,'')
  }
  changeincome1(){
    this.income2 = false;
    this.income1 = true;
  }
  changeincome2(){
    this.income1 = false;
    this.income2 = true;
  }

  changelanguage1(){
    this.language2 = false;
    this.language1 = true;
  }
  changelanguage2(){
    this.language1 = false;
    this.language2 = true;
  }

  onSubmit(template: TemplateRef<any>) {
    if(this.income1){
      this.savedata.incomesource = true
    }else{
      this.savedata.incomesource = false
    }
  
    if(this.f1.income){
      this.savedata.income=this.getamount(this.f1.income);
    }

    if(this.f1.yearsemployed){
      this.savedata.yearsemployed=Number(this.f1.yearsemployed);
    }
    if(this.f1.monthsemployed){
      this.savedata.monthsemployed=Number(this.f1.monthsemployed);
    }
    this.savedata.workstatus=this.f1.workstatus;
    this.savedata.employer=this.f1.employer;
    this.savedata.jobtitle=this.f1.jobtitle;
    
    
    this.savedata.homeoccupancy=this.f1.homeoccupancy;
    this.savedata.homeOwnership=this.f1.homeOwnership;
    
    if(this.language1){
      this.savedata.spokenlanguage="english";
    }else{
      this.savedata.spokenlanguage="spanish";  
    }
   
    this.modalRef = this.modalService.show(template);
    //this.router.navigate(['sales/upload']);
  }

  transformAmount(data){
    let v = data.target.value.split('.')
    if(v.length>2){
      return "";
    }
    return this.currencyPipe.transform(data.target.value, '$');

}

close(): void {
  this.modalRef.hide();
  this.savedata.loan_id = sessionStorage.getItem("Loan_ID")
  this.service.post("application-form2","sales",this.savedata)
      .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){
          sessionStorage.setItem('Loan_ID',res['Loan_ID'])
          this.router.navigate(['sales/upload']);
        }
      },err=>{
        console.log(err)
      })
}




getamount(data){
  return Number(data.replace(",","").replace("$",""))
}

}
