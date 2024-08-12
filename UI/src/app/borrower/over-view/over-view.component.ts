import { Component, OnInit ,EventEmitter, Output} from '@angular/core';
import { HttpService } from 'src/app/_service/http.service';
import { first } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-over-view',
  templateUrl: './over-view.component.html',
  styleUrls: ['./over-view.component.scss']
})
export class OverViewComponent implements OnInit {
  data:any={
    user_details:[],
    payment_details:[],
    next_schedule:null
  }
  monthDue=0;
  maincolor:string;
  secondarycolor:string;
  remainingBalance=0;
  nextDuedate=null;
  secondaryColor = "#fff";
  practice_logo:any =[];
  practiceMain_logo:any =[];
  constructor(
    private service: HttpService,
    public datePipe: DatePipe,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.getOverView();
    const mainColor  = localStorage.getItem('mainColor');
    this.secondaryColor = localStorage.getItem('secondaryColor');
    this.service.getMainColor.next({practiceMainColor: mainColor, pacticeSecondaryColor: this.secondaryColor})
  }
  getOverView(){
    //let userId = 'a31c9aed-8933-4825-b71f-c44be24b014d';
    let userId = sessionStorage.getItem('UserId');

    this.service.authget("overview/"+userId,"borrower")
    .pipe(first())
    .subscribe(res=>{

      if(res['statusCode']==200){
      //  console.log('res--logo', res)
        this.addlog("view overview page",res['data']['user_details'][0].loan_id)
        this.data= res['data'];
        sessionStorage.setItem('LoanId', this.data['user_details'][0].loan_id);
        this.maincolor=res['data']['user_details'][0].practiceMainColor;
        this.secondarycolor=res['data']['user_details'][0].pacticeSecondaryColor;

        
        //console.log('*****',this.practice_logo,'-------',this.practiceMain_logo)
        if(this.data.next_schedule != null){
          //to get monthDue
          this.monthDue = this.data.next_schedule.amount;
          //to get unpaidprincipal
          this.remainingBalance = this.data.next_schedule.unpaidprincipal;
          //to get nextDuedate
          this.nextDuedate = this.data.next_schedule.scheduledate;
        }

      }
    },err=>{
      console.log(err)
    })
  }

  addlog(module,id){
    this.service.addlog(module,id,"borrower").subscribe(res=>{},err=>{})
  }
  view(filename:any){
    filename = filename.split('/')
    filename = filename[filename.length-1]
    window.open(environment.borrowerapiurl+"files/download/"+filename, "_blank");
  }
}
