import { Component, OnInit,TemplateRef, ViewChild } from '@angular/core';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
 
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  data:any=[]
  f1:any={
    role: -1
  }
  roleList:any=[]

  modalRef: BsModalRef;
  message:any = [];
  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;

  constructor(private service: HttpService,private modalService: BsModalService) { }

  ngOnInit(): void {
    this.get()
    this.getAdminPortalRoles()
  }

  namedata(data){
    data.target.value = data.target.value.replace(/[^A-Za-z.]/g, '');
   return data.target.value ? data.target.value.charAt(0).toUpperCase() + data.target.value.substr(1).toLowerCase() : '';
  }

  get(){
    this.service.authget('users/list','admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.data= res['data']
        console.log('////', this.data);
      }
    },err=>{
      console.log(err)
    })
  }
  

  adduser(template: TemplateRef<any>){
    // this.f1 = {}
    // this.f1['role'] = 'admin'
    this.modalRef = this.modalService.show(template);

  }
  submit(template: TemplateRef<any>){
    if(this.f1['role']!=-1){
      this.f1['role'] = Number(this.f1['role'])
      this.service.authpost('users/add','admin',this.f1)
      .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){
          this.modalRef.hide();
          this.message = ["User added successfully"]
          this.modalRef = this.modalService.show(template);
          this.get()
          this.f1={
            role: -1
          }
        }else{
          this.modalRef.hide();
          this.message = res['message']
          this.modalRef = this.modalService.show(template);
        }
      },err=>{
        this.modalRef.hide();
        if(err['error']['message'].isArray){
          this.message = err['error']['message']
        }else{
          this.message = [err['error']['message']]
        }
        this.modalRef = this.modalService.show(template);
      })
    }else{
      this.message = ["Please select the role"]
      this.modalRef = this.modalService.show(template);
    }
    
  }

  close(): void {
    this.modalRef.hide();
  }
  
  getAdminPortalRoles(){
    this.service.authget('roles/getadminportalroles','admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.roleList= res['data']        
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

}
