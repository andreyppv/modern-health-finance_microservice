import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-denied',
  templateUrl: './denied.component.html',
  styleUrls: ['./denied.component.scss']
})
export class DeniedComponent implements OnInit {
  data:any=[]

  constructor(private service: HttpService) { }

  ngOnInit(): void {
    this.get()
  }

  get(){
    this.service.authget('denied','admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.data= res['data']
      }
    },err=>{
      console.log(err)
    })
  }

  
  

}