import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-approveddetails',
  templateUrl: './approveddetails.component.html',
  styleUrls: ['./approveddetails.component.scss']
})
export class ApproveddetailsComponent implements OnInit {
  data: any = {
    answers: [],
    CoApplicant: [],
    files: [],
    from_details: [],
    paymentScheduleDetails: []
  };
  modalRef: BsModalRef;
  message: any = [];
  payment: any = [];
  manualBankAddFields = {};
  cm = {};

  res_comments: any = [];
  screenlogs: any = [];
  @ViewChild('messagebox', { read: TemplateRef }) messagebox: TemplateRef<any>;

  tabs: any = {
    'User Information': false,
    'Credit Report': false,
    'Payment Schedule': false,
    'Bank Accounts': false,
    'Document Center': false,
    'Comments': false,
    'Log': false
  };

  constructor(
    public datePipe: DatePipe,
    private route: ActivatedRoute,
    private service: HttpService,
    public router: Router,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    let pages = sessionStorage.getItem('pages');
    let tabs = sessionStorage.getItem('tabs');
    if (pages) {
      pages = JSON.parse(pages);
      for (let i = 0; i < pages.length; i++) {
        if (pages[i]['name'] == 'Approved Application') {
          if (tabs) {
            tabs = JSON.parse(tabs);
            console.log(tabs[pages[i]['id']]);
            for (let j = 0; j < tabs[pages[i]['id']].length; j++) {
              this.tabs[tabs[pages[i]['id']][j]['name']] = true;
            }
            i = pages.length + 1;
          }
        }
      }
    }
    this.get(this.route.snapshot.paramMap.get('id'));
    this.getlogs();
  }

  manualBankAddModel(manualBankAddTemp: TemplateRef<any>) {
    this.modalRef = this.modalService.show(manualBankAddTemp);
  }

  manualBankAdd() {
    this.manualBankAddFields['user_id'] = this.data.from_details[0].user_id;
    console.log('manualBankAddFields', this.manualBankAddFields);
    this.service
      .authpost('pending/manualbankadd', 'admin', this.manualBankAddFields)
      .pipe(first())
      .subscribe(
        res => {
          console.log('res', res);
          if (res['statusCode'] == 200) {
            console.log('data', res['data']);
            this.modalRef.hide();
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        err => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }
  pay() {
    let date = new Date(this.data['from_details'][0]['createdat']);
    this.payment.push({
      createdat: this.dt(date),
      loan_advance: this.data['from_details'][0]['loanamount'],
      payOffAmount: this.data['from_details'][0]['loanamount'],
      apr: this.data['from_details'][0]['apr'],
      loantermcount: this.data['from_details'][0]['loanterm'],
      maturityDate: this.dt(
        new Date(
          new Date(this.data['from_details'][0]['createdat']).setMonth(
            new Date(this.data['from_details'][0]['createdat']).getMonth() + 12
          )
        )
      ),
      nextpaymentschedule: this.dt(
        new Date(
          new Date(this.data['from_details'][0]['createdat']).setMonth(
            new Date(this.data['from_details'][0]['createdat']).getMonth() + 1
          )
        )
      )
    });

    // var principal = Number(this.data['from_details'][0]['loanamount']);
    // var interest = Number(this.data['from_details'][0]['apr']) / 100 / 12;
    // var payments = Number(this.data['from_details'][0]['loanterm'])
    // var x = Math.pow(1 + interest, payments);
    // var monthly:any = (principal*x*interest)/(x-1);
    // this.payment.push([])
    // if (!isNaN(monthly) &&
    //     (monthly != Number.POSITIVE_INFINITY) &&
    //     (monthly != Number.NEGATIVE_INFINITY)) {
    //       monthly = this.round(monthly);
    //       for (let i = 0; i < payments; i++) {
    //         let inter = this.round((principal*Number(this.data['from_details'][0]['apr']))/1200)
    //         let pri = this.round(monthly - inter)
    //         this.payment[1].push({
    //           startPrincipal:principal,
    //           principal:pri,
    //           interest:inter,
    //           fees:0,
    //           amount:monthly,
    //           date:this.dt(new Date(new Date(this.data['from_details'][0]['createdat']).setMonth(new Date(this.data['from_details'][0]['createdat']).getMonth()+(i+1))))
    //         })
    //         principal = this.round(principal- pri);
    //       }

    //     }
  }

  round(x) {
    return Math.round(x * 100) / 100;
  }

  dt(today) {
    var dd: any = today.getDate();

    var mm: any = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }

    if (mm < 10) {
      mm = '0' + mm;
    }
    return mm + '-' + dd + '-' + yyyy;
  }
  get(id) {
    this.service
      .authget('approved/' + id, 'admin')
      .pipe(first())
      .subscribe(
        res => {
          if (res['statusCode'] == 200) {
            this.data = res['data'];
            this.pay();
            this.getcomments();
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
            this.router.navigate(['admin/approved']);
          }
        },
        err => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
          this.router.navigate(['admin/approved']);
        }
      );
  }

  Pending() {
    let id = this.route.snapshot.paramMap.get('id');
    this.service
      .authget('denied/pending/' + id, 'admin')
      .pipe(first())
      .subscribe(
        res => {
          if (res['statusCode'] == 200) {
            this.router.navigate(['admin/pendings/' + id]);
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        err => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }

  view(filename: any) {
    filename = filename.split('/');
    filename = filename[filename.length - 1];
    window.open(
      environment.adminapiurl + 'files/download/' + filename,
      '_blank'
    );
  }

  close(): void {
    this.modalRef.hide();
  }
  getcomments() {
    let id = this.route.snapshot.paramMap.get('id');
    this.service
      .authget('pending/getcomments/' + id, 'admin')
      .pipe(first())
      .subscribe(
        res => {
          if (res['statusCode'] == 200) {
            this.res_comments = res['data'];
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        err => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }
  addcomments(msgbox: TemplateRef<any>) {
    this.cm['loan_id'] = this.route.snapshot.paramMap.get('id');
    this.cm['user_id'] = JSON.parse(sessionStorage.getItem('resuser'))['id'];
    this.service
      .authpost('pending/addcomments', 'admin', this.cm)
      .pipe(first())
      .subscribe(
        res => {
          if (res['statusCode'] == 200) {
            this.message = ['Comments Added'];
            this.modalRef = this.modalService.show(msgbox);
            this.getcomments();
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(msgbox);
          }
        },
        err => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }
  getlogs() {
    let id = this.route.snapshot.paramMap.get('id');
    this.service
      .authget('approved/getlogs/' + id, 'admin')
      .pipe(first())
      .subscribe(
        res => {
          if (res['statusCode'] == 200) {
            this.screenlogs = res['data'];
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        err => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
        }
      );
  }
}
