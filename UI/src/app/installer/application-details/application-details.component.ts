import { Component, OnInit, TemplateRef, ViewChild,ViewChildren,QueryList,ElementRef } from '@angular/core';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { ActivatedRoute, Router } from "@angular/router";
import { HttpService } from 'src/app/_service/http.service';
import { first } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DatePipe } from '@angular/common';
import { SignatureFieldComponent } from '../../signature-field1/signature-field.component';
import {  CurrencyPipe} from '@angular/common';
import * as $ from 'jquery';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.scss']
})
export class ApplicationDetailsComponent implements OnInit {
  title:any = ""
  modalRef: BsModalRef;
  message:any = [];
  data = {
    applicationDetails: [],
    creditedPaymentDetails: [],
    totalCreditedPayment: 0,
    documentFiles: [],
    files:[]
  }
  applicationStatus: any=null;
  show:any = null;

  public files: NgxFileDropEntry[] = [];
  public listfiles: any = [];
  fileitems:any = [];
  today:any = new Date();
  f1:any ={}
  step:any=1
  agree:any=false;
  maxDate: Date;

  lastdata:any =  {
    "systemInfoVerified": {
      "createdat": ""
    },
    "projectDocuments": []
  }


  @ViewChildren(SignatureFieldComponent) public sigs: QueryList<SignatureFieldComponent>;
  @ViewChildren('sigContainer1') public sigContainer1: QueryList<ElementRef>;

  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;
  index:any = -1
  @ViewChild('filetypetemplate', { read: TemplateRef }) filetypetemplate:TemplateRef<any>;
  constructor(
    public router:Router,
    private service: HttpService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private currencyPipe : CurrencyPipe
    ) { 
      this.title = environment.title}

  ngOnInit(): void {

    var dd = this.today.getDate();

    var mm = this.today.getMonth()+1;
    var yyyy = this.today.getFullYear();
    if(dd<10)
    {
        dd='0'+dd;
    }

    if(mm<10)
    {
        mm='0'+mm;
    }
    this.today = dd+'-'+mm+'-'+yyyy;

    this.getApplicationDetails();
  }

