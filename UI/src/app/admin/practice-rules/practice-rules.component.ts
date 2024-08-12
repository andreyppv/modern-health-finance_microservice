import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { CommonDataInatance } from 'src/app/_service/comman.service';
import { HttpService } from 'src/app/_service/http.service';
import { readyMade } from 'src/environments/environment';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer } from '@angular/platform-browser';
import {environment} from '../../../environments/environment'

@Component({
  selector: 'app-practice-rules',
  templateUrl: './practice-rules.component.html',
  styleUrls: ['./practice-rules.component.scss']
})
export class PracticeRulesComponent implements OnInit {

  data: any = [];
  isListView: boolean = true;
  isShowbtn:boolean =false;
  apForm: FormGroup;
  apibtn: boolean = false;
  message: any = [];
  update_id: any;
  modalRef: BsModalRef;
  createId: any;
  DERulesSrc:any = ""
  @ViewChild('messagebox', { read: TemplateRef }) messagebox: TemplateRef<any>;
  constructor(private service: HttpService,
  private formBuilder: FormBuilder,
  private sanitizer: DomSanitizer,
  public router: Router, private toastrService: ToastrService,
  private modalService: BsModalService) { }

  ngOnInit(): void {
    this.get();
    this.apForm = this.formBuilder.group({
      settingsName: [
        '',
        [Validators.required]
      ],
      isDefault: [
        false,
      ],
      denyspecifictier: [
        false,
      ],
      transunion: [
        false,
      ],
      plaid: [
        false,
      ],
    });

   

  }

  get apiFormvalidation() {
    return this.apForm.controls;
  }

  get() {
    this.service.authget('practicerules/getAllPracticeRules', 'admin')
      .pipe(first())
      .subscribe(res => {
        if (res['statusCode'] == 200) {
          this.data = res['data']
        } else {
          this.service.showError("Invaild page");
        }
      }, err => {
        console.log(err);
        this.service.showError("Invaild page");
      });
  }
  sendForm(): void {

    this.apibtn = true;
    if (!this.apForm.invalid) {
      //console.log(this.apForm.value);
      //data
      let data = this.apForm.value;
      let sendData = { 
        setting_name: data.settingsName, 
        isDefault: (data.isDefault==null)? false:data.isDefault, 
        deny_tiers:(data.denyspecifictier==null)? false:data.denyspecifictier, 
        enable_transunion: (data.transunion==null)? false:data.transunion, 
        enable_plaid: (data.plaid==null)? false:data.plaid
      };
     
      if(this.update_id!=null){

        this.service
        .patch(`practicerules/updatePracticeRules/${this.update_id}`, 'admin', sendData)
        .pipe(first())
        .subscribe(
          res => {
            if (res['statusCode'] == 200) {
              this.isListView = !this.isListView;
              this.service.showSuccess("Successfully Updated");
              this.ngOnInit();
            } else {
              console.log(res['statusCode'], res);
              this.message = [res['message']];
              this.modalRef = this.modalService.show(this.messagebox);
            }
          },
          err => {
            console.log(err);
          }
        );


      }else{

        this.service
            .post('practicerules/addSetting', 'admin', sendData)
            .pipe(first())
            .subscribe(
              res => {
                if (res['statusCode'] == 200) {
                  this.editPracticeRulesData(res['data'].ref_no);
                } else {
                  console.log(res['statusCode'], res);
                  this.message = [res['message']];
                  this.modalRef = this.modalService.show(this.messagebox);
                }
              },
              err => {
                console.log(err);
              }
            );

      }
    }else{
      console.log('Form Valid!')
    }

  }

  editPracticeRulesData(id: any) {
    if (id) {
      this.service.authget(`practicerules/getPracticeRules/${id}`, 'admin')
        .pipe(first())
        .subscribe(res => {
          if (res['statusCode'] == 200) {
            this.isShowbtn=true;
            let resPonseData = res['data'];
            if (Object.keys(resPonseData).length > 0) {
              this.getDERuleSetIframe(id);
              this.apForm.patchValue({ 
                settingsName: resPonseData[0].setting_name, 
                isDefault: resPonseData[0].isDefault, 
                denyspecifictier: resPonseData[0].deny_tiers, 
                transunion: resPonseData[0].enable_transunion, 
                plaid: resPonseData[0].enable_plaid
              });
              this.isListView = false;
              this.update_id=resPonseData[0].ref_no
            }
          } else {
            this.service.showError("Invaild page");
            // this.apForm.reset();
          }
        }, err => {
          this.service.showError("Invaild page");
        });
    }else{
      this.service.showError("Invaild page");
    }
  }
  deletePracticeRulesData(id:any){
    if(id){
      this.service
        .put(`practicerules/deletePracticeRules/${id}`, 'admin',this.data)
        .pipe(first())
        .subscribe(res => {
          if (res['statusCode'] == 200) {
                this.service.showSuccess("Successfully Deleted Rules!");
                //this.get();
                this.ngOnInit();
          }else{
            this.service.showError("Error Delete");
          }
        }, err => {
          this.service.showError("Invaild page");
        });
    }
  }
  getDERuleSetIframe(id){
    this.DERulesSrc = this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.creditscore}/${id}`)
  }
  resetVal(){
    this.isListView = !this.isListView;
    this.ngOnInit();
  }
}
