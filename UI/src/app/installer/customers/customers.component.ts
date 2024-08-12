import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { HttpService } from 'src/app/_service/http.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  installerId = sessionStorage.getItem('InstallerUserId');
  maininstallerid = sessionStorage.getItem('MainInstallerId');

  modalRef: BsModalRef;
  message:any = [];
  data = {    
    applicationsList: []
  }

  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;

  constructor(
    private modalService: BsModalService,
    private service: HttpService,
    public datePipe: DatePipe,
    public router:Router,
  ) { }

  ngOnInit(): void {
    this.getAllApplications();
  }

  go(id){
    this.router.navigate(['installer/main/applicationdetails/'+id]);
  }

  getAllApplications(){
    let inst_id = (this.maininstallerid!='null')?this.maininstallerid:this.installerId;
    this.service.authget('customers/'+inst_id,'installer')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log('res', res['data']);
        this.data = res['data'];               
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
