import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-pendings',
  templateUrl: './pendings.component.html',
  styleUrls: ['./pendings.component.scss']
})
export class PendingsComponent implements OnInit {
data:any=[]

  constructor(private service: HttpService) { }

  ngOnInit(): void {
    this.get()
  }

  get(){
    this.service.authget('pending','admin')
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