  getApplicationDetails(){
    let id = this.route.snapshot.paramMap.get('id');
    this.service.authget('customers/getapplicationdetails/'+id, 'installer')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200 && res['data'].applicationDetails.length>0){
        this.data = res['data'];
        console.log(this.data);

        this.applicationStatus = this.data.applicationDetails[0].status;
        
        if(this.applicationStatus=='documentsUploaded'){
          this.f1.moduleManufacturer="REC";
          this.f1.inverterManufacturer="Enphase";
          this.f1.batteryManufacturer="No Battery";
        }
        if(this.applicationStatus=='verifiedAndApproved'){
          this.f1.milestone1ReqAmount = this.transformAmount({target:{value:((+this.data.applicationDetails[0].loanamount/100)*20).toFixed(2)}})
        }
        if(this.applicationStatus=='milestone1Completed'){
          if(!this.data.applicationDetails[0].milestone1TransactionId || !this.data.applicationDetails[0].milestone1paidAt){
            this.applicationStatus = 'verifiedAndApproved'
            this.show = "Milestone 1"
          }
          this.f1.milestone2ReqAmount = this.transformAmount({target:{value:((+this.data.applicationDetails[0].loanamount/100)*20).toFixed(2)}})
        }
        if(this.applicationStatus=='milestone2Completed'){
          if(!this.data.applicationDetails[0].milestone2TransactionId || !this.data.applicationDetails[0].milestone2paidAt){
            this.applicationStatus = 'milestone1Completed'
            this.show = "Milestone 2"
          }
          this.f1.milestone3ReqAmount = this.transformAmount({target:{value:(+this.data.applicationDetails[0].loanamount - (+((+this.data.applicationDetails[0].loanamount/100)*20).toFixed(2)*2)).toFixed(2)}})
        }
        if(this.applicationStatus=='milestone1Completed'){
          this.today = new Date()
          var dd = this.today.getDate();

          var mm = this.today.getMonth()+1;
          var yyyy = this.today.getFullYear();

          if(dd<10)
          {
              dd='0'+dd;
          }

          if(mm<10)
          {
              mm='0'+mm;
          }
          this.today = yyyy+'-'+mm+'-'+dd;
        }
        if(this.applicationStatus=='milestone3Completed'){
          if(!this.data.applicationDetails[0].milestone3TransactionId || !this.data.applicationDetails[0].milestone3paidAt){
            this.applicationStatus = 'milestone2Completed'
            this.show = "Milestone 3"
          }
          this.projectdetails()
        }
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
        this.go()
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
      this.go()
    })
  }

  projectdetails(){
    let id = this.route.snapshot.paramMap.get('id');
    this.service.authget('customers/projectdetails/'+id, 'installer')
    .pipe(first())
    .subscribe(res=>{
      this.lastdata = res['data']
      console.log(this.lastdata)
    },err=>{
      console.log(err)
    })
  }
  Verify_files(id,i){
    this.service.authget('customers/files_verify/'+id, 'installer')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.data['files'][i]['verify_flag'] = 'Y'
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
      }
    },err=>{
      console.log(err)
    })
  }

  Nextstep(){
    let loan_id = this.route.snapshot.paramMap.get('id');
    let data = {
      loan_id:loan_id,
      user_id:sessionStorage.getItem('InstallerUserId')
    }
    

    this.service.authpost("customers/nextstep","installer",data)
      .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){
          this.addlogs("Ownership proof files uploaded",loan_id);
          setTimeout(() => {
            location.reload();
          }, 50);
        }
      },err=>{
        console.log(err)
      })
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
    //window.open(this.environment.installerapiurl+"files/download/"+filename, "_blank");
  }

  uploadFiles(){
    const formData = new FormData();
    let loan_id = this.route.snapshot.paramMap.get('id');
    formData.append('loan_id',loan_id);
    formData.append('user_id',sessionStorage.getItem('InstallerUserId'));
    for (var i = 0; i < this.fileitems.length; i++) {
      if(!this.fileitems[i]['documenttype'] || this.fileitems[i]['documenttype']==''){
        this.index = i
          this.fileitems[this.index]['documenttype'] = ""
          this.modalService.show(this.filetypetemplate,{animated: true,
            backdrop: 'static'})
        return false;
      }
      formData.append("documentTypes[]", this.fileitems[i].documenttype);
      formData.append("files[]", this.fileitems[i]);
    }

    this.service.authfiles("customers/fileupload","installer",formData)
      .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){
          this.addlogs("Ownership proof files uploaded",loan_id);
          setTimeout(() => {
            location.reload();
          }, 50);
        }
      },err=>{
        console.log(err)
      })
  }

  isFileAllowed(fileName: string) {
    let isFileAllowed = false;
    const allowedFiles = ['.pdf', '.jpg', '.jpeg', '.png'];
    const regex = /(?:\.([^.]+))?$/;
    const extension = regex.exec(fileName);
    if (undefined !== extension && null !== extension) {
      for (const ext of allowedFiles) {
        if (ext === extension[0]) {
          isFileAllowed = true;
        }
      }
    }
    return isFileAllowed;
  }
  onclose(){
    if(this.fileitems[this.index]['documenttype']!=''){
    this.modalService.hide()
    }
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {

      // Is it a file?
      if (droppedFile.fileEntry.isFile && this.isFileAllowed(droppedFile.fileEntry.name)) {
        this.listfiles.push(this.files)
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file
          console.log(droppedFile.relativePath, file);
          this.fileitems.push(file)
          if(this.applicationStatus==null){
            this.index = this.fileitems.length - 1
            this.fileitems[this.index]['documenttype'] = ""
            this.modalService.show(this.filetypetemplate,{animated: true,
              backdrop: 'static'})
          }
          
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
    console.log(this.listfiles)
  }

  public fileOver(event){
   // console.log(event);
  }

  public fileLeave(event){
   // console.log(event);
  }

  public beResponsive() {
    console.log('Resizing signature pad canvas to suit container size');
    this.size(this.sigContainer1.first, this.sigs.first);
  }

  public size(container: ElementRef, sig: SignatureFieldComponent) {
    sig.signaturePad.set('canvasWidth', container.nativeElement.clientWidth);
    sig.signaturePad.set('canvasHeight', container.nativeElement.clientHeight);
  }

  systemInfo(){
    if(!this.agree){
      this.message = ['Click to confirm']
      this.modalRef = this.modalService.show(this.messagebox);
    }else if(!this.sigs.first.signature){
      this.message = ['Enter Signature']
      this.modalRef = this.modalService.show(this.messagebox);
    }else{
      this.f1.systemSize=Number(this.f1.systemSize)
      this.f1.estAnnualProduction=Number(this.f1.estAnnualProduction)
      let loan_id = this.route.snapshot.paramMap.get('id');
      this.f1.loan_id = loan_id;
      this.f1.user_id = sessionStorage.getItem('InstallerUserId')

      let id = this.service.authpost('customers/systemInfo/', 'installer',this.f1)
        .pipe(first())
        .subscribe(res=>{
          if(res['statusCode']==200){
            this.addlogs("System Info Verified",loan_id);
            setTimeout(() => {
              location.reload();
            }, 50);
          }
      },err=>{
        console.log(err)
      })
    }
  }

  transformAmount(data){
    let v = data.target.value.split('.')
    if(v.length>2){
      return "";
    }
    return this.currencyPipe.transform(data.target.value, '$');
  }

  milestone1Req(){
    if(this.listfiles.length>0){
      if(this.sigs.first.signature){
        const formData = new FormData();
        let loan_id = this.route.snapshot.paramMap.get('id');
        formData.append('loan_id',loan_id);
        formData.append('user_id',sessionStorage.getItem('InstallerUserId'));
        formData.append('signature',this.f1.signature);
        formData.append('milestone1ReqAmount',this.f1.milestone1ReqAmount);
        for (var i = 0; i < this.fileitems.length; i++) {
          formData.append("files[]", this.fileitems[i]);
        }
        this.service.authfiles("customers/milestone1Req","installer",formData)
      .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){
          this.addlogs("Milestone 1 Requested",loan_id);
          setTimeout(() => {
            location.reload();
          }, 50);
        }
      },err=>{
        console.log(err)
      })
      }else{
        this.message = ['Enter Signature']
        this.modalRef = this.modalService.show(this.messagebox);
      }
    }else{
      this.message = ['Upload Documents']
      this.modalRef = this.modalService.show(this.messagebox);
    }


  }

  milestone2Req(){
    if(!this.agree){
      this.message = ['Click to confirm']
      this.modalRef = this.modalService.show(this.messagebox);
    }else if(!this.sigs.first.signature){
      this.message = ['Enter Signature']
      this.modalRef = this.modalService.show(this.messagebox);
    }else{
      if(this.listfiles.length>0){
        const formData = new FormData();
        let loan_id = this.route.snapshot.paramMap.get('id');
        formData.append('loan_id',loan_id);
        formData.append('user_id',sessionStorage.getItem('InstallerUserId'));
        formData.append('signature',this.f1.signature);
        formData.append('milestone2ReqAmount',this.f1.milestone2ReqAmount);
        formData.append('projectCompletedAt',this.today);
        formData.append('verifiedInstAddress',this.agree);
        for (var i = 0; i < this.fileitems.length; i++) {
          formData.append("files[]", this.fileitems[i]);
        }
        this.service.authfiles("customers/milestone2Req","installer",formData)
      .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){
          this.addlogs("Milestone 2 Requested",loan_id);
          setTimeout(() => {
            location.reload();
          }, 50);
        }
      },err=>{
        console.log(err)
      })
      }else{
      this.message = ['Upload Documents']
      this.modalRef = this.modalService.show(this.messagebox);
    }

    }
  }

  milestone3Req(){
    if(this.listfiles.length>0){
      if(this.sigs.first.signature){
        const formData = new FormData();
        let loan_id = this.route.snapshot.paramMap.get('id');
        formData.append('loan_id',loan_id);
        formData.append('user_id',sessionStorage.getItem('InstallerUserId'));
        formData.append('signature',this.f1.signature);
        formData.append('milestone3ReqAmount',this.f1.milestone3ReqAmount);
        for (var i = 0; i < this.fileitems.length; i++) {
          formData.append("files[]", this.fileitems[i]);
        }
        this.service.authfiles("customers/milestone3Req","installer",formData)
      .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){
          this.addlogs("Milestone 3 Requested",loan_id);
          setTimeout(() => {
            location.reload();
          }, 50);
        }
      },err=>{
        console.log(err)
      })
      }else{
        this.message = ['Enter Signature']
        this.modalRef = this.modalService.show(this.messagebox);
      }
    }else{
      this.message = ['Upload Documents']
      this.modalRef = this.modalService.show(this.messagebox);
    }


  }

  number(data){
    return data.target.value = data.target.value.replace(/[^0-9.]/g,'')
  }

  go(){
    this.router.navigate(['installer/main']);
  }

  close(): void {
    this.modalRef.hide();
  }

  download(file){
    console.log(file)
  }

  approveApplication(agree){
    if(agree){
      let loan_id = this.route.snapshot.paramMap.get('id');
      this.service.authput("customers/approveApplication/"+loan_id, "installer", "")
        .pipe(first())
        .subscribe(res=>{
          if(res['statusCode']==200){
            console.log(res);
            this.addlogs("Completed & approved the project",loan_id);
            this.message = ['Approved the application successfully']
            this.modalRef = this.modalService.show(this.messagebox);
            setTimeout(() => {
              this.go()
            }, 50);
          }
        },err=>{
          if(err['error']['message'].isArray){
            this.message = err['error']['message']
          }else{
            this.message = [err['error']['message']]
          }
          this.modalRef = this.modalService.show(this.messagebox);
        })
    }else{
      this.message = ['Please check to confirm System Information is correct']
      this.modalRef = this.modalService.show(this.messagebox);
    }
  }

  deleteFileSelected(file){
    this.fileitems.splice(this.fileitems.findIndex(f=>f.name==file.name), 1);
  }

  addlogs(module,id){
    this.service.addlog(module, id ,'installer').subscribe(res=>{},err=>{})
  }

  selectDocType(i, event){
    if(event.target.value!='Other'){
      $(event.target).next('input').attr('hidden', 'hidden')
      this.fileitems[i]['documenttype']=event.target.value;
    }else{
      this.fileitems[i]['documenttype']='';
      $(event.target).next('input').removeAttr('hidden')
    }
  }

  docTypeComment(i, value){
    this.fileitems[i]['documenttype']=value;
  }

  public clear(sig:SignatureFieldComponent) {
    sig.clear()
  }
  deleteFileSelectedclose(file){
    this.fileitems.splice(this.fileitems.findIndex(f=>f.name==file.name), 1);
    this.modalService.hide()
  }
}

