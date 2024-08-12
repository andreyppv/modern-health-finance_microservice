import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-page3',
  templateUrl: './page3.component.html',
  styleUrls: ['./page3.component.scss']
})
export class Page3Component implements OnInit {
  check:any = 0
  constructor(public router:Router) { }

  ngOnInit(): void {
    window.top.postMessage(3,'*');
  }

  next(){
    if(this.check>0 && this.check<9){
      this.router.navigate(['sales/page4']);
    }
  }

}
