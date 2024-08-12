import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email:any = "";
  password:any = "";
  error:any = "";
    constructor(public router:Router) { }
  
    ngOnInit(): void {
    }
  
    validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
  
    login(){
      this.error = ""
      this.email = this.email.trim();
        this.password = this.password.trim();
        if(this.validateEmail(this.email)){
          if(this.password.length>0){
            let userlist:any = localStorage.getItem('userlist')
          if(userlist){
            userlist = JSON.parse(userlist)
            for (var i = 0; i < userlist.length; ++i) {
              if(userlist[i]['email'].toLowerCase()== this.email.toLowerCase() && userlist[i]['password'] == this.password){
                localStorage.setItem('user', JSON.stringify(userlist[i]));
                i = userlist.length + 1
                this.router.navigate(['dashboard']);
              }
            }
          }else{
            this.error = "Invalid Credentials"
          }
  
          }else{
            this.error = "Please Enter Password"
          }
        }else{
          this.error = "Please Enter Valid Email"
        }
    }
  
    register(){
      this.router.navigate(['account/register']);
    }
  
  }
