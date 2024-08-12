import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { IpAddressService } from 'src/app/_service/ip-address.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  f1: any = {};
  modalRef: BsModalRef;
  message: any = [];
  installersidebar = false;
  borrowerSidebar = false;
  adminsidebar = false;
  sidenavtoggled: any = false;
  menusBar = false;
  isUserlogin = false;
  UDInfo: any = {};
  hide = true;
  practiceMainColor = '#fff';
  practiceSecondaryColor = '#fff';
  practice_logo: any;
  practiceMain_logo: any;
  path = 'assets/new/logo.svg';
  constructor(
    private modalService: BsModalService,
    public router: Router,
    private service: HttpService,
    private ip: IpAddressService
  ) {}

  ngOnInit(): void {
    if (this.service.practiceMainColor && this.service.practiceSecondaryColor) {
      localStorage.setItem('mainColor', this.service.practiceMainColor);
      localStorage.setItem(
        'secondaryColor',
        this.service.practiceSecondaryColor
      );
    } else {
      this.service.practiceMainColor = localStorage.getItem('mainColor');
      this.service.practiceSecondaryColor =
        localStorage.getItem('secondaryColor');
    }
    this.changeOfRoutes();
  }
  changeOfRoutes() {
    let routePaths = this.router.url.split('/');
    console.log('routePaths', routePaths);
    let router = routePaths[1],
      menusNotShowPath = false;
    if (router == 'admin' || router == 'borrower') {
      let ro = routePaths[2].split('?')[0];
      if (
        ro == 'login' ||
        ro == 'verify' ||
        ro == 'forgot-password' ||
        ro == 'passwordReset' ||
        ro == 'plaid' ||
        ro == 'twofactorauth'
      ) {
        router = ro;
        //menusNotShowPath = true;
      }
    }

    switch (router) {
      case 'installer':
        this.installersidebar = true;
        break;
      case 'borrower':
        this.borrowerSidebar = true;
        break;
      case 'admin':
        this.adminsidebar = true;
        break;
      default:
        this.installersidebar = false;
        this.borrowerSidebar = false;
        this.adminsidebar = false;
        break;
    }
    if (router != 'admin' && !menusNotShowPath) {
      this.menusBar = true;
      if (router == 'borrower') {
        //call get user details
      }
    } else {
      this.menusBar = false;
    }
  }
  onSubmit(template: TemplateRef<any>) {
    this.service
      .post('users/signin', 'borrower', this.f1)
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            sessionStorage.setItem('UserId', res['resuser']['_id']);
            sessionStorage.setItem('UD_firstName', res['resuser']['firstname']);
            sessionStorage.setItem('UD_lastName', res['resuser']['lastname']);
            sessionStorage.setItem('UD_email', res['resuser']['email']);
            
            sessionStorage.setItem('borrower_token', res['jwtAccessToken']);
            // this.ip.getIPAddress().subscribe((res:any)=>{
            //   this.addLoginLog();
            // });
            this.addLoginLog();
            this.router.navigate(['borrower/overview']);
            window.location.reload();
            
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(template);
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  close(): void {
    this.modalRef.hide();
  }

  addLoginLog() {
    this.service.addLoginLog('borrower').subscribe(
      (res) => {},
      (err) => {}
    );
  }
}
