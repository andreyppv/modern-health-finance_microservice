import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { HttpService } from '../_service/http.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  loanid : string = '';
  constructor(public router:Router,private route: ActivatedRoute,private service: HttpService,) { }

  ngOnInit(): void {
    this.loanid = this.route.snapshot.paramMap.get('loanid');
      if(this.loanid != null && this.loanid != undefined && this.loanid){
        this.updateemailVerified();
      }
  }
  updateemailVerified(){
    this.service
      .get(`loan/verifyEmail/${this.loanid}`, 'admin')
      .pipe(first())
      .subscribe(
        (res) => {
          if (res['StatusCode'] == 200) {
            this.service.showSuccess("Your email has been successfully verified");
            this.router.navigateByUrl(`startApplication/${this.loanid}`);
          } else {
            this.router.navigateByUrl(`/`);
            this.service.showError('Email not verified');
          }
        },
        (err) => {
          console.log(err);
          this.service.showError('Invaild page');
        }
      );
  }
}
