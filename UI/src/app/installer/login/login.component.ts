import { Component, OnInit,TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from "@angular/router";
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { IpAddressService } from 'src/app/_service/ip-address.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  eye:any =false;
  f1:any = {};
  modalRef: BsModalRef;
  message:any = [];
  constructor(private modalService: BsModalService, public router:Router, private service: HttpService, private ip:IpAddressService) { }

  ngOnInit(): void {
  }

  onSubmit(template: TemplateRef<any>){
    this.service.post('users/signin','installer',this.f1)
    .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){
          sessionStorage.setItem('InstallerUserId',res['resuser']['id'])
          sessionStorage.setItem('MainInstallerId',res['resuser']['maininstallerid'])
          sessionStorage.setItem('pages',JSON.stringify(res['pages']))
          sessionStorage.setItem('tabs',JSON.stringify(res['tabs']))

          if(res['resuser']['twofactorauth']=='N'){
            sessionStorage.setItem('installer_token',res['jwtAccessToken'])
            // this.ip.getIPAddress().subscribe((res:any)=>{
            //   this.addLoginLog();
            // });
            this.addLoginLog();
            this.gopage(res['pages'][0])
          }else{
            this.router.navigate(['installer/twofactorauth']);
          }
        }else{
          this.message = res['message']
          this.modalRef = this.modalService.show(template);
        }

      },err=>{
        console.log(err)
      })
  }

  close(): void {
    this.modalRef.hide();
  }

  gopage(list){
    switch(list.name){
      case 'Dashboard':
        this.router.navigate(['installer/main']);
      break;
      case 'Customers':
        this.router.navigate(['installer/customers']);
      break;
      case 'Profile':
        this.router.navigate(['installer/profile']);
      break;
      case 'Transaction':
        this.router.navigate(['installer/transaction']);
      break;
      default:
        sessionStorage.clear()
      break;
    }
  }

  addLoginLog(){
    this.service.addLoginLog('installer').subscribe(res=>{},err=>{})
  }

}
