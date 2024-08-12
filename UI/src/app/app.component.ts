import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from './_service/http.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  installersidebar = false;
  isFooterShow : boolean = false;
  borrowerSidebar = false;
  adminsidebar = false;
  sidenavtoggled: any = false;
  menusBar = false;
  isUserlogin = false;
  UDInfo: any = {};
  practiceMainColor = "#fff";
  practiceSecondaryColor = '#fff'
  practice_logo: any;
  practiceMain_logo: any;

  path = 'assets/new/logo.svg';

  constructor(private router: Router, route: ActivatedRoute, private service: HttpService) {
  }
  ngOnInit() {
    this.service.getMainColor.subscribe((res) => {
      console.log('login_res',res)
      if (res && res.practiceMainColor) {
        this.practiceMainColor = this.service.practiceMainColor = res.practiceMainColor;
        this.practiceSecondaryColor = this.service.practiceSecondaryColor = res.pacticeSecondaryColor;
      }
    })
    let firstname = sessionStorage.getItem('UD_firstName');
    let lastname = sessionStorage.getItem('UD_lastName');
    let email = sessionStorage.getItem('UD_email');
    let userId = sessionStorage.getItem('UserId');
    if (email) {
      this.UDInfo.firstname = firstname;
      this.UDInfo.lastname = lastname;
      this.UDInfo.email = email;
      this.isUserlogin = true;
      //console.log("yes", this.UDInfo)
    }


    this.getBorrowerDetails(userId);
  }

  getBorrowerDetails(id:any){

    this.service.authget("overview/"+id,"borrower")
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.practiceMainColor=res['data']['user_details'][0].practiceMainColor;
        this.practiceSecondaryColor=res['data']['user_details'][0].pacticeSecondaryColor;

        this.practice_logo = res['data']['user_details'][0].practicelogo;
        this.practiceMain_logo = res['data']['user_details'][0].practicepoweredbylogo;
        //this.path=(res['data']['user_details'][0].practicelogo!=null)? res['data']['user_details'][0].practicelogo : 'assets/new/logo.svg';
      }
    },err=>{
      console.log(err)
    })
  }

  getColor(color): string {
    return color || "#fff";
  }
  changeOfRoutes() {
    let routePaths = this.router.url.split('/');
    let router = routePaths[1], menusNotShowPath = false;
    if (router == 'admin' || router == 'borrower') {
      let ro = routePaths[2].split('?')[0];
      if (ro == 'login' || ro == 'verify' || ro == 'forgot-password' || ro == 'passwordReset' || ro == 'plaid' || ro == 'twofactorauth') {
        router = ro;
        menusNotShowPath = true;
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
    }else if (routePaths[1] == 'borrower') {
      this.isFooterShow = true;
    }else {
      this.menusBar = false;
    }
  }
  logout() {
    this.service.logout()
  }

}
