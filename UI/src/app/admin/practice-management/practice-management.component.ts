import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { CommonDataInatance } from 'src/app/_service/comman.service';
import { HttpService } from 'src/app/_service/http.service';
import { readyMade } from 'src/environments/environment';
import {
  NgxFileDropEntry,
  FileSystemFileEntry,
  FileSystemDirectoryEntry,
} from 'ngx-file-drop';
import { ToastrService } from 'ngx-toastr';
import { toBase64String } from '@angular/compiler/src/output/source_map';

@Component({
  selector: 'app-practice-management',
  templateUrl: './practice-management.component.html',
  styleUrls: ['./practice-management.component.scss'],
})
export class PracticeManagementComponent implements OnInit {
  data: any = [];
  dataSettings: any = [];
  isListView: boolean = true;
  apForm: FormGroup;
  apibtn: boolean = false;
  stateList: any = [];
  message: any = [];
  modalRef: BsModalRef;
  mainColor: string;
  secondaryColor: string;
  logo1: any;
  logo2: any;
  // public files: NgxFileDropEntry[] = [];
  files = [];
  public listfiles: any = [];
  fileNames: any = [];
  createId: any;
  fileitems: any = [];
  fileitemsTwo: any = [];
  preFileitems: any = [];
  preFileitemsTwo: any = [];
  isShowbtn: boolean = false;
  updateId: any;

