import {
  Component,
  OnInit,
  NgModule,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { environment, readyMade } from '../../../environments/environment';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import {
  CommonDataInatance,
  FinanceInatance,
} from '../../_service/comman.service';
@Component({
  selector: 'app-start-application',
  templateUrl: './start-application.component.html',
  styleUrls: ['./start-application.component.scss'],
})
export class StartApplicationComponent implements OnInit {
  data: any = [];
  maxDate: Date;
  apibtn: boolean = false;
  smspolicy: any = '';
  creditpull: any = '';
  esign: any = '';
  apForm: FormGroup;
  durationMonths = FinanceInatance.durationMonths;
  stateList = [];
  message: any = [];
  modalRef: BsModalRef;
  practiceList: any = [];
  typeOFResidenceList: any = [];
  userConsentDocuments: any = [];
  showmessage: any = [];
  todayDate: string;
  notSelected: boolean = false;
  @ViewChild('messagebox', { read: TemplateRef }) messagebox: TemplateRef<any>;
  constructor(
    private service: HttpService,
    private formBuilder: FormBuilder,
    public router: Router,
    private modalService: BsModalService,
    private route: ActivatedRoute
  ) {
    console.log(readyMade);
  }
  get apiFormvalidation() {
    return this.apForm.controls;
  }
  ngOnInit(): void {
    this.stateList = CommonDataInatance.stateList();
    this.typeOFResidenceList = CommonDataInatance.getTypeOfResidency();
    //allowed 18 old pepole
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
    this.get();
    this.getPracticeName();
    this.apForm = this.formBuilder.group({
      FirstName: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.name)],
      ],
      MiddleName: ['', [Validators.pattern(readyMade.pattern.name)]],
      LastName: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.name)],
      ],
      Email: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.email)],
      ],
      MobilePhone: ['', [Validators.required, Validators.minLength(11)]],
      StreetAddress: ['', [Validators.required]],
      UnitApartment: [''],
      City: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.name)],
      ],
      State: ['', [Validators.required]],
      practiceName: ['', [Validators.required]],
      typeOFResidence: ['', [Validators.required]],
      ZipCode: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.number)],
      ],
      SocialSecurityNumber: ['', [Validators.required]],
      DateofBirth: ['', [Validators.required]],
      MonthlyIncome: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.decimal)],
      ],
      // APR: [
      //   '',
      //   [Validators.required, Validators.pattern(readyMade.pattern.decimal)]
      // ],
      // Duration: ['12', [Validators.required]],
      // PaymentAmount: [{ value: 0, disabled: true }],
      houseExpense: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.decimal)],
      ],
      // SendEmail: [true, [Validators.requiredTrue]],
      // SendSMS: [false],
      agreement: [false, [Validators.requiredTrue]],
    });
    this.getDate();
  }
  getPracticeName() {
    this.service
      .authget('practice', 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.practiceList = res['allPractice'];
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
  get() {
    /*this.service.authget("start-appliction", "admin")
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode'] == 200) {
        this.data= res['data']
      }
    }, err=>{
      console.log(err);
    });*/
  }
  sendForm(): void {
    this.apibtn = true;
    if (!this.apForm.invalid) {
      console.log(this.apForm.value);
      //data
      let data = this.apForm.value;
      let sendData = {
        firstname: data.FirstName,
        middlename: data.MiddleName,
        lastname: data.LastName,
        email: data.Email,
        socialsecuritynumber: data.SocialSecurityNumber,
        birthday: data.DateofBirth,
        practiceid: data.practiceName,
        monthlyincome: Number(data.MonthlyIncome),
        streetaddress: data.StreetAddress,
        unit: data.UnitApartment,
        city: data.City,
        state: data.State,
        zipcode: data.ZipCode,
        phone: data.MobilePhone,
        typeofresidence: data.typeOFResidence,
        housingexpense: Number(data.houseExpense),
      };

      this.service
        .authpost('startapplication', 'admin', sendData)
        .pipe(first())
        .subscribe(
          (res) => {
            if (res['statusCode'] == 200) {
              this.router.navigate(['admin/loan-stages/waiting']);
              this.service.showSuccess('Successfully Saved');
            } else {
              console.log(res['statusCode'], res);
              this.message = [res['message']];
              this.modalRef = this.modalService.show(this.messagebox);
            }
          },
          (err) => {
            console.log(err);
          }
        );
    }
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
  close(): void {
    this.modalRef.hide();
  }
  policymodelopen(modelTemp: TemplateRef<any>) {
    if (this.apForm.get('practiceName').value) {
      this.modalRef = this.modalService.show(modelTemp);
    } else {
      this.notSelected = true;
    }
  }
  creditmodelopen(modelTemp: TemplateRef<any>) {
    if (this.apForm.get('practiceName').value) {
      this.modalRef = this.modalService.show(modelTemp);
    } else {
      this.notSelected = true;
    }
  }
  signmodelopen(modelTemp: TemplateRef<any>) {
    if (this.apForm.get('practiceName').value) {
      this.modalRef = this.modalService.show(modelTemp);
    } else {
      this.notSelected = true;
    }
  }
  getDate() {
    const today = new Date();
    let dd = String(today.getDate());
    let mm = String(today.getMonth() + 1);
    let yyyy = today.getFullYear();
    if (Number(dd) < 10) {
      dd = '0' + dd;
    }
    if (Number(mm) < 10) {
      mm = '0' + mm;
    }
    this.todayDate = mm + '/' + dd + '/' + yyyy;
  }
  selectPractice(value) {
    this.notSelected = !value ? true : false;
  }

  //view document
  // view(filename: any) {
  //   // console.log('Hello');
  //   filename = filename.split('/');
  //   filename = filename[filename.length - 1];
  //   window.open(
  //     environment.adminapiurl + 'files/download/' + filename,
  //     '_blank'
  //   );
  // }
}
