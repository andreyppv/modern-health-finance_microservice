import { Component, OnInit,TemplateRef,ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { Router } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit {
  id = '';
  modalRef: BsModalRef;
  message:any = [];
  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;
  constructor(private route: ActivatedRoute,private service: HttpService,public router:Router,private modalService: BsModalService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // console.log(params);
      if(params.token && params.id){       
        this.verifyUser(params.id, params.token)
      }else{
        this.router.navigate(['borrower/404']);
      }      
    })
  }

  verifyUser(id,token){
    this.service.authget('users/verify/'+id+'/'+token,'borrower')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){        
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
        this.router.navigate(['borrower']);
      }      
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
      this.router.navigate(['borrower']);
    })
  }

  close(): void {
    this.modalRef.hide();
  }

}
