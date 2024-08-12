import { Component, TemplateRef,ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../../_service/http.service';
import { Router } from "@angular/router";
import {environment} from '../../../environments/environment';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import {
  PlaidConfig,
  NgxPlaidLinkService,
  PlaidLinkHandler
} from "ngx-plaid-link";
@Component({
  selector: 'app-plaid',
  templateUrl: './plaid.component.html',
  styleUrls: ['./plaid.component.scss']
})
export class PlaidComponent  {
  

  private plaidLinkHandler: PlaidLinkHandler;

  config: PlaidConfig
  modalRef: BsModalRef;
  message:any = [];
  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;
  constructor(
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private service: HttpService,
    public router:Router,
    private plaidLinkService: NgxPlaidLinkService
  ) { 
    this.config = {
      apiVersion: environment.plaidApiVersion,
      env:  environment.plaidEnv,
      token: '',
      webhook: "",
      product: ['auth','assets','transactions'],
      countryCodes: ['US'],
      key: "",
      onSuccess: (token, metadata) => this.onSuccess(token, metadata),
      onExit: (error, metadata) => this.onExit(error, metadata),
      onEvent: (eventName, metadata) => this.onEvent(eventName, metadata)
    };
    
  }
  
  
  

  

  

  open() {
    this.plaidLinkHandler.open();
  }

  exit() {
    this.plaidLinkHandler.exit();
  }

  onSuccess(token, metadata) {

    this.service.post("plaid/savetoken/"+this.route.snapshot.paramMap.get('id'),"borrower",{public_token:token}).subscribe(res=>{
      if(res['statusCode']==200){
        this.message = ['Successfully Connected Your Bank']
        this.modalRef = this.modalService.show(this.messagebox);
        this.router.navigate(['borrower']);
      }      
    },err=>{
     console.log(err) 
    })
  }
  onEvent(eventName, metadata) {
    // console.log("We got an event:", eventName);
    // console.log("We got metadata:", metadata);
  }

  onExit(error, metadata) {
    // console.log("We exited:", error);
    // console.log("We got metadata:", metadata);
  }

  plaidLogin(){

    this.service.get("plaid/plaidLinkToken/"+this.route.snapshot.paramMap.get('id'),"borrower").subscribe(res=>{
      this.config.token = res['token']
      this.plaidLinkService
        .createPlaid( Object.assign({}, this.config, {
          onSuccess: (token, metadata) => this.onSuccess(token, metadata),
          onExit: (error, metadata) => this.onExit(error, metadata),
          onEvent: (eventName, metadata) => this.onEvent(eventName, metadata)
        })
      ).then((handler: PlaidLinkHandler) => {
        this.plaidLinkHandler = handler;
        this.open();
      });

    })

  }


  
  close(): void {
    this.modalRef.hide();
  }
  
}