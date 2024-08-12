import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  installerId = sessionStorage.getItem('InstallerUserId');
  maininstallerid = sessionStorage.getItem('MainInstallerId');

  data:any={
    "uploadcount": 0,
    "verfiycount": 0,
    "milestonecount": 0,
    "applicationsList":[]
  }
  constructor(public router:Router,private service: HttpService, ) { }

  ngOnInit(): void {
    this.get()
  }


  go(id){
    this.router.navigate(['installer/main/applicationdetails/'+id]);
  }


  get(){
    let inst_id = (this.maininstallerid!='null')?this.maininstallerid:this.installerId;

    this.service.authget("main/"+inst_id,"installer")
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){     
        this.data= res['data']; 
      }
    },err=>{
      console.log(err)
    })
  }

}
