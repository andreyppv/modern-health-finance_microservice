import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { HttpService } from 'src/app/_service/http.service';
import { readyMade } from 'src/environments/environment';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-practice-admin',
  templateUrl: './practice-admin.component.html',
  styleUrls: ['./practice-admin.component.scss'],
})
export class PracticeAdminComponent implements OnInit {
  isListView: Boolean = true;
  data: any = [];
  apForm: FormGroup;
  apibtn: boolean = false;
  dtOptions: any = {};
  practiceList: any = [];
  roleList: any = [
    { id: 'practice admin', displayName: 'Admin' },
    { id: 'PracticeStaff', displayName: 'Staff' },
    { id: 'doctor', displayName: 'Doctor' },
  ];
  constructor(
    private service: HttpService,
    private formBuilder: FormBuilder,
    public router: Router,
    private toastrService: ToastrService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.dtOptions = {
      scrollX: true,
    };

    console.log(this.roleList);
    this.get();
    this.apForm = this.formBuilder.group({
      id: [''],
      practiceName: ['', [Validators.required]],
      email: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.email)],
      ],
      role: ['', [Validators.required]],
      firstname: ['', [Validators.required]],
      lastname: [
        '',
        [Validators.required, Validators.pattern(readyMade.pattern.name)],
      ],
      locationname: ['', [Validators.required]],
      mobileNumber: ['', [Validators.required]],
      status: ['', [Validators.required]],
    });
    this.getPracticeName();
  }
  get apiFormvalidation() {
    return this.apForm.controls;
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
    this.service
      .authget('practice/all-admins', 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          console.log('res', res);
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
  sendForm(): void {
    this.apibtn = true;
    if (!this.apForm.invalid) {
      let data = this.apForm.value,
        sendData;
      console.log('Senddata => ', sendData);
      sendData = {
        practiceid: data.practiceName,
        email: data.email,
        role: data.role,
        firstname: data.firstname,
        lastname: data.lastname,
        location: data.locationname,
        mobile: data.mobileNumber,
        status: data.status,
        id: data.id == null ? '' : data.id,
      };
      console.log('Datas=> ', sendData);
      this.service
        .authpost('practice/create-admin', 'admin', sendData)
        .pipe(first())
        .subscribe(
          (res) => {
            if (res['statusCode'] == 200) {
              this.isListView = !this.isListView;
              this.service.showSuccess('Successfully Saved');
              this.get();
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
  editPracticeData(data: any) {
    // if (id) {
    //   this.service
    //     .authget(`practice/${id}`, 'admin')
    //     .pipe(first())
    //     .subscribe(
    //       (res) => {
    //         if (res['statusCode'] == 200) {
    //           this.isListView = !this.isListView;
    //           let resPonseData = res['practice'];
    //           console.log('getdatabyid', res);
    //           // this.preFileitems = resPonseData.files[0];
    //           // this.preFileitemsTwo = resPonseData.files[1];
    //           //console.log('/////',resPonseData)
    //           //console.log('*****',this.preFileitemsTwo.originalname)
    //           if (resPonseData && Object.keys(resPonseData).length > 0) {
    //             // this.mainColor = resPonseData.practiceMainColor;
    //             // this.secondaryColor = resPonseData.pacticeSecondaryColor;
    //             // this.apForm.patchValue({ contactName: resPonseData.contactName, email: resPonseData.email, practiceName: resPonseData.practiceName, practiceUrl: resPonseData.practiceUrl, practiceHomeUrl: resPonseData.practiceHomeUrl, locationName: resPonseData.locationName, streetaddress: resPonseData.streetaddress, city: resPonseData.city, stateCode: resPonseData.stateCode, zipcode: resPonseData.zipcode, mobileNumber: resPonseData.phoneNumber, mainColor: resPonseData.practiceMainColor, secondaryColor: resPonseData.pacticeSecondaryColor });
    //             // this.isListView = !this.isListView;
    //             // this.update_id=resPonseData.id
    //           }
    //         } else {
    //           this.service.showError('Invaild page');
    //           // this.apForm.reset();
    //         }
    //       },
    //       (err) => {
    //         this.service.showError('Invaild page');
    //       }
    //     );
    // }
    console.log(data);
    this.isListView = !this.isListView;
    this.apForm.patchValue(data);
    var rs = this.practiceList.filter(
      (x) => x.practicename == data.practicename
    );
    this.apForm.get('practiceName').setValue(rs[0].id);
    this.apForm.get('mobileNumber').setValue(data.mobile);
  }
}