  @ViewChild('messagebox', { read: TemplateRef }) messagebox: TemplateRef<any>;
  @ViewChild('takeInput', { static: false })
  update_id: any;
  constructor(
    private service: HttpService,
    private formBuilder: FormBuilder,
    public router: Router,
    private toastrService: ToastrService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.mainColor = '#539641';
    this.secondaryColor = '#F1B649';

    this.stateList = CommonDataInatance.stateList();
    this.get();
    //this.getSettingsRules()
    this.apForm = this.formBuilder.group({
      contactName: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.name)],
      ],
      email: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.email)],
      ],
      practiceName: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.name)],
      ],
      practiceUrl: ['', [Validators.required]],
      practiceHomeUrl: [''],
      locationName: ['', [Validators.required]],
      streetaddress: ['', [Validators.required]],
      city: ['', [Validators.required]],
      stateCode: [null, [Validators.required]],
      zipcode: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.pattern(readyMade.pattern.number),
        ],
      ],
      mobileNumber: ['', [Validators.required]],
      practiceSettings: ['', [Validators.required]],
      mainColor: ['#539641'],
      secondaryColor: ['#F1B649'],
      practicelogo: [],
      practicepoweredbylogo: [],
    });
  }
  get apiFormvalidation() {
    return this.apForm.controls;
  }
  getSettingsRules() {
    this.service
      .authget('practicerules/getAllPracticeRules', 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['statusCode'] == 200) {
            this.dataSettings = res['data'];
          } else {
            // this.service.showError("Invaild page");
          }
        },
        (err) => {
          console.log(err);
          //this.service.showError("Invaild page");
        }
      );
  }
  handleUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // console.log(reader.result);
      this.logo1 = reader.result;
      // console.log(this.logo1);
    };
  }

  handleUpload2(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // console.log(reader.result);
      this.logo2 = reader.result;
      // console.log(this.logo2);
    };
  }
  get() {
    setTimeout(() => {
      this.service
        .authget('practice', 'admin')
        .pipe(first())
        .subscribe(
          (res) => {
            if (res['statusCode'] == 200) {
              this.data = res['allPractice'];
              this.getSettingsRules();
            } else {
              this.service.showError('Invaild page');
            }
          },
          (err) => {
            console.log(err);
            this.service.showError('Invaild page');
          }
        );
    }, 1000);
  }
  backbtn() {
    this.apForm.controls.contactName.clearValidators();
    this.apForm.controls.email.clearValidators();
    this.apForm.controls.practiceName.clearValidators();
    this.apForm.controls.practiceUrl.clearValidators();
    this.apForm.controls.locationName.clearValidators();
    this.apForm.controls.streetaddress.clearValidators();
    this.apForm.controls.city.clearValidators();
    this.apForm.controls.stateCode.clearValidators();
    this.apForm.controls.zipcode.clearValidators();
    this.apForm.controls.mobileNumber.clearValidators();
    this.apForm.controls.practiceSettings.clearValidators();
    this.fileitems = [];
    this.fileitemsTwo = [];
  }
  sendForm(): void {
    this.apForm.controls.contactName.setValidators([
      Validators.required,
      Validators.pattern(readyMade.pattern.name),
    ]);
    this.apForm.controls.contactName.updateValueAndValidity();
    this.apForm.controls.email.setValidators([
      Validators.required,
      Validators.pattern(readyMade.pattern.email),
    ]);
    this.apForm.controls.email.updateValueAndValidity();
    this.apForm.controls.practiceName.setValidators([
      Validators.required,
      Validators.pattern(readyMade.pattern.name),
    ]);
    this.apForm.controls.practiceName.updateValueAndValidity();
    this.apForm.controls.practiceUrl.setValidators([Validators.required]);
    this.apForm.controls.practiceUrl.updateValueAndValidity();
    this.apForm.controls.locationName.setValidators([Validators.required]);
    this.apForm.controls.locationName.updateValueAndValidity();
    this.apForm.controls.streetaddress.setValidators([Validators.required]);
    this.apForm.controls.streetaddress.updateValueAndValidity();
    this.apForm.controls.city.setValidators([Validators.required]);
    this.apForm.controls.city.updateValueAndValidity();
    this.apForm.controls.stateCode.setValidators([Validators.required]);
    this.apForm.controls.stateCode.updateValueAndValidity();
    this.apForm.controls.zipcode.setValidators([
      Validators.required,
      Validators.minLength(5),
      Validators.pattern(readyMade.pattern.number),
    ]);
    this.apForm.controls.zipcode.updateValueAndValidity();
    this.apForm.controls.mobileNumber.setValidators([Validators.required]);
    this.apForm.controls.mobileNumber.updateValueAndValidity();
    this.apForm.controls.practiceSettings.setValidators([Validators.required]);
    this.apForm.controls.practiceSettings.updateValueAndValidity();
    this.apibtn = true;
    if (!this.apForm.invalid) {
      let data = this.apForm.value;
      let sendData = {
        contactName: data.contactName,
        email: data.email,
        practiceName: data.practiceName,
        practiceUrl: data.practiceUrl,
        practiceHomeUrl: data.practiceHomeUrl,
        practiceLinkToForm: 'linktoForm',
        locationName: data.locationName,
        streetaddress: data.streetaddress,
        city: data.city,
        stateCode: data.stateCode,
        zipcode: data.zipcode,
        phoneNumber: data.mobileNumber,
        practiceSettings: data.practiceSettings,
        practiceMainColor: data.mainColor,
        pacticeSecondaryColor: data.secondaryColor,
        practicelogo: this.logo1,
        practicepoweredbylogo: this.logo2,
      };
      if (this.updateId != null) {
        //If data length > 0 Update Api Call
        this.service
          .authput(`practice/edit/${this.updateId}`, 'admin', sendData)
          .pipe(first())
          .subscribe(
            (res) => {
              this.apibtn = false;
              if (res['statusCode'] == 200) {
                this.isListView = !this.isListView;
                this.upload(this.updateId);
                this.service.showSuccess('Successfully Updated');
                this.get();
              } else {
                this.message = [res['message']];
                this.modalRef = this.modalService.show(this.messagebox);
              }
            },
            (err) => {
              console.log(err);
            }
          );
      } else {
        /// IF data null or empty Add API Call
        this.service
          .post('practice/create', 'admin', sendData)
          .pipe(first())
          .subscribe(
            (res) => {
              if (res['statusCode'] == 200) {
                this.createId = res['practiceDetails']['id'];
                this.isListView = !this.isListView;
                this.upload(this.createId);
                this.service.showSuccess('Successfully Saved');
                //this.get();
                this.ngOnInit();
              } else {
                this.message = [res['message']];
                this.modalRef = this.modalService.show(this.messagebox);
              }
            },
            (err) => {
              console.log(err);
            }
          );
      }
    } else {
      console.log('Form Valid!');
    }
  }

  close(): void {
    this.modalRef.hide();
  }
  
  upload(id) {
    const formData = new FormData();
    for (var i = 0; i < this.fileitems.length; i++) {
      formData.append('documentTypes[]', this.fileitems[i].type);
      formData.append('files[]', this.fileitems[i]);
      if (this.fileitems[i].services != undefined)
        formData.append('services[]', this.fileitems[i].services);
    }
    for (var i = 0; i < this.fileitemsTwo.length; i++) {
      formData.append('documentTypes[]', this.fileitemsTwo[i].type);
      formData.append('files[]', this.fileitemsTwo[i]);
      if (this.fileitemsTwo[i].services != undefined)
        formData.append('services[]', this.fileitemsTwo[i].services);
    }
    formData.append('link_id', id);
    this.service
      .files('files', 'admin', formData)
      .pipe(first())
      .subscribe(
        (res) => {
          // console.log('res', res)
          if (res['statusCode'] == 200) {
            console.log('upload success', res);
          } else {
            console.log('upload failed');
          }
        },
        (err) => {
          console.log('ferr', err);
        }
      );
  }

  editPracticeData(id: any) {
    this.apibtn = false;
    if (id) {
      this.getFileDetails(id);
      this.service
        .authget(`practice/${id}`, 'admin')
        .pipe(first())
        .subscribe(
          (res) => {
            if (res['statusCode'] == 200) {
              this.isShowbtn = true;
              let resPonseData = res['practice'];
              if (Object.keys(resPonseData).length > 0) {
                this.mainColor = resPonseData.practicemaincolor;
                this.secondaryColor = resPonseData.practicesecondarycolor;
                this.apForm.patchValue({
                  contactName: resPonseData.contactname,
                  email: resPonseData.email,
                  practiceName: resPonseData.practicename,
                  practiceUrl: resPonseData.practiceurl,
                  practiceHomeUrl: resPonseData.practicehomeurl,
                  locationName: resPonseData.locationname,
                  streetaddress: resPonseData.streetaddress,
                  city: resPonseData.city,
                  stateCode: resPonseData.statecode,
                  zipcode: resPonseData.zipcode,
                  mobileNumber: resPonseData.phonenumber,
                  practiceSettings: resPonseData.practicesettings,
                  mainColor: resPonseData.practicemaincolor,
                  secondaryColor: resPonseData.practicesecondarycolor,
                });
                console.log('==============>', resPonseData);
                console.log('==============>', this.apForm.value);

                this.isListView = !this.isListView;
                this.updateId = resPonseData.id;
                this.update_id = resPonseData.id;
              }
            } else {
              this.service.showError('Invaild page');
              this.apForm.reset();
            }
          },
          (err) => {
            this.service.showError('Invaild page');
          }
        );
    }
  }

  getFileDetails(id) {
    this.service
      .get('files/practicelogo/' + id, 'admin')
      .pipe(first())
      .subscribe((res: any) => {
        if (res.statusCode == 200) {
          this.fileitems = res.data;
          this.preFileitems = res.data;
        }
      });
    this.service
      .get('files/practicepowerlogo/' + id, 'admin')
      .pipe(first())
      .subscribe((res: any) => {
        if (res.statusCode == 200) {
          this.fileitemsTwo = res.data;
          this.preFileitemsTwo = res.data;
        }
      });
    // setTimeout(() => {
    //   console.log("get", this.preFileitems, "data", this.preFileitemsTwo)
    // }, 3000);
  }

  colorChange(t, type) {
    ///console.log(t.target.value)
    if (type == 'main') {
      this.mainColor = t.target.value;
    } else {
      this.secondaryColor = t.target.value;
    }
  }

  setDefault(v) {
    if (v == 'main') {
      this.mainColor = '#539641';
    } else {
      this.secondaryColor = '#F1B649';
    }
  }

  isFileAllowed(fileName: string) {
    let isFileAllowed = false;
    const allowedFiles = ['.jpg', '.jpeg', '.png', '.PNG', '.JPEG', '.JPG'];
    const regex = /(?:\.([^.]+))?$/;
    const extension = regex.exec(fileName);
    if (undefined !== extension && null !== extension) {
      for (const ext of allowedFiles) {
        if (ext === extension[0]) {
          isFileAllowed = true;
        }
      }
    }
    return isFileAllowed;
  }

  public dropped(files) {
    this.files = files;
    // console.log(this.files, "ff1", files);
    for (const droppedFile of files) {
      // console.log("drop1", droppedFile.name)
      let validFile = this.isFileAllowed(droppedFile.name);
      // console.log("vld1", validFile)
      if (validFile == true) {
        droppedFile['services'] = 'practiceMangement/practiceLogo';
        this.fileitems.push(droppedFile);
        this.handleUpload(event);
      } else {
        // console.log("ele1", this.files)
        if (!validFile) {
          this.myInputVariable.nativeElement.value = '';
          this.toastrService.error(
            'File format not supported! Please drop .jpg, .jpeg, .png, .docx files'
          );
        }
      }
    }
  }

  public droppedlogo(files) {
    this.files = files;
    // console.log(this.files, "ff1", files);
    for (const droppedFile of files) {
      // console.log("drop1", droppedFile.name)
      let validFile = this.isFileAllowed(droppedFile.name);
      // console.log("vld1", validFile)
      if (validFile == true) {
        droppedFile['services'] = 'practiceMangement/practicePoweredByLogo';
        this.fileitemsTwo.push(droppedFile);
        this.handleUpload2(event);
      } else {
        // console.log("ele1", this.files)
        if (!validFile) {
          this.myInputVariable1.nativeElement.value = '';
          this.toastrService.error(
            'File format not supported! Please drop .jpg, .jpeg, .png, .docx files'
          );
        }
      }
    }
  }

  public dropped2(files) {
    this.files = files;

    // console.log(this.files, "ff2", files);
    for (const droppedFile of files) {
      // console.log("drop2", droppedFile.name)
      let validFile = this.isFileAllowed(droppedFile.name);
      // console.log("vld2", validFile)
      if (validFile == true) {
        droppedFile['services'] = 'practiceMangement/practicePoweredByLogo';
        this.listfiles.push(this.files);
        this.fileitemsTwo.push(droppedFile);
      } else {
        // console.log("ele2", this.files)
        if (!validFile) {
          this.toastrService.error(
            'File format not supported! Please drop .jpg, .jpeg, .png, .docx files'
          );
        }
      }
    }
  }
  @ViewChild('myInput')
  myInputVariable: ElementRef;
  deleteFileSelected(file) {
    this.myInputVariable.nativeElement.value = '';
    this.fileitems.splice(
      this.fileitems.findIndex((f) => f.name == file.name),
      1
    );
    this.fileitems = [];
  }
  @ViewChild('myInput1')
  myInputVariable1: ElementRef;

  deleteCoFileSelected(file) {
    this.myInputVariable1.nativeElement.value = '';
    this.fileitemsTwo.splice(
      this.fileitemsTwo.findIndex((f) => f.name == file.name),
      1
    );
  }

  deletePreFileSelected(file) {
    let charr = file.filename.split('/');
    this.preFileitems.splice(this.preFileitems.indexOf(file), 1);
    this.service
      .post('files/' + charr[charr.length - 1], 'admin', file)
      .pipe(first())
      .subscribe((res: any) => {
        if (res.statusCode == 200) {
          this.apForm.controls.practicepoweredbylogo.setValue('');
          this.apForm.controls.practicepoweredbylogo.reset();

          return;
        }
      });
  }

  deletePreFileSelectedCo(file) {
    // console.log("filed2",file)
    let charr = file.filename.split('/');
    this.preFileitemsTwo.splice(this.preFileitemsTwo.indexOf(file), 1);
    this.service
      .post('files/' + charr[charr.length - 1], 'admin', file)
      .pipe(first())
      .subscribe((res: any) => {
        if (res.statusCode == 200) {
          return;
        }
      });
  }
}
