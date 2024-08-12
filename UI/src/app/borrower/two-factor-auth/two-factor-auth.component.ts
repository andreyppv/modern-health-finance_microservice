import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { HttpService } from 'src/app/_service/http.service';
import { IpAddressService } from 'src/app/_service/ip-address.service';
import {environment} from '../../../environments/environment';
@Component({
  selector: 'app-two-factor-auth',
  templateUrl: './two-factor-auth.component.html',
  styleUrls: ['./two-factor-auth.component.scss']
})
export class TwoFactorAuthComponent implements OnInit {
  userId;
  f1:any = {};
  modalRef: BsModalRef;
  message:any = [];
  title:any = ""

  constructor(
    private modalService: BsModalService,
    public router:Router,
    private service: HttpService,
    private ip:IpAddressService,
    ) { 
      this.title = environment.title }

  ngOnInit(): void {
    if(sessionStorage.getItem('UserId')!=undefined){
      this.userId = sessionStorage.getItem('UserId');
    }else{
      this.router.navigate(['borrower/login']);
    }
  }

  onSubmit(template: TemplateRef<any>){
    this.f1['user_id']=this.userId;
    this.f1['otp']= Number(this.f1['otp']);
    this.service.authpost('users/verifyOtp','borrower',this.f1)
    .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){
          sessionStorage.setItem('borrower_token',res['jwtAccessToken'])
            this.ip.getIPAddress().subscribe((res:any)=>{
              this.addlogs("User Logged In from IP: "+res.ip, null);
            });
            this.router.navigate(['borrower/overview']);
        }else{
          this.message = res['message']
          this.modalRef = this.modalService.show(template);
        }
      },err=>{
        if(err['error']['message'].isArray){
          this.message = err['error']['message']
        }else{
          this.message = [err['error']['message']]
        }
        this.modalRef = this.modalService.show(template);
      })
  }

  addlogs(module,id){
    this.service.addlog(module,id,'borrower').subscribe(res=>{},err=>{})
  }

  number(data){
    return data.target.value = data.target.value.replace(/[^0-9.]/g,'')
  }
  close(): void {
    this.modalRef.hide();
  } 

}
