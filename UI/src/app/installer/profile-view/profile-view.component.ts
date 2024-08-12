import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { HttpService } from 'src/app/_service/http.service';

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit {
  installer_id = sessionStorage.getItem('InstallerUserId');
  main_installer_id = sessionStorage.getItem('MainInstallerId');

  profileImgUrl='';

  data={
    profileImage:null,
    profileDetails:null,
    profileStatistics:null,
    bankDetails:[],
    cardDetails:[],
  }
  loansInstalled:number = 0;
  loansDone:number = 0;
  applicationsCompleted:number = 0;

  modalRef: BsModalRef;
  message:any = [];
  tabs:any = {
    "Settings":false,
    "Equipment Settings":false,
    "User Managment":false
  }

  bankAddFields:any = {}
  activeBank = null;
  activeCard = null;
  bankChooseFields = {};
  debitCardAddFields:any = {}
  cardChooseFields = {};

  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;

  constructor(
    public router:Router,
    private service: HttpService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    let pages = sessionStorage.getItem('pages')
    let tabs = sessionStorage.getItem('tabs')
    console.log(tabs)
    if(pages){
      pages = JSON.parse(pages)
      for (let i = 0; i < pages.length; i++) {
        if(pages[i]['name']=='Profile'){
          if(tabs){
            tabs = JSON.parse(tabs)
            console.log(tabs[pages[i]['id']])
            for (let j = 0; j < tabs[pages[i]['id']].length; j++) {
              console.log(tabs[pages[i]['id']][j]['name'])
              this.tabs[tabs[pages[i]['id']][j]['name']]=true;
            }
            i = pages.length+1
          }
        }
      }
      console.log(this.tabs)
    }
    this.getProfileDetails()
  }

  getProfileDetails(){
    this.service.authget('profile/'+this.installer_id,'installer')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log('res', res['data']);
        this.data=res['data'];
        if(this.data.profileImage){
          let imageUrl = this.data.profileImage.filename.substring(this.data.profileImage.filename.lastIndexOf('/')+1);
          this.viewProfileImage(imageUrl)
        }
        if(res['data'].profileStatistics.length>0){
          for(let i=0;i<res['data'].profileStatistics.length;i++){
            if(res['data'].profileStatistics[i].status=='projectCompleted'){
              this.loansInstalled = res['data'].applicationsCount[i].count
            }else if(res['data'].profileStatistics[i].status=='milestone3Completed'){
              this.loansDone = res['data'].applicationsCount[i].count
            }else if(res['data'].profileStatistics[i].status=='verifiedAndApproved'){
              this.applicationsCompleted = res['data'].applicationsCount[i].count
            }
          }
        }

        let activeBankDetail = this.data.bankDetails.filter((b)=>b.active_flag == 'Y');
        if(activeBankDetail.length){
          this.activeCard = null;
          this.activeBank = activeBankDetail[0].id;
        }
        let activeCardDetail = this.data.cardDetails.filter((b)=>b.active_flag == 'Y');
        if(activeCardDetail.length){
          this.activeBank = null;
          this.activeCard = activeCardDetail[0].id;
        }

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

  viewProfileImage(imageUrl){
    this.service.authget("profile/profileimage/"+imageUrl,"installer")
      .pipe(first())
      .subscribe(res=>{
        console.log(res);
        this.profileImgUrl = res['url'];
      },err=>{
        console.log(err)
      })
  }

  goToSettings(){
    this.router.navigate(['installer/profile/settings']);
  }

  goUserMgmt(){
    this.router.navigate(['installer/profile/usermanagement']);
  }

  close(): void {
    this.modalRef.hide();
  }

  // addNewBank(addNewBankTemp:TemplateRef<any>){
  //   this.modalRef = this.modalService.show(addNewBankTemp);
  // }

  // changeBankAcct(changeBankAcctTemp:TemplateRef<any>){
  //   this.modalRef = this.modalService.show(changeBankAcctTemp);
  // }

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

  // close(): void {
  //   this.modalRef.hide();
  // }

  bankAdd(){
    this.modalRef.hide();

    this.bankAddFields['user_id']=this.installer_id;
    console.log('bankAddFields', this.bankAddFields);
    this.service.authpost('payment-method/bankadd','installer',this.bankAddFields)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.getProfileDetails()
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
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
    this.service.authput('payment-method/bankchoose/'+this.installer_id,'installer',this.bankChooseFields)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log(res);
        this.activeCard = null;
        this.getProfileDetails()
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

  debitCardAdd(){

    let data:any = {}
    data.user_id=this.installer_id;
     let ex = this.debitCardAddFields['expires']
     data.expires = ex.substring(0, 2)+'/'+ex.substring(2, 4);
     data.agree = this.debitCardAddFields['agree']
     data.billingaddress = this.debitCardAddFields['billingaddress']
     data.cardnumber = Number(this.debitCardAddFields['cardnumber'])
     data.confirm = this.debitCardAddFields['confirm']
     data.csc = Number(this.debitCardAddFields['csc'])
     data.fullname = this.debitCardAddFields['fullname']

     this.service.authpost('payment-method/debitcardadd','installer',data)
     .pipe(first())
     .subscribe(res=>{
       if(res['statusCode']==200){
         console.log('data', res['data']);
         this.getProfileDetails();
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
    this.service.authput('payment-method/cardchoose/'+this.installer_id,'installer',this.cardChooseFields)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log(res);
        this.activeBank = null;
        this.getProfileDetails();
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

}
