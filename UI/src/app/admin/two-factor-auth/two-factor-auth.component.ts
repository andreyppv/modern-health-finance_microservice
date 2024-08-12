import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { HttpService } from 'src/app/_service/http.service';
import { IpAddressService } from 'src/app/_service/ip-address.service';

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

  constructor(
    private modalService: BsModalService,
    public router:Router,
    private service: HttpService,
    private ip:IpAddressService
  ) { }

  ngOnInit(): void {
    if(sessionStorage.getItem('resuser')!=undefined){
      this.userId = JSON.parse(sessionStorage.getItem('resuser'))['id'];
    }else{
      this.router.navigate(['admin/login']);
    }
  }

  onSubmit(template: TemplateRef<any>){
    this.f1['user_id']=this.userId;
    this.f1['otp']= Number(this.f1['otp']);
    this.service.authpost('users/verifyOtp','admin',this.f1)
    .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){
          sessionStorage.setItem('admin_token',res['jwtAccessToken'])
          this.ip.getIPAddress().subscribe((res:any)=>{
            this.addlogs("User Logged In from IP: "+res.ip, null);
          });

          let pages = JSON.parse(sessionStorage.getItem('pages'))
          let tabs = JSON.parse(sessionStorage.getItem('tabs'))
          this.gopage(pages[0],tabs)
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
    this.service.addlog(module,id,'admin').subscribe(res=>{},err=>{})
  }

  number(data){
    return data.target.value = data.target.value.replace(/[^0-9.]/g,'')
  }

  gopage(list,tabs){
    switch(list.name){
      case 'Dashboard':
        this.router.navigate(['admin/dashboard']);
      break;
      case 'Approved Application':
        this.router.navigate(['admin/approved']);
      break;
      case 'Pending Application':
        this.router.navigate(['admin/pendings']);
      break;
      case 'Incomplete Application':
        this.router.navigate(['admin/incomplete']);
      break;
      case 'Denied Application':
        this.router.navigate(['admin/dashboard']);
      break;
      case 'Funded Contracts':
        this.router.navigate(['admin/funded-contracts']);
      break;
      case 'Settings':
        this.gosetting(tabs[list.id])
      break;
      case 'Installer Management':
        this.router.navigate(['admin/installer']);
      break;
      case 'Users':
        this.router.navigate(['admin/users']);
      break;
      case 'Start Application':
        this.router.navigate(['admin/start-application']);
      break;
      default:
        sessionStorage.clear()
      break;
    }
  }

  gosetting(list){
    switch(list.name){
      case 'Audit Log':
        this.router.navigate(['admin/settings/auditlog']);
      break;
      case 'Questions':
        this.router.navigate(['admin/settings/questions']);
      break;
      case 'Admin Security':
        this.router.navigate(['admin/settings/admin-security']);
      break;
      case 'Roles':
        this.router.navigate(['admin/settings/roles']);
      break;
      case 'DecisionEngine':
        this.router.navigate(['admin/settings/decisionengine']);
      break;
      default:
        sessionStorage.clear()
      break;
    }
  }

}
