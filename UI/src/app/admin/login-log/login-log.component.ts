import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { HttpService } from '../../_service/http.service';

@Component({
  selector: 'app-login-log',
  templateUrl: './login-log.component.html',
  styleUrls: ['./login-log.component.scss']
})
export class LoginLogComponent implements OnInit {
  data:any=[]

  modalRef: BsModalRef;
  message:any = [];
  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;

  constructor(private service: HttpService,private modalService: BsModalService,public datePipe: DatePipe) { }

  ngOnInit(): void {
    this.get()
  }

  get(){
    this.service.authget('auditlog/loginLog','admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log(res);

        this.data= res['data']
      }
    },err=>{
      console.log(err)
    })
  }

}
