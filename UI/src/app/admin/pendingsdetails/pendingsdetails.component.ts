import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { DatePipe } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import { AccountNumberValidator } from 'src/app/_service/custom.validator';
import { FileValidators } from 'ngx-file-drag-drop';
import {
  PayamentSchedules,
  CommonDataInatance,
  FinanceInatance
} from '../../_service/comman.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { readyMade } from '../../../environments/environment';
import { FullCalendarComponent, CalendarOptions } from '@fullcalendar/angular';
@Component({
  selector: 'app-pendingsdetails',
  templateUrl: './pendingsdetails.component.html',
  styleUrls: ['./pendingsdetails.component.scss']
})
export class PendingsdetailsComponent implements OnInit {
  data: any = {
    answers: [],
    CoApplicant: [],
    document: [],
    from_details: [],
    userDocument: [],
    paymentScheduleDetails: []
  };
  cm = {};

  res_comments: any = [];
  payment: any = [];
  modalRef: BsModalRef;
  message: any = [];
  monthArr = [12, 24, 36, 48, 60];
  manualBankAddFields = {};
  screenlogs: any = [];
  login_user_id: any;

  editName = false;
  editStreetAddress = false;
  editCity = false;
  editZipCode = false;
  editNameFields = {};
  editStreetFields = {};
  editCityFields = {};
  editZipCodeFields = {};
  bankAddForm: FormGroup;
  fSubmitted = false;
  public creditReportData: any;
  @ViewChild('messagebox', { read: TemplateRef }) messagebox: TemplateRef<any>;
  tabs: any = {
    'User Information': false,
    'Credit Report': false,
    'Payment Schedule': false,
    'Bank Accounts': false,
    'Document Center': false,
    Comments: false,
    Log: false
  };
  documentsTypes = CommonDataInatance.documentsTypes(false);
  formControls: any;
  public id: any;
  viewApp: boolean = false;
  bankaccounts: any = [];
  ownerInformation: any = [];
  apForm: FormGroup;
  apibtn: boolean = false;
  durationMonths = FinanceInatance.durationMonths;

