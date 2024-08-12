import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { HttpService } from 'src/app/_service/http.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  installerId = sessionStorage.getItem('InstallerUserId');
  maininstallerid = sessionStorage.getItem('MainInstallerId');

  usersList:any = []
  userForm:any = {
    role: -1
  }
  roleList:any=[]

  modalRef: BsModalRef;
  message:any = [];

  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;

  constructor(
    public router:Router,
    private service: HttpService,
    private modalService: BsModalService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.getUsers();
    this.getInstallerPortalRoles()
  }

  getUsers(){
    let inst_id = (this.maininstallerid!='null')?this.maininstallerid:this.installerId;
    this.service.authget('user-management/users/'+inst_id,'installer')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.usersList = res['usersList'];

        console.log(this.usersList);

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

  go(){
    this.router.navigate(['installer/profile/view']);
  }

  showAddUserModal(userAddTemp:TemplateRef<any>){
    this.modalRef = this.modalService.show(userAddTemp)
  }

  getInstallerPortalRoles(){
    this.service.authget('roles/getinstallerportalroles','installer')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log(res);

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

  addUser(){
    this.userForm['role'] = Number(this.userForm['role']);
    this.userForm['maininstallerid'] = (this.maininstallerid!='null')?this.maininstallerid:this.installerId;
    this.service.authpost('user-management/addUser', 'installer', this.userForm)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.modalService.hide();
        this.userForm={}
        this.getUsers()
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

  close(){
    this.modalService.hide();
  }

  activateUser(id){
    this.service.authget('users/activate/'+id,'installer')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.getUsers()
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

  deactivateUser(id){
    this.service.authget('users/deactivate/'+id,'installer')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.getUsers()
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

  delete(id){
    this.service.authget('users/delete/'+id,'installer')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        // this.router.navigate(['installer/profile/usermanagement']);
        this.getUsers();
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

}
