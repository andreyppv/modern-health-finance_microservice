import { Component, OnInit } from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';
import {environment} from '../../../environments/environment'

@Component({
  selector: 'app-decision-engine',
  templateUrl: './decision-engine.component.html',
  styleUrls: ['./decision-engine.component.scss']
})
export class DecisionEngineComponent implements OnInit {
  src:any = ""

  constructor(
    private sanitizer: DomSanitizer,
  ) {
    //this.src = this.sanitizer.bypassSecurityTrustResourceUrl(environment.mastercreditscore)
  }

  ngOnInit(): void {
    this.cs();
  }

  cs(){
    this.src = this.sanitizer.bypassSecurityTrustResourceUrl(environment.creditscore)
  }
  
  mcs(){
    this.src = this.sanitizer.bypassSecurityTrustResourceUrl(environment.mastercreditscore)
  }
}
