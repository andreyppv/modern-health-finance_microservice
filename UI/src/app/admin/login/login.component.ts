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
  constructor(
    private modalService: BsModalService,
    public router: Router,
    private service: HttpService
  ) {}

  ngOnInit(): void {}

  onSubmit(template: TemplateRef<any>) {
    this.service
      .post('users/signin', 'admin', this.f1)
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            //sessionStorage.setItem('admin_token',res['jwtAccessToken'])
            sessionStorage.setItem('resuser', JSON.stringify(res['resuser']));
            sessionStorage.setItem('UserId', res['resuser']['_id']);
            sessionStorage.setItem('admin_token', res['jwtAccessToken']);
            this.addLoginLog();
            this.router.navigate(['admin/dashboard']);
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
  gopage(list, tabs) {
    switch (list.name) {
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
        this.gosetting(tabs[list.id]);
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
      case 'Funding Contracts':
        this.router.navigate(['admin/funding-contracts']);
        break;
      default:
        sessionStorage.clear();
        break;
    }
  }

  gosetting(list) {
    switch (list.name) {
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
        sessionStorage.clear();
        break;
    }
  }

  addLoginLog() {
    this.service.addLoginLog('admin').subscribe(
      (res) => {},
      (err) => {}
    );
  }
}