  @ViewChild('calendar') calendarComponent: FullCalendarComponent;
  payamentSchedules = new PayamentSchedules();
  public paymentfrequency = new FormControl('M');
  constructor(
    public datePipe: DatePipe,
    private route: ActivatedRoute,
    private service: HttpService,
    public router: Router,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    public sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    let pages = sessionStorage.getItem('pages');
    let tabs = sessionStorage.getItem('tabs');
    if (pages) {
      pages = JSON.parse(pages);
      for (let i = 0; i < pages.length; i++) {
        if (pages[i]['name'] == 'Pending Application') {
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
    this.bankAddForm = this.formBuilder.group(
      {
        bankname: ['', Validators.required],
        holdername: ['', Validators.required],
        routingnumber: ['', [Validators.required, Validators.min(10000)]],
        accountnumber: ['', [Validators.required, Validators.min(1000000000)]],
        confmAccountNumber: ['', Validators.required]
      },
      { validator: AccountNumberValidator }
    );
    this.login_user_id = JSON.parse(sessionStorage.getItem('resuser')).id;
    this.id = this.route.snapshot.paramMap.get('id');
    //build form
    this.apForm = this.formBuilder.group({
      LoanAmount: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.decimal)]
      ],
      APR: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.decimal)]
      ],
      Duration: ['12', [Validators.required]],
      PaymentAmount: [{ value: 0, disabled: true }],
      OriginationFee: [0],
      RealAPR: [0]
    });
    this.get(this.id);
    this.getlogs();
    this.creditReport();
    this.formControls = {
      docFile: new FormControl(
        [],
        [
          FileValidators.required,
          FileValidators.fileExtension(['png', 'jpeg', 'pdf', 'jpg'])
        ]
      ),
      type: new FormControl('', [FileValidators.required])
    };
    this.getbankaccounts(this.id);
  }
  get f(): { [key: string]: AbstractControl } {
    return this.bankAddForm.controls;
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
    //
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

  get(id) {
    //this.service.authget('pending/'+id+"/"+this.login_user_id,'admin')
    this.service
      .authget('pending/' + id, 'admin')
      .pipe(first())
      .subscribe(
        res => {
          if (res['statusCode'] == 200) {
            console.log('res-->', res);
            this.data = res['data'];
            console.log(this.data);
            this.pay();
            this.getcomments();
            this.editNameFields['firstname'] = this.data.from_details[0][
              'firstname'
            ];
            this.editNameFields['lastname'] = this.data.from_details[0][
              'lastname'
            ];
            this.editStreetFields['streetaddress'] = this.data.from_details[0][
              'streetaddress'
            ];
            this.editCityFields['city'] = this.data.from_details[0]['city'];
            this.editZipCodeFields['zipcode'] = this.data.from_details[0][
              'zipcode'
            ];
            this.viewApp = true;
            this.afterResponse();
          } else {
            this.message = res['message'];
            this.modalRef = this.modalService.show(this.messagebox);
            this.router.navigate(['admin/pendings']);
          }
        },
        err => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
          this.router.navigate(['admin/pendings']);
        }
      );
  }

  paymentReschedule(id) {
    this.service
      .authget('pending/getPaymentSchedule/' + id, 'admin')
      .pipe(first())
      .subscribe(res => {
        console.log('res--->', res);
        if (res['statusCode'] == 200) {
          this.data = res['data'];
          this.pay();
          this.viewApp = true;
          this.afterResponse();
        } else {
          this.message = res['message'];
          this.modalRef = this.modalService.show(this.messagebox);
          this.router.navigate(['admin/pendings']);
        }
        err => {
          if (err['error']['message'].isArray) {
            this.message = err['error']['message'];
          } else {
            this.message = [err['error']['message']];
          }
          this.modalRef = this.modalService.show(this.messagebox);
          this.router.navigate(['admin/pendings']);
        };
      });
  }
  invite() {
    let id = this.route.snapshot.paramMap.get('id');
    this.service
      .authget(
        'pending/invite/' + this.data['from_details'][0]['user_id'],
        'admin'
      )
      .pipe(first())
      .subscribe(
        res => {
          if (res['statusCode'] == 200) {
            this.message = ['Invite Link Sent Successfully'];
            this.modalRef = this.modalService.show(this.messagebox);
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

  Deny() {
    let id = this.route.snapshot.paramMap.get('id');
    this.service
      .authget('pending/denied/' + id, 'admin')
      .pipe(first())
      .subscribe(
        res => {
          if (res['statusCode'] == 200) {
            this.router.navigate(['admin/denied/' + id]);
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

  Approve() {
    let id = this.route.snapshot.paramMap.get('id');
    this.service
      .authget('pending/approved/' + id, 'admin')
      .pipe(first())
      .subscribe(
        res => {
          if (res['statusCode'] == 200) {
            this.service.showSuccess('Contract link sent.');
            this.router.navigate(['admin/approved/' + id]);
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

  manualBankAddModel(manualBankAddTemp: TemplateRef<any>) {
    this.modalRef = this.modalService.show(manualBankAddTemp);
  }

  manualBankAdd() {
    this.fSubmitted = true;
    if (this.bankAddForm.invalid) {
      return;
    }

    this.bankAddForm.value.user_id = this.data.from_details[0].user_id;
    console.log('bankAddForm.value', this.bankAddForm.value);

    this.service
      .authpost('pending/manualbankadd', 'admin', this.bankAddForm.value)
      .pipe(first())
      .subscribe(
        res => {
          console.log('res', res);
          if (res['statusCode'] == 200) {
            console.log('data', res['data']);
            this.bankAddFormClose();
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
  bankAddFormClose() {
    console.log('bankAddFormClose call');

    this.modalRef.hide();
    this.fSubmitted = false;
    this.bankAddForm.reset();
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

  editUserName() {
    this.service
      .authput(
        'customer/editusername/' + this.data.from_details[0].user_id,
        'admin',
        this.editNameFields
      )
      .pipe(first())
      .subscribe(
        res => {
          if (res['statusCode'] == 200) {
            this.data.from_details[0]['firstname'] = this.editNameFields[
              'firstname'
            ];
            this.data.from_details[0]['lastname'] = this.editNameFields[
              'lastname'
            ];
            this.editName = false;
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

  editUserStreetAddress() {
    this.service
      .authput(
        'customer/editstreetaddress/' + this.data.from_details[0].user_id,
        'admin',
        this.editStreetFields
      )
      .pipe(first())
      .subscribe(
        res => {
          if (res['statusCode'] == 200) {
            this.data.from_details[0]['streetaddress'] = this.editStreetFields[
              'streetaddress'
            ];
            this.editStreetAddress = false;
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

  editUserCity() {
    this.service
      .authput(
        'customer/editusercity/' + this.data.from_details[0].user_id,
        'admin',
        this.editCityFields
      )
      .pipe(first())
      .subscribe(
        res => {
          if (res['statusCode'] == 200) {
            this.data.from_details[0]['city'] = this.editCityFields['city'];
            this.editCity = false;
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

  editUserZipCode() {
    this.service
      .authput(
        'customer/edituserzipcode/' + this.data.from_details[0].user_id,
        'admin',
        this.editZipCodeFields
      )
      .pipe(first())
      .subscribe(
        res => {
          if (res['statusCode'] == 200) {
            this.data.from_details[0]['zipcode'] = this.editZipCodeFields[
              'zipcode'
            ];
            this.editZipCode = false;
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
  uploadDoc(): void {
    if (this.formControls.docFile.valid && this.formControls.type.valid) {
      let formData = new FormData();
      formData.append('type', this.formControls.type.value);
      formData.append('loan_id', this.id);
      formData.append('files', this.formControls.docFile.value[0]);
      console.log(this.formControls.docFile.value);
      this.service
        .files('uploadfiles/uploads/', 'admin', formData)
        .pipe(first())
        .subscribe(
          res => {
            if (res['statusCode'] == 200) {
              console.log(res);
              //value update
              this.data.userDocument.push({
                type: this.formControls.type.value,
                orginalfileName: this.formControls.docFile.value[0].name,
                fileName: res['data']['key']
              });
              this.formControls.docFile.setValue([]);
              this.formControls.type.setValue('');
            } else {
              console.log(res['statusCode'], res);
            }
          },
          err => {
            console.log(err.error.message);
          }
        );
    } else {
      //show error
      console.log('error');
      console.log(
        this.formControls.docFile.value,
        this.formControls.docFile.valid,
        'here',
        this.formControls.docFile.errors
      );
    }
  }
  getbankaccounts(id) {
    this.service.authget('plaid/accounts/' + id, 'admin').subscribe(
      res => {
        if (res['statusCode'] == 200) {
          this.bankaccounts = res['data'];
          if (res['ownerInformation'].length) {
            this.ownerInformation = JSON.parse(
              res['ownerInformation'][0].owner
            );
          }
        }
      },
      err => {
        console.log(err);
      }
    );
  }
  sendbanklogin() {
    let id = this.route.snapshot.paramMap.get('id');
    this.service.authget('plaid/requestBank/' + id, 'admin').subscribe(
      res => {
        if (res['statusCode'] == 200) {
          this.message = ['Mail Successfully Sent'];
          this.modalRef = this.modalService.show(this.messagebox);
        }
      },
      err => {
        console.log(err);
      }
    );
  }
  rePullBankAccounts() {
    let id = this.route.snapshot.paramMap.get('id');
    this.service.authget('plaid/accountsRepull/' + id, 'admin').subscribe(
      res => {
        if (res['statusCode'] == 200) {
          this.bankaccounts = res['data'];
        }
      },
      err => {
        console.log(err);
      }
    );
  }
  creditReport() {
    this.service
      .authget('creditpull/creditpull/getFiles/' + this.id, 'admin')
      .subscribe(
        res => {
          if (res['statusCode'] == 200) {
            //console.log(res['data']);
            this.creditReportData = {
              file: 'data:application/pdf;base64,' + res['data']
            };
            //console.log(this.creditReportData);
          }
        },
        err => {
          console.log(err);
        }
      );
  }
  creditReportPull() {
    this.service.authget('creditpull/creditpull/' + this.id, 'admin').subscribe(
      res => {
        console.log(res, 'pull');
        if (res['statusCode'] == 200) {
          this.creditReportData = {
            file: 'data:application/pdf;base64,' + res['data']
          };
        } else {
          alert(res['error']);
        }
      },
      err => {
        console.log(err);
      }
    );
  }
  safeResourceUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  findPaymentAmount(): number {
    var monthly: any;
    let loanamount = this.apForm.get('LoanAmount').value,
      arr = this.apForm.get('APR').value,
      duration = this.apForm.get('Duration').value;
    monthly = FinanceInatance.findPaymentAmount(
      Number(loanamount),
      Number(arr),
      Number(duration)
    );
    this.apForm.get('PaymentAmount').setValue(monthly);
    return monthly;
  }
  findPaymentAmountWithOrigination() {
    let loanamount = this.apForm.get('LoanAmount').value,
      originationFee = this.apForm.get('OriginationFee').value,
      apr = this.apForm.get('APR').value,
      duration = this.apForm.get('Duration').value;
    let result = FinanceInatance.findPaymentAmountWithOrigination(
      Number(loanamount),
      Number(apr),
      Number(duration),
      Number(originationFee)
    );
    this.apForm.get('PaymentAmount').setValue(result.monthlyAmount);
    this.apForm.get('RealAPR').setValue(result.realAPR);
    //console.log(result);
  }
  afterResponse(): void {
    //data convertion
    this.data.from_details[0].birthday = new Date(
      this.data.from_details[0].birthday
    );
    this.data.from_details[0].createdat = new Date(
      this.data.from_details[0].createdat
    );
    this.data.from_details[0].updatedat = new Date(
      this.data.from_details[0].updatedat
    );
    //set input value
    this.apForm
      .get('LoanAmount')
      .setValue(this.data.from_details[0].loanamount);
    this.apForm.get('APR').setValue(this.data.from_details[0].apr);
    this.apForm.get('Duration').setValue(this.data.from_details[0].loanterm);
    this.apForm
      .get('OriginationFee')
      .setValue(this.data.from_details[0].orginationfees);
    //trigger
    //find payment amount
    this.findPaymentAmountWithOrigination();
    //paymentschedules
    let obj: any = {};
    obj.amount = this.data.from_details[0].loanamount;
    obj.apr = this.data.from_details[0].apr;
    obj.term = this.data.from_details[0].loanterm;
    this.paymentfrequency.setValue(this.data.from_details[0].payfrequency);
    this.payamentSchedules.loanInfo = obj;
    this.payamentSchedules.paymentfrequency = this.paymentfrequency;
    this.payamentSchedules.createEvents(this.data.paymentScheduleDetails);
  }
  sendForm(): void {
    this.apibtn = true;
    if (!this.apForm.invalid) {
      console.log(this.apForm.value);
      //data
      let data = this.apForm.value,
        sendData;
      sendData = {
        loanamount: Number(data.LoanAmount),
        duration: +data.Duration,
        apr: +data.APR,
        orginationFee: +data.OriginationFee
      };
      this.service
        .authpatch(
          'loanstage/editcustomerloanamountdetails/' + this.id,
          'admin',
          sendData
        )
        .pipe(first())
        .subscribe(
          res => {
            if (res['statusCode'] == 200) {
              console.log(res);
              this.get(this.id);

              //this.router.navigate(['admin/dashboard']);
              this.message = ['Loan details updated'];
              this.modalRef = this.modalService.show(this.messagebox);
              this.viewApp = true;
              this.afterResponse();
            } else {
              console.log(res['statusCode'], res);
            }
          },
          err => {
            console.log(err);
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
  paymentAccordinChange(isOpen: boolean) {
    //console.log(isOpen);
    if (isOpen) {
      setTimeout(
        function() {
          this.payamentSchedules.calendarApi = this.calendarComponent.getApi();
          this.payamentSchedules.calendarApi.render();
        }.bind(this),
        500
      );
    }
  }
  saveReschedules() {
    let sendData = {
      loan_id: this.id,
      paymentFrequency: this.paymentfrequency.value,
      date: this.payamentSchedules.paymentStartDate.toISOString()
    };
    this.service
      .authpatch('loanstage/PaymentReschedule/', 'admin', sendData)
      .pipe(first())
      .subscribe(
        res => {
          if (res['statusCode'] == 200) {
            console.log(res);
            //this.get(this.id);
            this.paymentReschedule(this.id);
            //this.router.navigate(['admin/dashboard']);
            this.message = ['Successfully Saved.'];
            this.modalRef = this.modalService.show(this.messagebox);
          } else {
            this.message = ['Something problem.'];
            if (res['message']) {
              this.message = [res['message']];
            }
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },
        err => {
          console.log(err);
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
