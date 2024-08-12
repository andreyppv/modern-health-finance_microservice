import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
})
export class PatientListComponent implements OnInit {
  isListView: boolean = true;
  data: any = [];
  constructor(
    private route: ActivatedRoute,
    private service: HttpService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.get();
  }
  //'incomplete/all?uuid='+this.isListView
  get() {
    this.service
      .authget('incomplete/', 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.data = res['data'];
          } else {
            this.service.showError('Invaild page');
          }
        },
        (err) => {
          console.log(err);
          this.service.showError('Invaild page');
        }
      );
  }

  redirect(e) {
    switch (e.regstatus) {
      case 'approvedcontract':
        {
          this.router.navigate(['admin/loan-stages/approved/' + e.loanid]);
          break;
        }
        console.log(e);
    }
    switch (e.regstatus) {
      case 'fundingcontract': {
        this.router.navigate(['admin/loan-stages/fundingcontract/' + e.loanid]);
        break;
      }
    }
    switch (e.regstatus) {
      case 'archive': {
        this.router.navigate(['admin/loan-stages/archived/' + e.loanid]);
        break;
      }
    }
    switch (e.regstatus) {
      case 'canceled': {
        this.router.navigate(['admin/loan-stages/denied/' + e.loanid]);
        break;
      }
    }
  }
}
