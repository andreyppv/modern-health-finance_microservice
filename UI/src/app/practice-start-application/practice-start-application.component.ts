import {
  Component,
  EventEmitter,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  PlaidConfig,
  NgxPlaidLinkService,
  PlaidLinkHandler,
} from 'ngx-plaid-link';
import { first } from 'rxjs/operators';
import { environment, readyMade } from 'src/environments/environment';
import {
  CommonDataInatance,
  FinanceInatance,
} from '../_service/comman.service';
import { MustMatch } from '../_service/custom.validator';
import { HttpService } from '../_service/http.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SignaturePad } from 'angular2-signaturepad';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-practice-start-application',
  templateUrl: './practice-start-application.component.html',
  styleUrls: ['./practice-start-application.component.scss'],
})
export class PracticeStartApplicationComponent implements OnInit {
  contactForm: FormGroup;
  phonenumForm: FormGroup;
  isEmailEdit: boolean = false;
  isphonenumEdit: boolean = false;
  eligibleOfferDetails: any = [];
  userConsentDocuments: any = [];
  smspolicy: any = '';
  creditpull: any = '';
  esign: any = '';
  showmessage: any = [];
  selectedOffer: FormControl = new FormControl('', [Validators.required]);
  FinancialAmt: FormControl = new FormControl('', [Validators.required]);
  editEmail: FormControl = new FormControl('', [Validators.required]);
  editPhone: FormControl = new FormControl('', [Validators.required]);
  personalInfoForm: FormGroup;
  employmentForm: FormGroup;
  isContactFormComplete: boolean = false;
  isPersonalInfoComplete: boolean = true;
  isEmploymentSpecificComplete: boolean = true;
  isConnectBankComplete: boolean = true;
  isOfferSelecetdComplete: boolean = true;
  iscontractSignComplete: boolean = true;
  isVerifyContactInfo: boolean = true;
  isthankYou: boolean = true;

  isContactFormCompletetick: boolean = false;
  isPersonalInfoCompletetick: boolean = false;
  isEmploymentSpecificCompletetick: boolean = false;
  isConnectBankCompletetick: boolean = false;
  isOfferSelecetdCompletetick: boolean = false;
  iscontractSignCompletetick: boolean = false;
  isVerifyContactInfotick: boolean = false;
  dateerror: string = '';
  valid: boolean = true;

  contactFormBtn: boolean = false;
  phonenumFormBtn: boolean = false;
  personalInfoFrmBtn: boolean = false;
  employmentFrmBtn: boolean = false;
  maxDate: Date;
  typeOFResidenceList: any = [];
  employmentType: any = CommonDataInatance.getEmploymentType();
  payFrequencyType: any = CommonDataInatance.payfrequency();
  payDueDateList: any = CommonDataInatance.payDueDate();
  stateList = [];
  practiceList: any = [];
  practiceMainColor = '#fff';
  practiceSecondaryColor = '#fff';
  path = 'assets/new/logo.svg';
  loanid: string = '';
  fieldTextType1: boolean = false;
  fieldTextType2: boolean = false;
  private config: PlaidConfig = {
    apiVersion: environment.plaidApiVersion,
    env: environment.plaidEnv,
    token: '',
    webhook: '',
    product: ['auth', 'assets', 'transactions'],
    countryCodes: ['US'],
    key: '',
    onSuccess: (token, metadata) => this.onSuccess(token, metadata),
    onExit: (error, metadata) => this.onExit(error, metadata),
    onEvent: (eventName, metadata) => this.onEvent(eventName, metadata),
  };
  private plaidLinkHandler: PlaidLinkHandler;
  contractnoteShow: boolean;
  contractSignShow: boolean;
  htmlDocStatic: any;
  multipleSignature = [];
  htmlDoc: any;
  editEmailFields = {};
  editPhonenumFields = {};

  private signaturePadOptions: Object = {
    // passed through to szimek/signature_pad constructor
    minWidth: 0,
    canvasWidth: 900,
    canvasHeight: 170,
    penColor: 'rgb(63, 133, 202)',
    backgroundColor: 'rgb(255, 255, 255)',
  };

