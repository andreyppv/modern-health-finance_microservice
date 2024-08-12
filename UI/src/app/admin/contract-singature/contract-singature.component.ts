import {
  Component,
  OnInit,
  EventEmitter,
  ElementRef,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Router, Params } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from 'src/app/_service/http.service';
import { first } from 'rxjs/operators';
import { SignaturePad } from 'angular2-signaturepad';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-contract-singature',
  templateUrl: './contract-singature.component.html',
  styleUrls: ['./contract-singature.component.scss'],
})
export class ContractSingatureComponent implements OnInit {
  signature: string = '';
  multipleSignature = [];
  isShowComponent: string;
  contractSignShow: boolean = false;
  contractnoteShow: boolean = false;
  loanid: any;

  private signaturePadOptions: Object = {
    // passed through to szimek/signature_pad constructor
    minWidth: 0,
    canvasWidth: 780,
    canvasHeight: 100,
    penColor: 'rgb(63, 133, 202)',
    backgroundColor: 'rgb(255, 255, 255)',
  };
  @ViewChildren(SignaturePad) signaturePad: QueryList<SignaturePad>;
  emitter: EventEmitter<string> = new EventEmitter();
  htmlDocStatic: string;
  htmlDoc: any;
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private service: HttpService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    public sanitizer: DomSanitizer
  ) {}
  async ngOnInit() {
    this.loanid =
      window.location.href.split('/')[
        window.location.href.split('/').length - 1
      ];

    if (this.isShowComponent == 'contractSign') {
      this.addQueryParm();
    }
    await this.get(this.loanid);
  }
  addQueryParm() {
    const queryParams: Params = { stage: 'signing' };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
    });
  }
  drawStart() {}
  drawComplete() {}
  signAccept(index) {
    //console.log(this.signaturePad.get(index));
    let signaturePad = this.signaturePad.get(index);
    this.multipleSignature[index].signature = signaturePad.toDataURL();
    this.multipleSignature[index].signCameFromUI = true;
    this.contractnoteShow = true;
    this.multipleSignature[index].id = this.loanid;
    window.scrollTo(1500, 1500);
    this.loadDocHtml();
  }
  signClear(index) {
    this.multipleSignature[index].signature = '';
    let signaturePad = this.signaturePad.get(index);
    signaturePad.clear();
    this.loadDocHtml();
  }
  sendForm() {
    let reqData = { signatures: [] },
      formVaild = false;
    for (let i = 0; i < this.multipleSignature.length; i++) {
      if (this.multipleSignature[i].signCameFromUI) {
        formVaild = true;
        reqData.signatures.push({
          ownerID: this.multipleSignature[i].id,
          signature: this.multipleSignature[i].signature,
        });
      }
    }
    if (formVaild) {
      this.service
        .post(`loan/savePromissoryNote/` + this.loanid, 'admin', reqData)
        .pipe(first())
        .subscribe(
          (res: any) => {
            if (res.statusCode == 200) {
              this.emitter.emit();
              this.loadDocHtml();
            } else {
            }
          },
          (err) => {
            console.log(err.error.message);
          }
        );
    } else {
    }
  }
  async get(id: any) {
    var result = new Promise((resolve, reject) => {
      this.service
        .get('loan/getPromissoryNote/' + id, 'admin')
        .pipe(first())
        .subscribe(
          (res) => {
            if (res['statusCode'] == 200) {
              this.htmlDocStatic = res['data'];
              this.multipleSignature = [
                {
                  firstname: 'Tameka',
                  lastname: 'Bryant',
                  signature: '',
                  email: 'test@gmail.com',
                },
              ];
              this.loadDocHtml();
            } else {
            }
            resolve(res);
          },
          (err) => {
            reject(err);
            //console.log(err);
          }
        );
    });
    return result;
  }
  changeAccordion(actType: string) {
    if (actType == 'sign') {
      this.contractnoteShow = false;
      this.contractSignShow = true;
    } else {
      this.contractnoteShow = true;
      this.contractSignShow = false;
    }
  }
  loadDocHtml() {
    let htc;
    htc = this.htmlDocStatic;
    for (let i = 0; i < this.multipleSignature.length; i++) {
      if (this.multipleSignature[i].signature) {
        htc = htc.replaceAll(
          `{({Signature${i}})}`,
          this.multipleSignature[i].signature
        );
      }
    }
    htc = btoa(unescape(encodeURIComponent(htc)));
    //console.log(htc,"base64");
    this.htmlDoc = 'data:text/html;base64,' + htc;
  }
  safeResourceUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
