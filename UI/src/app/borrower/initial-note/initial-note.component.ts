import { Component, ElementRef, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SignatureFieldComponent } from 'src/app/signature-field2/signature-field.component';
import { Router } from "@angular/router";
import { ActivatedRoute } from '@angular/router';





import { HttpService } from 'src/app/_service/http.service';
import { first } from 'rxjs/operators';


@Component({
  selector: 'app-initial-note',
  templateUrl: './initial-note.component.html',
  styleUrls: ['./initial-note.component.scss']
})
export class InitialNoteComponent implements OnInit {
  modalRef: BsModalRef;
  @ViewChildren(SignatureFieldComponent) public sigs: QueryList<SignatureFieldComponent>;
  @ViewChildren('sigContainer1') public sigContainer1: QueryList<ElementRef>;
  signature:any="";
  public form: FormGroup;
  date:any = "";
  @ViewChild('pdfTable') pdfTable: ElementRef;
  message:any = [];
  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;
  public secondSig: SignatureFieldComponent;

  constructor(private route: ActivatedRoute,
    public router:Router,
    private service: HttpService,
    private fb: FormBuilder,private modalService: BsModalService
  ) { }
data:any = []

  ngOnInit(): void {
    var date = new Date();
    this.date = ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear();
    this.get(this.route.snapshot.paramMap.get('id'))
  }


  get(id){
    this.service.get('initial-note/'+id,'borrower')
    .pipe(first())
    .subscribe(res=>{
   console.log(res)
      if(res['statusCode']==200){
        var d = new Date(res['data'][0]['createdat'])
        let data = {
          name : res['data'][0]['firstname']+" "+res['data'][0]['lastname'],
          ref_no : "LON_"+res['data'][0]['ref_no'],
          date:((d.getMonth() > 8) ? (d.getMonth() + 1) : ('0' + (d.getMonth() + 1))) + '/' + ((d.getDate() > 9) ? d.getDate() : ('0' + d.getDate())) + '/' + d.getFullYear(),
          addr1:res['data'][0]['unit']+", "+res['data'][0]['streetaddress'],
          addr2:res['data'][0]['city']+", "+res['data'][0]['state']+", "+res['data'][0]['zipcode']
        }
        this.data.push(data)
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
        this.router.navigate(['borrower']);
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
      this.router.navigate(['borrower']);
    })
    //this.router.navigate(['borrower']);
  }
  

  

  

  public beResponsive(container: ElementRef, sig: SignatureFieldComponent) {
    sig.signaturePad.set('canvasWidth', container.nativeElement.clientWidth);
    sig.signaturePad.set('canvasHeight', container.nativeElement.clientHeight);

  }

  public clear(sig:SignatureFieldComponent) {
    sig.clear()
  }

  onSubmit(template: TemplateRef<any>) {
    this.form = this.fb.group({
      signatureField1: ['', Validators.required]
    });
    this.modalRef = this.modalService.show(template);
  }
  close(): void {
    this.modalRef.hide();
  }

  public onSubmit1() {
    this.signature = this.form.value['signatureField1'];
    this.modalRef.hide();
  }

  downloadAsPDF(){
if(this.signature.length>0){


    // const pdfTable = this.pdfTable.nativeElement;

    // var html = htmlToPdfmake(pdfTable.innerHTML);

    // const documentDefinition = { content: html };
    // pdfMake.createPdf(documentDefinition).download(); 

    // let data:any = {}
    // data.documentDefinition = documentDefinition
    let data = {
      loan_id:this.route.snapshot.paramMap.get('id'),
      signature:this.signature,
      date:this.date
    }
     this.service.post('initial-note/save', 'borrower', data)
     .pipe(first())
     .subscribe(res=>{
       if(res['statusCode']==200){
        this.message = ["Successfully saved"]
        this.modalRef = this.modalService.show(this.messagebox);
        this.router.navigate(['borrower']);
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
    this.message = ["Enter Your Signature"]
    this.modalRef = this.modalService.show(this.messagebox);
   }
  }
}
