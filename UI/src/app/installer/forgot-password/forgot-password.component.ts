import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { HttpService } from 'src/app/_service/http.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  f1:any = {};

  modalRef: BsModalRef;
  message:any = [];

  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;

  constructor(private modalService: BsModalService, public router:Router, private service: HttpService) { }

  ngOnInit(): void {
  }

  onSubmit(){
    this.service.post('users/forgot-password','installer',this.f1)
    .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){     
          console.log(res);
          this.message = res['message']
          this.modalRef = this.modalService.show(this.messagebox);
          this.router.navigate(['installer/login']);
        }else{
          this.message = res['message']
          this.modalRef = this.modalService.show(this.messagebox); 
          this.router.navigate(['installer/login']);
        }        
      },err=>{
        if(err['error']['message'].isArray){
          this.message = err['error']['message']
        }else{
          this.message = [err['error']['message']]
        }
        this.modalRef = this.modalService.show(this.messagebox);
        this.router.navigate(['installer/login']); 
      })
  }

  close(): void {
    this.modalRef.hide();
  } 

}
