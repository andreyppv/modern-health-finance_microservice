import { Component, OnInit,TemplateRef } from '@angular/core';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  data:any = []
  f1:any={}
  modalRef: BsModalRef;
  message:any = [];
  constructor(private service: HttpService,private modalService: BsModalService) { }

  ngOnInit(): void {
    this.get()
  }

  namedata(data){
    data.target.value = data.target.value.replace(/[^A-Za-z.]/g, '');
   return data.target.value ? data.target.value.charAt(0).toUpperCase() + data.target.value.substr(1).toLowerCase() : '';
  }

  get(){
    this.service.authget('roles/getroles','admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.data= res['data']
      }
    },err=>{
      console.log(err)
    })
  }

  add(template: TemplateRef<any>){
    this.f1 = {};
    this.modalRef = this.modalService.show(template);
  }

  edit(d,template: TemplateRef<any>){
    this.f1 = {}
    this.f1.id = d.id
    this.f1.name = d.name
    this.modalRef = this.modalService.show(template);
  }

  delete(id,template: TemplateRef<any>){
    this.service.authget('roles/delete/'+id,'admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.message = ["Roles deleted successfully"]
        this.modalRef = this.modalService.show(template);
        this.get()
      }
    },err=>{
      console.log(err)
    })
  }

  submit(template: TemplateRef<any>){
    this.service.authpost('roles/addroles','admin',this.f1)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.modalRef.hide();
        this.message = ["Roles added successfully"]
        this.modalRef = this.modalService.show(template);
        this.get()
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(template);
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(template);
    })
  }


  submit1(template: TemplateRef<any>){
    this.service.authpost('roles/updateroles','admin',this.f1)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.modalRef.hide();
        this.message = ["Roles updated successfully"]
        this.modalRef = this.modalService.show(template);
        this.get()
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(template);
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(template);
    })
  }

  close(): void {
    this.modalRef.hide();
  }

}