  @ViewChildren(SignaturePad) signaturePad: QueryList<SignaturePad>;
  emitter: EventEmitter<string> = new EventEmitter();
  practiceUrl: string;
  dateval: string = '';
  below: boolean = false;
  maxdate: string;
  constructor(
    private service: HttpService,
    private formBuilder: FormBuilder,
    public router: Router,
    private route: ActivatedRoute,
    private plaidLinkService: NgxPlaidLinkService,
    private modalService: BsModalService,
    public sanitizer: DomSanitizer,
    private datepipe: DatePipe
  ) {
    // this.getPracticeName();
  }
  options: {} = {
    componentRestrictions: {
      country: ['US'],
    },
  };
  public handleAddressChange(address: any) {
    this.contactForm.value.streetaddress = address.formatted_address;
    console.log('gadd', address.address_components);
    //for (const component of address.address_components) {
    //const componentType = component.types[0];
    // switch (componentType) {

    //   case "postal_code": {
    //     this.data.businessInstallZipCode = `${component.long_name}`;
    //     break;
    //   }

    //   // case "postal_code_suffix": {
    //   //   this.data.businessInstallZipCode = `${this.data.ownerZipCode}-${component.long_name}`;
    //   //   break;
    //   // }

    //   case "locality":
    //     this.data.businessInstallCity = component.long_name;
    //     break;

    //   case "administrative_area_level_1": {
    //     this.data.businessInstallState = component.long_name;
    //     break;
    //   }
    // }
    //}
  }
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
    this.practiceUrl = this.route.snapshot.paramMap.get('practiceUrl');
    this.loanid = this.route.snapshot.paramMap.get('practiceid');
    this.maxdate = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
    console.log('date', this.maxdate);
    console.log('checkurl', this.practiceUrl);
    if (
      this.practiceUrl != null &&
      this.practiceUrl &&
      this.practiceUrl != undefined
    ) {
      this.getPracticeDetailsByUrl(this.practiceUrl);
    } else if (this.loanid == null) {
      this.getPracticeName();
    }
    this.stateList = CommonDataInatance.stateList();

