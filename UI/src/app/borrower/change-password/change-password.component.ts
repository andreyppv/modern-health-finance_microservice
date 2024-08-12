import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { ConfirmPasswordValidator } from 'src/app/_service/custom.validator';
import { HttpService } from 'src/app/_service/http.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  login_user_id = sessionStorage.getItem('UserId');
  loanid = sessionStorage.getItem('LoanId');
  changepwForm: FormGroup;
  fSubmitted = false;

  modalRef: BsModalRef;
  message:any = [];

  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;

  constructor(
    private service: HttpService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.changepwForm = this.formBuilder.group({
      currentpw: ['', Validators.required],
      newpw: ['', Validators.required],
      cnewpw: ['', Validators.required]      
    }, {validator: ConfirmPasswordValidator});
  }
  get f(): { [key: string]: AbstractControl } {
    return this.changepwForm.controls;
  }

  changePassword(){   
    this.fSubmitted = true;
    if (this.changepwForm.invalid) {
      return;
    }

    this.service.authput('users/changepassword/'+this.login_user_id, 'borrower', this.changepwForm.value)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log(res);
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
        this.fSubmitted = false;
        this.changepwForm.reset();
        this.addlogs('Customer changed the password', this.loanid)
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
    })
  }

  close(): void {
    this.modalRef.hide();
  }  

  addlogs(module,id){
    this.service.addlog(module,id,'borrower').subscribe(res=>{},err=>{})
  }
}
