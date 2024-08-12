import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss']
})
export class QuestionsComponent implements OnInit {
  list:any = [];
  f1:any = {};
  modalRef: BsModalRef;
  f1index:any;
  message:any = [];
  constructor(private modalService: BsModalService,private service: HttpService) { }

  ngOnInit(): void {
    this.f1.type="Yes_or_no"
    this.f1.condition="="
    this.f1.answer="yes"
    this.getlist()
  }

  getlist(){
    this.service.authget('questions','admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.list = res['question']
      }
    },err=>{
      console.log(err)
    })
  }

  number(data){
    return data.target.value = data.target.value.replace(/[^0-9.]/g,'')
  }
  addSubmit(template: TemplateRef<any>){
    this.modalRef.hide();
    //this.list.push(this.f1)
    this.modalRef.hide();
    this.service.authpost('questions/add','admin',this.f1)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.getlist()
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(template);
      }
    },err=>{
      console.log(err)
    })
  }

  editSubmit(template: TemplateRef<any>){
    this.modalRef.hide();
    this.service.authpost('questions/update','admin',this.f1)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.getlist()
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(template);
      }
    },err=>{
      console.log(err)
    })
    //this.list[this.f1index] = this.f1
  }

  delete(id,template: TemplateRef<any>){
    this.service.authget('questions/delete/'+id,'admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.getlist()
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(template);
      }
    },err=>{
      console.log(err)
    })
  }

  edit(f1,i,template: TemplateRef<any>){
    this.f1 = f1;
    this.f1index = i;
    this.modalRef = this.modalService.show(template);
  }

  add(template: TemplateRef<any>){
    this.f1 = {};
    this.f1.type="Yes_or_no"
    this.f1.condition="="
    this.f1.approvedif="yes"
    this.modalRef = this.modalService.show(template);
  }

  typechange(value){
    
    this.f1.condition="="
    if(value=='Yes_or_no'){
      this.f1.approvedif="yes"
    }else if(value=='Value'){
      this.f1.approvedif="100"
    }else{
      this.f1.approvedif="any"
    }
  }
  close(): void {
    this.modalRef.hide();
  }
}
