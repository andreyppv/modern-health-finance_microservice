import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  name:any="";
  email:any = "";
  password:any = "";
  cpassword:any = "";
  error:any = "";
    constructor(public router:Router) { }
  
    ngOnInit(): void {
    }
  
  validateEmail(email) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
  }
  
  
    login(){
      this.router.navigate(['account/login']);
    }
  
  
    register(){
      this.error = ""
      this.name = this.name.trim();
      this.email = this.email.trim();
      this.password = this.password.trim();
      this.cpassword = this.cpassword.trim();
      if(this.name.length>0){
        if(this.validateEmail(this.email)){
          if(this.password.length>0){
            if(this.password == this.cpassword){
              let users = {
                name : this.name,
                email: this.email,
                password: this.password
              }
              let userlist:any = localStorage.getItem('userlist')
              if(userlist){
                userlist = JSON.parse(userlist)
                let l = 0;
                for (var i = 0; i < userlist.length; ++i) {
                  if(userlist[i]['email'].toLowerCase()== this.email.toLowerCase()){
                    this.error = "this email already exists"
                    l = 1;
                    i = userlist.length+1;
                  }
                }
                if(l==0){
                  userlist.push(users)
                  this.gologin(userlist)
                }  						
              }else{
                userlist = [users]
                this.gologin(userlist)
              }
              
            }else{
              this.error = "Password Mismatch"
            }
          }else{
            this.error = "Please Enter Password"
          }
        }else{
          this.error = "Please Enter Valid Email"
        }
      }else{
        this.error = "Please Enter Name"
      }
    }
  
    gologin(userlist){
      localStorage.setItem('userlist', JSON.stringify(userlist));
      this.router.navigate(['account/login']);
    }
  
  }
