import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { HttpService } from 'src/app/_service/http.service';
import { environment } from '../../../environments/environment';
import { FormBuilder, NgForm } from '@angular/forms';

@Component({
  selector: 'app-install-info',
  templateUrl: './install-info.component.html',
  styleUrls: ['./install-info.component.scss']
})
export class InstallInfoComponent implements OnInit {

  loanid = this.route.snapshot.paramMap.get('id');
  data:any={
    customerDetails:null,
    ownershipFiles: [],
    systemInfo: null,
    installingInfo: null,
    milestone1ReqFiles: [],
    milestone2ReqFiles: [],
    milestone3ReqFiles: [],
    Milestone1Comments: [],
    Milestone2Comments: [],
    Milestone3Comments: [],
    Milestone1Transactions: [],
    Milestone2Transactions: [],
    Milestone3Transactions: [],
    approvedAt:null
  }

  commentsForm = {}
  milestone1Comment = ''
  milestone2Comment = ''
  milestone3Comment = ''

  modalRef: BsModalRef;
  message:any = [];
  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;

  constructor(
    public datePipe: DatePipe,
    private route: ActivatedRoute,
    private service: HttpService,
    public router:Router,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.get()
  }

  get(){
    this.service.authget('customers/install-info/'+this.loanid,'installer')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        console.log(res);

        this.data= res['data']

      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
        // this.router.navigate(['admin/funded-contracts']);
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
      // this.router.navigate(['admin/funded-contracts']);
    })
  }

  addComment(commentType, myForm: NgForm){
    if(commentType=='Milestone1CommentByInstaller'){
      this.commentsForm['comments'] = this.milestone1Comment
    }else if(commentType=='Milestone2CommentByInstaller'){
      this.commentsForm['comments'] = this.milestone2Comment
    }else if(commentType=='Milestone3CommentByInstaller'){
      this.commentsForm['comments'] = this.milestone3Comment
    }

    this.commentsForm['commentType'] = commentType
    this.commentsForm['loan_id'] = this.loanid
    this.commentsForm['user_id'] = sessionStorage.getItem('InstallerUserId')

    this.service.authpost('customers/addComment','installer',this.commentsForm)
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        myForm.resetForm();
        this.commentsForm = {}
        this.milestone1Comment = ''
        this.milestone2Comment = ''
        this.milestone3Comment = ''
        this.addlogs("Add Some comments",this.commentsForm['loan_id'])
        this.get()
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
  addlogs(module,id){
    this.service.addlog(module,id,'installer').subscribe(res=>{},err=>{})
  }
  view(filename:any){
    filename = filename.split('/')
    filename = filename[filename.length-1]
    this.service
      .download("files/download/"+filename,'installer')
      .subscribe(blob => {
        const a = document.createElement('a')
        const objectUrl = URL.createObjectURL(blob)
        a.href = objectUrl
        a.download = filename;
        a.click();
        URL.revokeObjectURL(objectUrl);
      })
    //window.open(this.configService.config.installerapiurl+"files/download/"+filename, "_blank");
  }

}
