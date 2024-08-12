import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  Validators,
  FormBuilder,
  FormControl,
} from '@angular/forms';
import { HttpService } from '../_service/http.service';
import { first } from 'rxjs/operators';
import {
  readyMade,
  dispalySettings,
  environment,
} from '../../environments/environment';
import {
  FinanceInatance,
  CommonDataInatance,
} from '../_service/comman.service';
import { MustMatch } from '../_service/custom.validator';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FileValidators } from 'ngx-file-drag-drop';
import { upload } from 'ngx-bootstrap-icons';
import { SignaturePad } from 'angular2-signaturepad';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ReviewComponent implements OnInit {
  data: any = [];
  maxDate: Date;
  apibtn: boolean = false;
  apForm: FormGroup;
  durationMonths = FinanceInatance.durationMonths;
  public id: any;
  dynamicInputs: any;
  public lastscreen: string; //basic document
  public shortData: any;
  //model
  modalBrowseRef: BsModalRef;
  activeIndex: number;
  formControls: any;
  commonError: any = { error: false, message: '' };
  dpSettings: any = dispalySettings;
  plaidKey: string = ''; // environment.plaid_public_key;

  contractSignShow: boolean = true;
  contractnoteShow: boolean = false;
  public signaturePadOptions: Object = {
    // passed through to szimek/signature_pad constructor
    minWidth: 5,
    canvasWidth: 780,
    canvasHeight: 200,
    penColor: 'rgb(63, 133, 202)',
    backgroundColor: 'rgb(255, 255, 255)',
  };
  @ViewChild(SignaturePad) signaturePad: SignaturePad;
  signature: string = '';
  htmlDocStatic: string;
  htmlDoc: any;
  stateList = [];
  sourceOfIncomeList = [];
  payFrequencyList = [];
  dayOfMonthList = [];
  paymethodList = [];
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private formBuilder: FormBuilder,
    private service: HttpService,
    private modalService: BsModalService,
    public sanitizer: DomSanitizer
  ) {}
  async ngOnInit() {
    this.stateList = CommonDataInatance.stateList();
    this.sourceOfIncomeList = CommonDataInatance.sourceofincome();
    this.payFrequencyList = CommonDataInatance.payfrequency();
    this.dayOfMonthList = CommonDataInatance.dayofmonth();
    this.paymethodList = CommonDataInatance.paymethod();
    this.id = this.route.snapshot.paramMap.get('id');
    let res: any = await this.get(this.id);
    //this.lastscreen = 'promissorynote';
    res.data.lastscreen;
    this.switchScreen(res.data.lastscreen);
    /*if (this.lastscreen == "basic") {
      this.basicScreen();
    } else if (this.lastscreen == "loan") {
      this.loanScreen();
    } else if (this.lastscreen == "bank") {
      this.bankScreen();
    } else if (this.lastscreen == "document") {
      this.bankManualScreen();
    } else if (this.lastscreen == "promissorynote") {
      await this.getPromissoryNote(this.id);
    }*/
  }
  get(id: any) {
    //alert(2);
    var result = new Promise((resolve, reject) => {
      this.service
        .get('review/' + id, 'admin')
        .pipe(first())
        .subscribe(
          (res) => {
            if (res['statusCode'] == 200) {
              this.data = res['data'];
              /*this.lastscreen = (!this.data.lastscreen || this.data.lastscreen == 'null') ? 'basic' : this.data.lastscreen;
          //this.lastscreen = "basic";
          console.log(this.data);
          if (this.lastscreen == "basic") {
          } else if (this.lastscreen == "loan") {
            this.loanScreenAfterResponse();
          } else if (this.lastscreen == 'document') {
            this.manualBankSendForm(false);
          }*/
              resolve(res);
            } else {
              //this.message = res['message']
              //this.modalRef = this.modalService.show(template);
            }
          },
          (err) => {
            console.log(err);
            reject(err);
          }
        );
    });
    return result;
  }
  basicScreen() {
    //allowed 18 old pepole
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
    this.apForm = this.formBuilder.group(
      {
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
        MobilePhone: ['', [Validators.required]],
        Password: ['', [Validators.required]],
        ConfirmPassword: ['', [Validators.required]],
        StreetAddress: ['', [Validators.required]],
        UnitApartment: ['', [Validators.required]],
        City: [
          '',
          [Validators.required, Validators.pattern(readyMade.pattern.name)],
        ],
        State: ['', [Validators.required]],
        ZipCode: [
          '',
          [Validators.required, Validators.pattern(readyMade.pattern.number)],
        ],
        SocialSecurityNumber: ['', [Validators.required]],
        DateofBirth: ['', [Validators.required]],
        SourceOfIncome: ['', [Validators.required]],
        NetMonthlyIncome: [
          '',
          [Validators.required, Validators.pattern(readyMade.pattern.decimal)],
        ],
        PayFrequency: ['', [Validators.required]],
        DayOfMonth: ['', [Validators.required]],
        Paymethod: ['', [Validators.required]],
        PrivacyPolicy: [false, [Validators.requiredTrue]],
        MessagingPolicy: [false, [Validators.requiredTrue]],
      },
      { validators: MustMatch('Password', 'ConfirmPassword') }
    );
    //dynamicInputs set value
    this.dynamicInputs = {
      Password: { type: 'password', className: 'fa fa-eye-slash' },
      ConfirmPassword: { type: 'password', className: 'fa fa-eye-slash' },
      SocialSecurityNumber: { type: 'password', className: 'fa fa-eye-slash' },
    };

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
    this.apForm.get('FirstName').setValue(this.data.from_details[0].firstname);
    this.apForm
      .get('MiddleName')
      .setValue(this.data.from_details[0].middlename);
    this.apForm.get('LastName').setValue(this.data.from_details[0].lastname);
    this.apForm.get('Email').setValue(this.data.from_details[0].email);
    this.apForm.get('MobilePhone').setValue(this.data.from_details[0].phone);
    this.apForm
      .get('StreetAddress')
      .setValue(this.data.from_details[0].streetaddress);
    this.apForm.get('UnitApartment').setValue(this.data.from_details[0].unit);
    this.apForm.get('City').setValue(this.data.from_details[0].city);
    this.apForm.get('State').setValue(this.data.from_details[0].state);
    this.apForm.get('ZipCode').setValue(this.data.from_details[0].zipcode);
    this.apForm
      .get('SocialSecurityNumber')
      .setValue(this.data.from_details[0].socialsecuritynumber);
    this.apForm.get('DateofBirth').setValue(this.data.from_details[0].birthday);
    //trigger
    //find payment amount
    //this.findPaymentAmount();
  }
  passwordToggle(control: string): void {
    //console.log(this.apForm.get(control).errors);
    if (this.dynamicInputs[control].type == 'password') {
      this.dynamicInputs[control].type = 'text';
      this.dynamicInputs[control].className = 'fa fa-eye';
    } else {
      this.dynamicInputs[control].type = 'password';
      this.dynamicInputs[control].className = 'fa fa-eye-slash';
    }
  }
  basicSendForm(): void {
    this.apibtn = true;
    if (!this.apForm.invalid) {
      console.log(this.apForm.value);
      //data
      let data = this.apForm.value,
        sendData;
      sendData = {
        email: data.Email,
        firstname: data.FirstName,
        middlename: data.MiddleName,
        lastname: data.LastName,
        socialsecuritynumber: data.SocialSecurityNumber,
        birthday: data.DateofBirth,
        phoneno: data.MobilePhone,
        streetaddress: data.StreetAddress,
        unit: data.UnitApartment,
        city: data.City,
        state: data.State,
        zipcode: data.ZipCode,
        sourceofincome: data.SourceOfIncome,
        netmonthlyincome: +data.NetMonthlyIncome,
        payfrequency: data.PayFrequency,
        dayofmonth: +data.DayOfMonth,
        paidformat: data.Paymethod,
        password: data.Password,
      };

      this.service
        .patch('review/edituserDetails/' + this.id, 'admin', sendData)
        .pipe(first())
        .subscribe(
          async (res) => {
            if (res['statusCode'] == 200) {
              console.log(res);
              try {
                await this.get(this.id);
              } catch (e) {
                console.log(e, 'lastScreen eror');
              }
              this.switchScreen('loan');
              //this.router.navigate(['appliction/review/' + this.id]);
            } else {
              console.log(res['statusCode'], res);
            }
          },
          (err) => {
            console.log(err.error.message);
          }
        );
    }
  }
  get apiFormvalidation() {
    return this.apForm.controls;
  }
  loanScreen() {
    this.shortData = {};
    this.apForm = this.formBuilder.group({
      LoanAmount: [0],
      APR: [0],
      Duration: [0],
      PaymentAmount: [{ value: 0, disabled: true }],
    });

    let percentage = 30;
    this.shortData = {
      loanamount: this.data.from_details[0].loanamount,
      payfrequency: this.data.from_details[0].payfrequency,
      loanterm: this.data.from_details[0].loanterm,
      apr: this.data.from_details[0].apr,
    };
    this.shortData.loanMin =
      this.shortData.loanamount -
      (this.shortData.loanamount / 100) * percentage;
    this.shortData.loanMax =
      this.shortData.loanamount +
      (this.shortData.loanamount / 100) * percentage;
    this.shortData.loanStep = Math.round((this.shortData.loanamount / 100) * 1);
    this.apForm = this.formBuilder.group({
      LoanAmount: [this.shortData.loanamount],
      //APR: [this.shortData.apr],
      //Duration: [this.shortData.loanterm],
      //PaymentAmount: [{value: 0, disabled: true}],
    });
    this.findPaymentAmount();
  }
  findPaymentAmount(): number {
    var monthly: any;
    let loanamount = this.apForm.get('LoanAmount').value,
      arr = this.shortData.apr,
      duration = this.shortData.loanterm;
    monthly = FinanceInatance.findPaymentAmount(
      Number(loanamount),
      Number(arr),
      Number(duration)
    );
    this.shortData.paymentAmount = monthly;
    return monthly;
  }
  loanSendForm(): void {
    var sendData = { loan_id: this.id };
    this.service
      .post('review/selectLoan/', 'admin', sendData)
      .pipe(first())
      .subscribe(
        (res) => {
          console.log(res);
          if (res['statusCode'] == 200) {
            this.lastscreen = 'bank';
          } else {
            console.log(res['statusCode'], res);
          }
        },
        (err) => {
          console.log(err.error.message);
        }
      );
  }
  bankScreen() {}
  manualBankSendForm(trackUpadate: boolean = true): void {
    if (trackUpadate) {
      var sendData = { loan_id: this.id };
      this.service
        .post('review/bankManual/', 'admin', sendData)
        .pipe(first())
        .subscribe(
          (res) => {
            if (res['statusCode'] == 200) {
              console.log(res);
            } else {
              console.log(res['statusCode'], res);
            }
          },
          (err) => {
            console.log(err.error.message);
          }
        );
    }
    this.switchScreen('document');
  }
  bankManualScreen(): void {
    //dynamicInputs set value
    this.dynamicInputs = CommonDataInatance.documentsTypes(true);
    //console.log('dynamicInputs', this.dynamicInputs);

    //uploaded files add
    if (this.data.userDocument) {
      for (let i = 0; i < this.dynamicInputs.length; i++) {
        for (let j = 0; j < this.data.userDocument.length; j++) {
          if (
            this.dynamicInputs[i].documenttype == this.data.userDocument[j].type
          ) {
            this.dynamicInputs[i].uploadedFiles.push(
              this.data.userDocument[j].orginalfileName
            );
            this.dynamicInputs[i].download.push(
              this.data.userDocument[j].fileName
            );
          }
        }

        //formcontrol only working this npm package
        this.dynamicInputs[i].formControls = {
          docFile: new FormControl(
            [],
            [
              FileValidators.required,
              FileValidators.fileExtension(['png', 'jpeg', 'pdf', 'jpg']),
            ]
          ),
          type: new FormControl(this.dynamicInputs[i].documenttype),
        };

        this.dynamicInputs[i].formControls.docFile.valueChanges.subscribe(
          (files: File[]) => {
            // console.log(this.dynamicInputs[i].formControls.docFile.value, this.dynamicInputs[i].formControls.docFile.valid);
            this.uploadDoc(i);
          }
        );
      }

      // console.log('uploadedFiles', this.dynamicInputs);
    }
  }
  openModalFile(template: TemplateRef<any>, index: number) {
    this.activeIndex = index;
    this.formControls.type.setValue(
      this.dynamicInputs[this.activeIndex].documenttype
    );
    this.modalBrowseRef = this.modalService.show(template);
    console.log(template, index);
  }
  /*uploadDoc() :void {
    if (this.formControls.docFile.valid) {
      this.modalBrowseRef.hide();
      let formData = new FormData();
      formData.append("type",this.formControls.type.value);
      formData.append("loan_id",this.id);
      formData.append("files",this.formControls.docFile.value[0]);
      console.log(this.formControls.docFile.value);
      this.service.files("uploadfiles/uploads/", 'admin', formData)
        .pipe(first())
          .subscribe(res => {
            if (res['statusCode'] == 200) {
              console.log(res);
              //value update
              this.dynamicInputs[this.activeIndex].uploadedFiles.push(this.formControls.docFile.value[0].name);
              this.dynamicInputs[this.activeIndex].download.push(res['data']['key']); 
              this.formControls.docFile.setValue([]);
            } else {
              console.log(res['statusCode'], res);
            }
          }, err => {
            console.log(err.error.message);
      });
    } else {
      //show error
      console.log("error");
      console.log(this.formControls.docFile.value, this.formControls.docFile.valid,"here",this.formControls.docFile.errors);
    }
  }*/
  uploadDoc(activeIndex: number) {
    if (this.dynamicInputs[activeIndex].formControls.docFile.valid) {
      let formData = new FormData();
      formData.append(
        'type',
        this.dynamicInputs[activeIndex].formControls.type.value
      );
      formData.append('loan_id', this.id);
      formData.append(
        'files',
        this.dynamicInputs[activeIndex].formControls.docFile.value[0]
      );

      this.service
        .files('uploadfiles/uploads/', 'admin', formData)
        .pipe(first())
        .subscribe(
          (res) => {
            if (res['statusCode'] == 200) {
              console.log(res);
              //value update
              this.dynamicInputs[activeIndex].uploadedFiles.push(
                this.dynamicInputs[activeIndex].formControls.docFile.value[0]
                  .name
              );
              this.dynamicInputs[activeIndex].download.push(res['data']['key']);
              this.dynamicInputs[activeIndex].formControls.docFile.setValue([]);
            } else {
              console.log(res['statusCode'], res);
              this.service.showError('Something problem');
            }
          },
          (err) => {
            console.log(err.error.message);
            this.service.showError('Something problem');
          }
        );
    } else {
      //show error
      //console.log('error');
      //console.log(this.dynamicInputs[activeIndex].formControls.docFile.value,this.dynamicInputs[activeIndex].formControls.docFile.valid);
    }
  }
  uploadsComplete(): void {
    //check all updated
    var isDoneUplad = true;
    for (let i = 0; i < this.dynamicInputs.length; i++) {
      if (this.dynamicInputs[i].uploadedFiles.length == 0) {
        isDoneUplad = false;
        break;
      }
    }
    if (isDoneUplad) {
      //goto next stage
      this.commonError.error = false;
      this.commonError.message = '';
      let sendData = { loan_id: this.id };
      this.service
        .files('uploadfiles/pending/', 'admin', sendData)
        .pipe(first())
        .subscribe(
          (res) => {
            if (res['statusCode'] == 200) {
              console.log(res);
              //screen update
              this.switchScreen('completed');
            } else {
              console.log(res['statusCode'], res);
            }
          },
          (err) => {
            console.log(err.error.message);
          }
        );
    } else {
      //show messge
      this.commonError.error = true;
      this.commonError.message = 'Upload all required documents.';
    }
  }
  //Delete User Upload Document
  deleteUserUploadDocument(index, uploadedFilesIndex): void {
    let sendData = {
      loan_id: this.id,
      fileName: this.dynamicInputs[index].download[uploadedFilesIndex],
      type: this.dynamicInputs[index].documenttype,
    };
    this.service
      .post('uploadfiles/DeleteUploadFile/' + this.id, 'admin', sendData)
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            console.log(res);
            this.dynamicInputs[index].uploadedFiles.splice(
              uploadedFilesIndex,
              1
            );

            this.dynamicInputs[index].download.splice(uploadedFilesIndex, 1);
          } else {
            console.log(res['statusCode'], res);
          }
        },
        (err) => {
          console.log(err.error.message);
        }
      );
  }
  //connect bank methods
  onPlaidEvent(event) {
    //console.log(event)
  }
  onPlaidSuccess(event: any, reconnect: boolean = false) {
    var sendData: any = { public_token: event.token };
    sendData.reconnect = reconnect;
    this.service
      .post('plaid/savetoken/' + this.id, 'admin', sendData)
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            if (reconnect) {
              // plaid relogin
              //this.lastscreen = "completed";
              this.switchScreen('completed');
            } else {
              // first time plaid login
              this.manualBankSendForm(false);
            }
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }
  onPlaidExit(event) {
    //console.log(event)
  }
  onPlaidClick(event) {
    console.log(event);
  }
  docView(filename: any) {
    filename = filename.split('/');
    filename = filename[filename.length - 1];
    window.open(
      environment.adminapiurl + 'files/download/' + filename,
      '_blank'
    );
  }
  findViewDoc(name: string) {
    if (this.data.document && this.data.document.length) {
      let filename = '';
      for (let i = 0; i < this.data.document.length; i++) {
        if (name == this.data.document[i].name) {
          filename = this.data.document[i].filepath;
          break;
        }
      }
      if (filename) {
        this.docView(filename);
      } else {
        alert('try to check later.');
      }
    } else {
      alert('try to check later');
    }
  }

  drawStart() {}
  drawComplete() {}
  signAccept() {
    // console.log(this.signaturePad.toDataURL());
    this.signature = this.signaturePad.toDataURL();
    this.contractnoteShow = true;
    // this.contractSignShow = false;
    this.loadDocHtml();
  }
  signClear() {
    this.signature = '';
    this.signaturePad.clear();
    this.loadDocHtml();
  }
  promissoryNoteSendForm() {
    if (this.signature) {
      let d = new Date();
      let reqData = {
        signature: this.signature,
        date: d.toISOString(),
      };
      this.service
        .post(`promissory-note/PromissoryNote/${this.id}`, 'admin', reqData)
        .pipe(first())
        .subscribe(
          (res: any) => {
            if (res.statusCode == 200) {
              this.service.showSuccess('Successfully Saved');
              this.switchScreen('completed');
            } else {
              this.service.showError(res.message);
            }
          },
          (err) => {
            console.log(err.error.message);
          }
        );
    } else {
      this.service.showError('Please sign the document.');
    }
  }
  async getPromissoryNote(id: any) {
    var result = new Promise((resolve, reject) => {
      this.service
        .get('promissory-note/GeneratePromissoryNote/' + id, 'admin')
        .pipe(first())
        .subscribe(
          (res) => {
            if (res['statusCode'] == 200) {
              this.htmlDocStatic = res['data'];
              //console.log(res,"doc");
              this.loadDocHtml();
            } else {
            }
            resolve(res);
          },
          (err) => {
            reject(err);
            //console.log(err);
          }
        );
    });
    return result;
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
    let htc;
    htc = this.htmlDocStatic;
    if (this.signature) {
      htc = htc.replace('{({signature})}', this.signature);
    }
    htc = btoa(htc);
    this.htmlDoc = 'data:text/html;base64,' + htc;
  }
  safeResourceUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  async switchScreen(screen) {
    screen = !screen || screen == 'null' ? 'basic' : screen;
    switch (screen) {
      case 'basic':
        this.basicScreen();
        break;
      case 'loan':
        this.loanScreen();
        break;
      case 'bank':
        this.bankScreen();
        break;
      case 'document':
        this.bankManualScreen();
        break;
      case 'completed':
        break;
      case 'bank reconnect':
        break;
      case 'promissorynote':
        await this.getPromissoryNote(this.id);
        break;
      default:
        break;
    }
    console.log(screen, 'screen');
    this.lastscreen = screen;
  }
}
