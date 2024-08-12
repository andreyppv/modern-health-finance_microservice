import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { HttpService } from '../../_service/http.service';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
  installerId = sessionStorage.getItem('InstallerUserId');
  maininstallerid = sessionStorage.getItem('MainInstallerId');
  data:any=[]

  modalRef: BsModalRef;
  message:any = [];
  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;

  constructor(private service: HttpService,private modalService: BsModalService,public datePipe: DatePipe) { }

  ngOnInit(): void {
    console.log(this.maininstallerid)
    if(this.maininstallerid != 'null'){
      console.log(this.maininstallerid)
      this.get(this.maininstallerid)
    }else{
      this.get(this.installerId)
    }
    
  }

  get(id){
    this.service.authget('payment-method/transactionlist/'+id,'installer')
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
