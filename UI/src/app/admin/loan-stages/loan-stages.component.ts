import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../_service/http.service';
import { CommonDataInatance } from '../../_service/comman.service';
import { first } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';

@Component({
  selector: 'app-loan-stages',
  templateUrl: './loan-stages.component.html',
  styleUrls: ['./loan-stages.component.scss'],
})
export class LoanStagesComponent implements OnInit {
  isListView: boolean = true;
  dtOptions: DataTables.Settings = {};
  public stage;
  public pageTitle;
  data: any = [];
  public loanStage = CommonDataInatance.stageList;
  constructor(
    private route: ActivatedRoute,
    private service: HttpService,
    public router: Router
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
  }

  ngOnInit(): void {
    this.stage = this.route.snapshot.paramMap.get('stage');
    this.pageTitle = this.loanStage[this.stage] + ' Applications Details';
    // this.dtOptions = { pagingType: 'full_numbers', pageLength: 10 };

    this.get();
  }

  get() {
    this.service
      .authget('loanstage/' + this.stage, 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.data = res['data'];
            console.log('////', this.data);
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
}
