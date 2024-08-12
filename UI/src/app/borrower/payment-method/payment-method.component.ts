import { Component, OnInit,TemplateRef,ViewChild } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.scss']
})
export class PaymentMethodComponent implements OnInit {
  userId = sessionStorage.getItem('UserId');
  data:any={
    bankDetails:[],
    cardDetails:[],
    user_details: null
  }
  modalRef: BsModalRef;
  message:any = [];
  bankAddFields = {}
  debitCardAddFields = {}
  activeBank = null;
  activeCard = null;
  bankChooseFields = {};
  cardChooseFields = {};
  toggleAutoPayFields = {};

  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;

  constructor(
    private modalService: BsModalService, 
    private service: HttpService
  ) { }
  
  ngOnInit(): void {
    this.addlog("View Payment Method page",sessionStorage.getItem('LoanId'))
    this.getBankAndCard()
  }

  changeBankAcct(changeBankAcctTemp:TemplateRef<any>){
    this.modalRef = this.modalService.show(changeBankAcctTemp);
  }

  changeCard(changeCardTemp:TemplateRef<any>){
    this.modalRef = this.modalService.show(changeCardTemp);
  }

  addNewBank(addNewBankTemp:TemplateRef<any>){
    this.modalRef = this.modalService.show(addNewBankTemp);
  }

  addNewCard(addNewCardTemp:TemplateRef<any>){
    this.modalRef = this.modalService.show(addNewCardTemp);
  }

  close(): void {
    this.modalRef.hide();
  }

  getBankAndCard(){
    this.service.authget("payment-method/"+this.userId,"borrower")
    .pipe(first())
    .subscribe(res=>{
      
      if(res['statusCode']==200){  
        console.log(res);              
        this.data = res['data']; 
        let activeBankDetail = this.data.bankDetails.filter((b)=>b.active_flag == 'Y');
        if(activeBankDetail.length){
          this.activeBank = activeBankDetail[0].id;
        }
        let activeCardDetail = this.data.cardDetails.filter((b)=>b.active_flag == 'Y');
        if(activeCardDetail.length){
          this.activeCard = activeCardDetail[0].id;
        }
      }
    },err=>{
      console.log(err)
    })
  }

  debitCardAdd(){     

   let data:any = {}
   data.user_id=this.userId;
    let ex = this.debitCardAddFields['expires']
    data.expires = ex.substring(0, 2)+'/'+ex.substring(2, 4);
    data.agree = this.debitCardAddFields['agree']
    data.billingaddress = this.debitCardAddFields['billingaddress']
    data.cardnumber = Number(this.debitCardAddFields['cardnumber'])
    data.confirm = this.debitCardAddFields['confirm']
    data.csc = Number(this.debitCardAddFields['csc'])
    data.fullname = this.debitCardAddFields['fullname']
   
    this.service.authpost('payment-method/debitcardadd','borrower',data)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log('data', res['data']);
        this.getBankAndCard();
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

  bankAdd(){     
    this.bankAddFields['user_id']=this.userId;
    console.log('bankAddFields', this.bankAddFields); 
    this.service.authpost('payment-method/bankadd','borrower',this.bankAddFields)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log('data', res['data']);
        this.getBankAndCard();
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

  bankChoose(){
    console.log('activeBank', this.activeBank);
    this.bankChooseFields['bank_id']=this.activeBank;
    this.service.authput('payment-method/bankchoose/'+this.userId,'borrower',this.bankChooseFields)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log(res);   
        this.getBankAndCard();     
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
        this.getBankAndCard();      
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

  toggleAutoPay(value){
    console.log(value);
    this.toggleAutoPayFields['value']=value;
    this.service.authput('payment-method/toggleAutoPay/'+this.userId,'borrower',this.toggleAutoPayFields)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log(res);  
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

  addlog(module,id){
    this.service.addlog(module,id,"borrower").subscribe(res=>{},err=>{})
  }
}
