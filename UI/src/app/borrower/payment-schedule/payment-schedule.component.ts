import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/_service/http.service';
import { first } from 'rxjs/operators';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-payment-schedule',
  templateUrl: './payment-schedule.component.html',
  styleUrls: ['./payment-schedule.component.scss']
})
export class PaymentScheduleComponent implements OnInit {
  data:any={
    payment_details:[],
    paymentScheduleDetails:[],
    next_schedule:null,
    user_details:null,
  }
  loandata={};
  monthDue=0;
  remainingBalance=0;
  nextDuedate=null;
  secondaryColor = "#fff"
  constructor(private service: HttpService, public datePipe: DatePipe) { }

  ngOnInit(): void {
    this.getPaymentDetails();
    this.getloannodetails();
    const mainColor  = localStorage.getItem('mainColor');
    this.secondaryColor = localStorage.getItem('secondaryColor');
    this.service.getMainColor.next({practiceMainColor: mainColor, pacticeSecondaryColor: this.secondaryColor})
  }

  getPaymentDetails(){
    let loanid = sessionStorage.getItem('LoanId');
    this.service.authget("payment-details/"+loanid,"borrower")
    .pipe(first())
    .subscribe(res=>{
      this.addlog("View Payment schedule page",loanid)
      if(res['statusCode']==200){
        console.log('res',res);
        this.data= res['data'];
        if(this.data.next_schedule != null){
          //to get monthDue
          this.monthDue = this.data.next_schedule.amount;
          //to get unpaidprincipal
          this.remainingBalance = this.data.next_schedule.unpaidprincipal;
          //to get nextDuedate
          this.nextDuedate = this.data.next_schedule.scheduledate;
        }
      }
    },err=>{
      console.log(err)
    })
  }

  addlog(module,id){
    this.service.addlog(module,id,"borrower").subscribe(res=>{},err=>{})
  }

  getloannodetails(){
    let loanid = sessionStorage.getItem('LoanId');
    this.service.authget("payment-details/getloandata/"+loanid,"borrower")
    .pipe(first())
    .subscribe(res=>{
      // this.addlog("get Loanno data",loanid)
      if(res['statusCode']==200){
        this.loandata= res['data'];console.log('paypay',this.loandata);
      }
    },err=>{
      console.log(err)
    })
  }

}