    if (this.loanid != undefined && this.loanid != null && this.loanid) {
      // alert(this.loanid);
      this.getloanStage();
    }
    this.phonenumForm = this.formBuilder.group(
      {
        newphonenum: ['', [Validators.required, Validators.minLength(10)]],
      }
    );
    this.contactForm = this.formBuilder.group(
      {
        practiceid: ['', [Validators.required]],
        firstname: [
          '',
          [Validators.required, Validators.pattern(readyMade.pattern.name)],
        ],
        middlename: [''],
        lastname: [
          '',
          [Validators.required, Validators.pattern(readyMade.pattern.name)],
        ],
        email: [
          '',
          [Validators.required, Validators.pattern(readyMade.pattern.email)],
        ],
        phoneNumber: ['', [Validators.required, Validators.minLength(10)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validator: MustMatch('password', 'confirmPassword'),
      }
    );
    this.personalInfoForm = this.formBuilder.group({
      streetaddress: ['', [Validators.required]],
      unitApartment: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipcode: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.pattern(readyMade.pattern.number),
        ],
      ],
      ssn: ['', [Validators.required, Validators.minLength(9)]],
      monthlyRent: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.decimal)],
      ],
      income: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.decimal)],
      ],
      typeResidence: ['', Validators.required],
      userConsent: [false, [Validators.requiredTrue]],
    });
    this.employmentForm = this.formBuilder.group({
      employertatus: ['', [Validators.required]],
      employerName: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.name)],
      ],
      phoneNumber: ['', [Validators.required, Validators.minLength(9)]],
      hireDate: ['', [Validators.required]],

      jobtitle: ['', Validators.required],
      payfrequency: ['', Validators.required],
      payDueDate: ['', Validators.required],
    });
    this.typeOFResidenceList = CommonDataInatance.getTypeOfResidency();
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }

  validateDOB(e) {
    console.log('start', e);
    let year = new Date(e).getFullYear();
    let today = new Date().getFullYear();
    console.log(year);
    console.log(today);
    if (today - year >= 18) {
      console.log('18above');
      this.dateval = '';
      this.below = false;
    } else {
      this.dateval = 'age must be above 18';

      this.below = true;
      console.log('below 18');
    }
  }
  getPracticeDetailsByUrl(url: string = '') {
    if (url) {
      this.service
        .get(`practice/practice-by-url/${url}`, 'admin')
        .pipe(first())
        .subscribe(
          (res) => {
            let practiceData = res['practice'];
            if (res['statusCode'] == 200) {
              this.service.getMainColor.next(practiceData);
              this.practiceList = [];
              this.practiceList.push({
                id: practiceData['id'],
                practiceName: practiceData['practicename'],
              });
              this.contactForm.patchValue({ practiceid: practiceData['id'] });
              console.log(this.practiceList);
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
  getPracticeName() {
    this.service
      .get('practice/getPracticeName', 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            let practiceData = res['allPractice'];
            this.practiceList = [];
            for (let i = 0; i < practiceData.length; i++) {
              this.practiceList.push({
                id: practiceData[i]['id'],
                practiceName: practiceData[i]['practicename'],
              });
            }
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
  getloanStage() {
    this.service
      .get(`loan/getStage/${this.loanid}`, 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            let data = res['data'];
            if (data.length > 0) {
              if (data[0].step == 2) {
                this.getUserConsentDocuments();
                this.isContactFormComplete = true;
                this.isContactFormCompletetick = true;
                this.isPersonalInfoComplete = false;
              } else if (data[0].step == 3) {
                this.isContactFormComplete = true;
                this.isContactFormCompletetick = true;
                this.isPersonalInfoComplete = true;
                this.isPersonalInfoCompletetick = true;
                this.isEmploymentSpecificComplete = false;
              } else if (data[0].step == 4) {
                this.isContactFormComplete = true;
                this.isContactFormCompletetick = true;
                this.isPersonalInfoComplete = true;
                this.isPersonalInfoCompletetick = true;
                this.isEmploymentSpecificComplete = true;
                this.isEmploymentSpecificCompletetick = true;
                this.isConnectBankComplete = false;
              } else if (data[0].step == 5) {
                this.getSystemGenerateOffer();
                this.isContactFormComplete = true;
                this.isContactFormCompletetick = true;
                this.isPersonalInfoComplete = true;
                this.isPersonalInfoCompletetick = true;
                this.isEmploymentSpecificComplete = true;
                this.isEmploymentSpecificCompletetick = true;
                this.isConnectBankComplete = true;
                this.isConnectBankCompletetick = true;
                this.isOfferSelecetdComplete = false;
              } else if (data[0].step == 6) {
                this.getSystemGenerateOffer();
                this.get(this.loanid);
                this.isContactFormComplete = true;
                this.isContactFormCompletetick = true;
                this.isPersonalInfoComplete = true;
                this.isPersonalInfoCompletetick = true;
                this.isEmploymentSpecificComplete = true;
                this.isEmploymentSpecificCompletetick = true;
                this.isConnectBankComplete = true;
                this.isConnectBankCompletetick = true;
                this.isOfferSelecetdComplete = true;
                this.isOfferSelecetdCompletetick = true;
                this.iscontractSignComplete = false;
              } else if (data[0].step == 7) {
                // this.getSystemGenerateOffer();
                this.get(this.loanid);
                this.isContactFormComplete = true;
                this.isContactFormCompletetick = true;
                this.isPersonalInfoComplete = true;
                this.isPersonalInfoCompletetick = true;
                this.isEmploymentSpecificComplete = true;
                this.isEmploymentSpecificCompletetick = true;
                this.isConnectBankComplete = true;
                this.isConnectBankCompletetick = true;
                this.isOfferSelecetdComplete = true;
                this.isOfferSelecetdCompletetick = true;
                this.iscontractSignComplete = true;
                this.iscontractSignCompletetick = true;
                this.isVerifyContactInfo = false;
              } else if (data[0].step == 8) {
                // this.getSystemGenerateOffer();
                this.get(this.loanid);
                this.isContactFormComplete = true;
                this.isContactFormCompletetick = true;
                this.isPersonalInfoComplete = true;
                this.isPersonalInfoCompletetick = true;
                this.isEmploymentSpecificComplete = true;
                this.isEmploymentSpecificCompletetick = true;
                this.isConnectBankComplete = true;
                this.isConnectBankCompletetick = true;
                this.isOfferSelecetdComplete = true;
                this.isOfferSelecetdCompletetick = true;
                this.iscontractSignComplete = true;
                this.iscontractSignCompletetick = true;
                this.isVerifyContactInfo = true;
                this.isVerifyContactInfotick = true;
                this.isthankYou = false;
              }
            }
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
  getSystemGenerateOffer() {
    this.service
      .get(`loan/generateOffer/${this.loanid}`, 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            let data = res['data'];
            if (data.length > 0) {
              this.eligibleOfferDetails = data;
              this.FinancialAmt.setValue(
                this.eligibleOfferDetails[0].financialamount
              );
            }
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
  sendFormDetails(formType: string = '') {
    // Contact Form Submitting

    let sendData = {};

    let apiUrl: string = '';
    if (formType == 'contactForm') {
      this.contactFormBtn = true;
      if (!this.contactForm.invalid) {
        let data = this.contactForm.value;
        sendData = {
          firstname: data.firstname,
          middlename: data.middlename != null ? data.middlename : '',
          lastname: data.lastname,
          email: data.email,
          phone: data.phoneNumber,
          password: data.password,
          practiceid: data.practiceid,
        };
        apiUrl = 'loan/contactinfo';
      }
    } else if (formType == 'personalInfo') {
      // this.valid = true;

      this.personalInfoFrmBtn = true;
      // console.log(this.personalInfoForm.invalid);
      // console.log(this.personalInfoForm);
      // console.log(this.personalInfoForm.valid);
      if (!this.personalInfoForm.valid) {
        return false;
      }
      console.log('Formvalid', this.personalInfoForm.valid);
      if (!this.personalInfoForm.invalid && !this.below) {
        let data = this.personalInfoForm.value;
        // let dateCheck = this.dateofbrithVaild(data.dob);
        // let dateCheck = this.dateofbrithVaild(data.hireDate);
        // if (!dateCheck.status) {
        //   this.valid = false;
        //   this.service.showError(dateCheck.message);
        // }
        // console.log('Valid',this.valid)
        //return;
        sendData = {
          streetaddress: data.streetaddress,
          unit: data.unitApartment,
          city: data.city,
          state: data.state,
          zipcode: data.zipcode,
          birthday: data.dob,
          socialsecuritynumber: data.ssn,
          monthlyMortgage: Number(data.monthlyRent),
          monthlyincome: Number(data.income),
          typeofresidence: data.typeResidence,
          isagree: data.userConsent,
        };

        apiUrl = `loan/updatePersonalInfo/${this.loanid}`;
      }
    } else if (formType == 'employment') {
      this.employmentFrmBtn = true;
      this.valid = true;
      let data = this.employmentForm.value;
      // let dateCheck = this.dateofbrithVaild(data.hireDate);
      // if (!dateCheck.status) {
      //   this.valid = false;
      //   this.service.showError(dateCheck.message);
      // }
      // console.log('Valid',this.valid)
      if (!this.employmentForm.invalid && this.valid) {
        sendData = {
          employmentStatus: data.employertatus,
          employerName: data.employerName,
          employerphone: data.phoneNumber,
          dateofhired: data.hireDate,
          jobtitle: data.jobtitle,
          payrollFreq: data.payfrequency,
          paymentdate: data.payDueDate,
        };
        console.log('senddata');
        console.log(551)
        apiUrl = `loan/updateEmploymentInfo/${this.loanid}`;
      }
    }
    if (
      this.contactForm.valid ||
      !this.personalInfoForm.invalid ||
      this.employmentForm.valid
    ) {
      console.log('employee date', sendData);
      this.service
        .post(apiUrl, 'admin', sendData)
         .pipe(first())
        .subscribe(
          (res) => {
            console.log("565")
            if (res['statusCode'] == 200) {
              if (formType == 'contactForm') {
                if (
                  res['loan_id'] != undefined &&
                  res['loan_id'] != null &&
                  res['loan_id']
                ) 
              //  if (1)
                {
                  console.log("574")
                  this.loanid = res['loan_id'];
               //   this.router.navigate([`startApplication/${this.loanid}`]);
                  console.log(this.loanid);
                  this.isContactFormComplete = true;
                  this.isContactFormCompletetick = true;
                  this.isPersonalInfoComplete = false;
                //  this.getUserConsentDocuments();
                }
              } else if (formType == 'personalInfo') {
                this.isPersonalInfoComplete = true;
                this.isPersonalInfoCompletetick = true;
                this.isEmploymentSpecificComplete = false;
                window.scrollTo(0, 0);
              } else if (formType == 'employment') {
                this.isEmploymentSpecificComplete = true;
                this.isEmploymentSpecificCompletetick = true;
                this.isConnectBankComplete = false;
                window.scrollTo(0, 0);
              }
              this.service.showSuccess('Successfully Saved');
            } else {
              this.service.showError('Not Saved');
            }
          },
          (err) => {
            console.log(err);
          }
        );
    }
  }

  get phonenumFormValidation() {
    return this.phonenumForm.controls;
  }

  get contactFormValidation() {
    return this.contactForm.controls;
  }

  get personalInfoFormValidation() {
    // if(this.personalInfoForm.controls.zipcode){
    //  // console.log("Dirty:",this.personalInfoForm.controls.zipcode.dirty);
    //   console.log("Touched:",this.personalInfoForm.controls.zipcode.touched);
    // }

    return this.personalInfoForm.controls;
  }
  get employmentValidation() {
    return this.employmentForm.controls;
  }
  plaidLogin() {
    this.service
      .get('loan/plaidLinkToken/' + this.loanid, 'admin')
      .subscribe((res) => {
        this.config.token = res['token'];
        this.plaidLinkService
          .createPlaid(
            Object.assign({}, this.config, {
              onSuccess: (token, metadata) => this.onSuccess(token, metadata),
              onExit: (error, metadata) => this.onExit(error, metadata),
              onEvent: (eventName, metadata) =>
                this.onEvent(eventName, metadata),
            })
          )
          .then((handler: PlaidLinkHandler) => {
            this.plaidLinkHandler = handler;
            this.open();
          });
      });
  }
  onSuccess(token, metadata) {
    var sendData: any = { public_token: token };
    this.service
      .post('loan/plaidsavetoken/' + this.loanid, 'admin', sendData)
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            // this.activeteFrom = 'connectAfter';
            this.service.showSuccess('Bank connected.');
            // this.emitter.emit();
            // this.showContinue = true;
            this.isConnectBankComplete = true;
            this.isConnectBankCompletetick = true;
            this.isOfferSelecetdComplete = false;
            this.getSystemGenerateOffer();
          } else {
            let msg;
            try {
              msg = res['message'][0];
            } catch (e) {
              msg = 'Something problem try later.';
            }
            this.service.showError(msg);
          }
        },
        (err) => {
          this.service.showError('Something problem try later.');
          console.log(err);
        }
      );
  }
  onExit(error, metadata) {
    this.service.get('hubspot/' + this.loanid, 'admin').subscribe(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.log(err);
      }
    );
    console.log('plaid error', error);
    // console.log("We exited:", error);
    // console.log("We got metadata:", metadata);
  }
  onEvent(eventName, metadata) {
    console.log('plaid event', eventName);
    if (eventName == 'ERROR') {
      this.service.get('hubspot/' + this.loanid, 'admin').subscribe(
        (res) => {
          console.log(res);
        },
        (err) => {
          console.log(err);
        }
      );
    }
    // console.log("We got an event:", eventName);
    // console.log("We got metadata:", metadata);
  }
  open() {
    this.plaidLinkHandler.open();
  }
  exit() {
    this.plaidLinkHandler.exit();
  }
  resendEmailVerify() {
    this.service
      .get('loan/triggerMail/' + this.loanid, 'admin')
      .subscribe((res) => {
        this.service.showSuccess('Email Send Successfully');
      });
  }
  validFinancialAmt() {
    if (
      this.eligibleOfferDetails[0].financialamount < this.FinancialAmt.value
    ) {
      this.service.showError(
        `Please enter the less than or equal to Pre-Approved Loan Amount`
      );
      this.FinancialAmt.setValue(this.eligibleOfferDetails[0].financialamount);
    }
  }
  CalcPayment() {
    let financialAmt = this.FinancialAmt.value;

    for (let i = 0; i < this.eligibleOfferDetails.length; i++) {
      let monthlyAmount = FinanceInatance.findPaymentAmount(
        financialAmt,
        this.eligibleOfferDetails[i].interestrate,
        this.eligibleOfferDetails[i].duration
      );
      this.eligibleOfferDetails[i].monthlyamount = monthlyAmount;
      this.eligibleOfferDetails[i].financialamount = financialAmt;
    }
  }
  confirmSelOffer() {
    if (this.selectedOffer.status == 'VALID') {
      let reqData = {
        offer_id: this.selectedOffer.value,
        loanamount: Number(this.FinancialAmt.value),
      };
      this.service
        .post(`loan/saveEligibleOffer/${this.loanid}`, 'admin', reqData)
        .pipe(first())
        .subscribe(
          (res: any) => {
            if (res.statusCode == 200) {
              this.get(this.loanid);
              this.isOfferSelecetdComplete = true;
              this.isOfferSelecetdCompletetick = true;
              this.iscontractSignComplete = false;
              //window.location.reload();
            }
          },
          (err) => {
            console.log(err.error.message);
          }
        );
    } else {
      this.service.showError('Please select any offer');
    }
  }

  //

  drawStart() {}
  drawComplete() {}
  signAccept(index) {
    let signaturePad = this.signaturePad.get(index);
    console.log("signaturepad",signaturePad);
    console.log("mulitesignaturepad", this.multipleSignature);
    this.multipleSignature[index].signature = signaturePad.toDataURL();
    this.multipleSignature[index].signCameFromUI = true;
    this.contractnoteShow = true;
    this.multipleSignature[index].id = this.loanid;
    window.scrollTo(1000, 1000);
    this.loadDocHtml();
    console.log(this.multipleSignature);
  }

  sendForm() {
    console.log("signaturepad",this.signaturePad);
    console.log("mulitesignaturepad", this.multipleSignature);
    let reqData = { signatures: [] },
      formVaild = false;
    // for (let i = 0; i < this.multipleSignature.length; i++) {
    //   if (this.multipleSignature[i].signCameFromUI) {
    //     formVaild = true;
    //     reqData.signatures.push({
    //       ownerID: this.multipleSignature[i].id,
    //       signature: this.multipleSignature[i].signature,
    //     });
    //   }
    // }
    console.log(reqData);

   // if (formVaild) {
   if (1) { 
   this.service
        .post(`loan/savePromissoryNote/` + this.loanid, 'admin', reqData)
        .pipe(first())
        .subscribe(
          (res: any) => {
            if (res.statusCode == 200) {
              // this.emitter.emit();
              // this.loadDocHtml();
              this.iscontractSignComplete = true;
              this.iscontractSignCompletetick = true;
              this.isVerifyContactInfo = false;
              window.scrollTo(0, 0);
              this.service.showSuccess('Email Send Successfully');
            } else {
            }
          },
          (err) => {
            console.log(err.error.message);
          }
        );
      // this.resendEmailVerify();
    } else {
    }
  }
  applicationFinalSubmit() {
    this.service
      .put(`loan/updateStage/${this.loanid}`, 'admin', '')
      .pipe(first())
      .subscribe(
        (res) => {
          let practiceData = res['practice'];
          if (res['statusCode'] == 200) {
            this.isVerifyContactInfo = true;
            this.isVerifyContactInfotick = true;
            this.isthankYou = false;
            window.scrollTo(0, 0);
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
  async get(id: any) {
    //alert(this.loanid);
    var result = this.service
      .get('loan/getPromissoryNote/' + this.loanid, 'admin')
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.htmlDocStatic = res['data'];console.log('Result=>',res['userDetails']);
            this.loadDocHtml();
            let _multipleSignature = [res['userDetails']];
            this.multipleSignature = _multipleSignature;
            // this.editEmail.setValue(res['userDetails'].email);
            // this.editPhone.setValue(res['userDetails'].phone);
            // this.editEmailFields['newEmail'] = this.editEmail.value;
            // this.editEmailFields['oldEmail'] = this.editEmail.value;
            // this.phonenumForm.patchValue({ newphonenum: this.editPhone.value });
            console.log(861);
           // this.loadDocHtml();
            return res;
          }
        },
        (err) => {
          console.log(err);
        }
      );
    // var result = new Promise((resolve, reject) => {
    //   this.service
    //     .authget('loan/getPromissoryNote/' + this.loanid, 'admin')
    //     .pipe(first())
    //     .subscribe(
    //       (res) => {
    //         if (res['statusCode'] == 200) {
    //           this.htmlDocStatic = res['data'];
    //           let _multipleSignature = [res['userDetails']];
    //           this.multipleSignature = _multipleSignature;
    //           this.editEmail.setValue(res['userDetails'].email);
    //           this.loadDocHtml();
    //         } else {
    //         }
    //         resolve(res);
    //       },
    //       (err) => {
    //         reject(err);
    //         //console.log(err);
    //       }
    //     );
    // });
    // console.log(result);
    return result;
  }

  signClear(index) {
    this.multipleSignature[index].signature = '';
    let signaturePad = this.signaturePad.get(index);
    signaturePad.clear();
    this.loadDocHtml();
  }

  changeAccordion(actType: string) {
    if (actType == 'sign') {
      this.contractnoteShow = false;
      this.contractSignShow = true;
    } else {
      this.contractnoteShow = true;
      this.contractSignShow = false;
    }
  }
  loadDocHtml() {
    //debugger
    let htc;
    htc = this.htmlDocStatic;
    for (let i = 0; i < this.multipleSignature.length; i++) {
      if (this.multipleSignature[i].signature) {
        htc = htc.replaceAll(  `{({Signature${i}})}`, this.multipleSignature[i].signature);
      }
    }
    htc = btoa(unescape(encodeURIComponent(htc)));
    //console.log(htc,"base64");
    this.htmlDoc = this.sanitizer.bypassSecurityTrustResourceUrl(
      'data:text/html;base64,' + htc
    );
    //this.htmlDoc = 'data:text/html;base64,' + htc;
  }
  safeResourceUrl(url: string): SafeResourceUrl {
    //this.sanitizer;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  toggleFieldTextType1() {
    //
    this.fieldTextType1 = !this.fieldTextType1;
  }
  toggleFieldTextType2() {
    this.fieldTextType2 = !this.fieldTextType2;
  }

  dateofbrithVaild(date: string) {
    let result = { status: false, message: '' };
    let dateformat =
      /^(0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])[\/\-]\d{4}$/;
    if (date.match(dateformat)) {
      result.status = true;
      result.message = '';
    } else {
      result.status = false;
      result.message = 'Date is not vaild';
    }
    return result;
  }
  getUserConsentDocuments() {
    console.log('Loan Id', this.loanid);
    this.service
      .get(`loan/Document/${this.loanid}`, 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.userConsentDocuments = res['data'];
            console.log('length => ', this.userConsentDocuments);
            for (let i = 0; i < this.userConsentDocuments.length - 1; i++) {
              if (this.userConsentDocuments[i].name == 'SMS Policy') {
                this.smspolicy = this.userConsentDocuments[i].filepath;
              }
              if (this.userConsentDocuments[i].name == 'Credit Pull Consent') {
                this.creditpull = this.userConsentDocuments[i].filepath;
              }
              if (this.userConsentDocuments[i].name == 'E-Signature') {
                this.esign = this.userConsentDocuments[i].filepath;
              }
            }
          } else {
            this.showmessage = res['message'];
            this.service.showError('Invaild');
          }
        },
        (err) => {
          this.service.showError('Invaild');
        }
      );
  }
  view(filename: any) {
    // console.log('Hello');
    filename = filename.split('/');
    filename = filename[filename.length - 1];
    window.open(
      environment.adminapiurl + 'files/download/' + filename,
      '_blank'
    );
  }

  editEmailResend() {
    this.service
      .put(`loan/updateEmail/${this.loanid}`, 'admin', this.editEmailFields)
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.editEmail.setValue(this.editEmailFields['newEmail']);
            this.isEmailEdit = false;
          } else {
            this.showmessage = res['message'];
            this.service.showError('Invaild');
          }
        },
        (err) => {
          this.service.showError('Invaild');
        }
      );
  }

  editPhonenumber() {
    if (this.phonenumForm.valid) {
      this.phonenumFormBtn = true;
      let updphonenum: any = this.phonenumForm.value;
      this.service
      .put(`loan/updatePhonenum/${this.loanid}`, 'admin', updphonenum)
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.editPhone.setValue(updphonenum.newphonenum);
            this.isphonenumEdit = false;
          } else {
            this.showmessage = res['message'];
            this.service.showError('Invaild');
          }
        },
        (err) => {
          this.service.showError('Invaild');
        }
      );
    }
  }

  customkey(e) {
    e.preventDefault();
    return false;
  }
}
