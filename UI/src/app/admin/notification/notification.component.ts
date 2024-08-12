import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { Router } from "@angular/router";

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  data:any=[]
  constructor(private service: HttpService,public router:Router,) { }

  ngOnInit(): void {
    this.get()
  }

  get(){
    this.service.authget('notification/getall','admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.data= res['data']
        this.changed()
      }
    },err=>{
      console.log(err)
    })
  }

  go(link){
    this.router.navigate([link]);
  }


  changed(){
    this.service.authget('notification/viewed','admin')
    .pipe(first())
    .subscribe(res=>{
      console.log(res)
    },err=>{
      console.log(err)
    })
  }

}
