import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { HttpService } from 'src/app/_service/http.service';
import { first } from 'rxjs/operators';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-make-payment',
  templateUrl: './make-payment.component.html',
  styleUrls: ['./make-payment.component.scss']
})
export class MakePaymentComponent implements OnInit {
  userId = sessionStorage.getItem('UserId');
  loanid = sessionStorage.getItem('LoanId');
  modalRef: BsModalRef;
  message:any = [];
  activeBankDetail = [];
  activeCardDetail = [];
  activeBank = null;
  activeCard = null;
  bankChooseFields = {};
  cardChooseFields = {};
  data:any={
    payment_details:[],
    next_schedule:null
  }
  data1:any={
    bank_details:[],
    card_details:[]
  }
  monthDue=0;
  payOff=0;
  remainingBalance=0;
  nextDuedate=null;
  paymentstatus:any = {};

  // lv_projectStatus = [];

  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;

  constructor(
    private service: HttpService,
    private modalService: BsModalService,
    public datePipe: DatePipe,
    public decimalPipe: DecimalPipe
  ) { }

  ngOnInit(): void {
    this.addlog("View Make Payment page",sessionStorage.getItem('LoanId'))
    this.getBankAndCard()
    this.getPaymentDetails()
    // this.getProjectStatus()
  }

  changeBankAcct(changeBankAcctTemp:TemplateRef<any>){
    this.modalRef = this.modalService.show(changeBankAcctTemp);
  }

  changeCard(changeCardTemp:TemplateRef<any>){
    this.modalRef = this.modalService.show(changeCardTemp);
  }

  close(): void {
    this.modalRef.hide();
  }

  // getProjectStatus(){
  //   this.service.authget("make-payment/projectStatus/"+this.loanid,"borrower")
  //   .pipe(first())
  //   .subscribe(res=>{
  //     if(res['statusCode']==200){
  //       console.log(res);
  //       this.lv_projectStatus = res['data'].projectStatus
  //     }
  //   },err=>{
  //     console.log(err)
  //   })
  // }

  getBankAndCard(){
    this.service.authget("payment-method/"+this.userId,"borrower")
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log(res);
        this.data1 = res['data'];
        this.activeBankDetail = this.data1.bankDetails.filter((b)=>b.active_flag == 'Y');
        if(this.activeBankDetail.length){
          this.activeBank = this.activeBankDetail[0].id;
        }
        this.activeCardDetail = this.data1.cardDetails.filter((b)=>b.active_flag == 'Y');
        if(this.activeCardDetail.length){
          this.activeCard = this.activeCardDetail[0].id;
        }
        // console.log('activeBankDetail',this.activeBankDetail);
      }
    },err=>{
      console.log(err)
    })
  }

  getPaymentDetails(){
    let loanid = sessionStorage.getItem('LoanId');
    this.service.authget("payment-details/"+loanid,"borrower")
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log('data', res);
        this.data= res['data'];
        if(this.data.next_schedule != null){
          //to get monthDue
          this.monthDue = this.data.next_schedule.amount;
          //to get 6 months payOff
          this.payOff = 6 * this.data.next_schedule.amount;
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

  bankChoose(){
    console.log('activeBank', this.activeBank);
    this.bankChooseFields['bank_id']=this.activeBank;
    this.service.authput('payment-method/bankchoose/'+this.userId,'borrower',this.bankChooseFields)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log(res);
        this.getBankAndCard()
        this.modalRef.hide();
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
    })
  }

  cardChoose(){
    console.log('activeCard', this.activeCard);
    this.cardChooseFields['card_id']=this.activeCard;
    this.service.authput('payment-method/cardchoose/'+this.userId,'borrower',this.cardChooseFields)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log(res);
        this.getBankAndCard()
        this.modalRef.hide();
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
    })
  }

  paycard(paymentSuccess: TemplateRef<any>){
    let loanid = sessionStorage.getItem('LoanId');
    this.service.authget("payment-method/cardpayment/"+this.activeCardDetail[0].loanpayment_paymentmethodtoken+"/"+loanid,"borrower")
    .pipe(first())
    .subscribe(res=>{
      this.paymentstatus=res
        this.modalRef = this.modalService.show(paymentSuccess);
        this.getPaymentDetails()
    },err=>{
      console.log(err)
    })
    //this.modalRef = this.modalService.show(paymentSuccess);
  }

  addlog(module,id){
    this.service.addlog(module,id,"borrower").subscribe(res=>{},err=>{})
  }

}
