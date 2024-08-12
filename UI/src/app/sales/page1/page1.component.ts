import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from "@angular/router";
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-page1',
  templateUrl: './page1.component.html',
  styleUrls: ['./page1.component.scss']
})
export class Page1Component implements OnInit {

question = []
ans_err:any="";
modalRef: BsModalRef;
message:any = [];


  constructor(private modalService: BsModalService, public router:Router, private service: HttpService) { }

  ngOnInit(): void {
    window.top.postMessage(1,'*');
    this.questions()
  }

  questions(){
    this.service.get("questions","sales")
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        let question = [];
        for (let i = 0; i < res['question'].length; i++) {
          question.push({type:res['question'][i]['type'],question:res['question'][i]['question'],question_id:res['question'][i]['id'],'answer':''});
        }
        this.question=question;
      }
    },err=>{
      console.log(err)
    })
  }

  number(data){
    return data.target.value = data.target.value.replace(/[^0-9.]/g,'')
  }
  
clearerror(){
  this.ans_err=""
}
  submit(template: TemplateRef<any>,message: TemplateRef<any>){
    let err = 0
    for (let i = 0; i < this.question.length; i++) {
      const answer = this.question[i]['answer'].trim();
      if(answer.length==0){
        err = 1
        this.ans_err = this.question[i]['question_id']
        break;
      }
    }
    if(err==0){
      let data = {answers:this.question}
      this.service.post("answers","sales",data)
      .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){
          sessionStorage.setItem('Loan_ID',res['Loan_ID'])
          this.modalRef = this.modalService.show(template);
        }else{
          this.message = res['message']
          this.modalRef = this.modalService.show(message);
        }
      },err=>{
        console.log(err)
      })
    }
  }

  close(): void {
    this.modalRef.hide();
    this.router.navigate(['sales/page2']);
  }

  closemsg(): void {
    this.modalRef.hide();
  }

}
