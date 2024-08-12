import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  data: any = {
    approvedcontract_application: 0,
    canceled_application: 0,
    incomplete_application: 0,
    pending_application: 0,
  };
  constructor(private service: HttpService, public router: Router) {}

  ngOnInit(): void {
    this.getlist();
  }

  getlist() {
    this.service
      .authget('dashboard', 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.data = res['data'];
            console.log('*****', this.data);
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  goPendings() {
    this.router.navigate(['admin/loan-stages/pending']);
  }

  goAll() {
    this.router.navigate(['admin/patient-list']);
  }

  goincomplete() {
    this.router.navigate(['admin/loan-stages/waiting']);
  }
  goapproved() {
    this.router.navigate(['admin/loan-stages/approved']);
  }
  godenied() {
    this.router.navigate(['admin/loan-stages/denied']);
  }
}
