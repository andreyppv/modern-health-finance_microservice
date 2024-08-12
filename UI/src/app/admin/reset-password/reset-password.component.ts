import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { ConfirmPasswordValidator } from 'src/app/_service/custom.validator';
import { HttpService } from 'src/app/_service/http.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  id='';

  resetpwForm: FormGroup;
  fSubmitted = false;  

  modalRef: BsModalRef;
  message:any = [];

  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;

  constructor(
    private modalService: BsModalService, 
    public router:Router, 
    private service: HttpService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // console.log(params);
      if(params.token && params.id){  
        this.id=params.id;      
        this.checkToken(params.token, params.id)
      }else{
        this.router.navigate(['admin/404']);
      }      
    })

    this.resetpwForm = this.formBuilder.group({      
      newpw: ['', Validators.required],
      cnewpw: ['', Validators.required]      
    }, {validator: ConfirmPasswordValidator});
  }

  get f(): { [key: string]: AbstractControl } {
    return this.resetpwForm.controls;
  }

  checkToken(token, id){  
    let resetDetails = {}
    resetDetails['token'] = token;
    resetDetails['id'] = id;

    this.service.post('users/checkToken','admin',resetDetails)
    .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){     
          console.log(res);             
        }else{
          this.message = res['message']
          this.modalRef = this.modalService.show(this.messagebox); 
          this.router.navigate(['admin/login']);           
        }        
      },err=>{
        if(err['error']['message'].isArray){
          this.message = err['error']['message']
        }else{
          this.message = [err['error']['message']]
        }
        this.modalRef = this.modalService.show(this.messagebox);
        this.router.navigate(['admin/login']);  
      })
  }

  onSubmit(){
    this.fSubmitted = true;
    if (this.resetpwForm.invalid) {
      return;
    }
    this.resetpwForm.value.id=this.id;    

    this.service.post('users/passwordReset','admin',this.resetpwForm.value)
    .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){     
          console.log(res);     
          this.message = res['message']
          this.modalRef = this.modalService.show(this.messagebox);
          this.fSubmitted = false;
          this.resetpwForm.reset();
          this.router.navigate(['admin/login']);          
        }else{
          this.message = res['message']
          this.modalRef = this.modalService.show(this.messagebox);
          this.router.navigate(['admin/login']);  
        }        
      },err=>{
        if(err['error']['message'].isArray){
          this.message = err['error']['message']
        }else{
          this.message = [err['error']['message']]
        }
        this.modalRef = this.modalService.show(this.messagebox);
        this.router.navigate(['admin/login']);  
      })
  }

  close(): void {
    this.modalRef.hide();
  } 

}
