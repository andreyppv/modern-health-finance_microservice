import { Component, OnInit } from '@angular/core';
import {AppComponent} from '../app.component';
import { HttpService} from '../_service/http.service';

@Component({
  selector: 'app-adminsidebar',
  templateUrl: './adminsidebar.component.html',
  styleUrls: ['./adminsidebar.component.scss']
})
export class AdminsidebarComponent implements OnInit {
  
  Messages:any = false
  Alert:any = false
  Settings:any = false;
  notification:any = []
  pages:any = {
    "Dashboard":false,
    "Approved Application":false,
    "Pending Application":false,
    "Incomplete Application":false,
    "Denied Application":false,
    "Funding Contracts": false,
    "Performing Contracts": false,
    "Archived Open Applications":false,
    "Settings":false,
    "Installer Management":false,
    "Users":false,
    "Start Application":false,
    "Logs":false
  };

  tabs:any = {
    "Audit Log":false,
    "Questions":false,
    "Admin Security":false,
    "Roles":false,
    "DecisionEngine":false
  };

  tabs1:any = {
    "Audit Log":false,
    "Login Log":false,
    "Transaction":false
  };

  logedUser : any = {};
  constructor(private app:AppComponent,private service:HttpService) { }

  ngOnInit(): void {
    let pages = sessionStorage.getItem('pages');
    let tabs:any = sessionStorage.getItem('tabs');
    this.logedUser= JSON.parse(sessionStorage.getItem('resuser'));
    console.log(this.logedUser);
    if(pages){
      pages = JSON.parse(pages)
      if(tabs){
        tabs = JSON.parse(tabs)
      }
      for (let i = 0; i < pages.length; i++) {
        //console.log(pages[i]['name'],"here")
        this.pages[pages[i]['name']]=true;
        if(pages[i]['name']=='Settings'){
            for (let j = 0; j < tabs[pages[i]['id']].length; j++) {
              this.tabs[tabs[pages[i]['id']][j]['name']]=true;
            }
        }
        if(pages[i]['name']=='Logs'){
         
            for (let j = 0; j < tabs[pages[i]['id']].length; j++) {
              this.tabs1[tabs[pages[i]['id']][j]['name']]=true;
            }
        }
      }
    }
    console.log(this.tabs1)
    // this.gettop()
  }


  logout(){
  this.service.logout()
  }
  
  switchsidenavtoggled(){
    this.app.sidenavtoggled = !this.app.sidenavtoggled
  }

  switchmessages(){
    this.Alert = false
    this.Messages = !this.Messages
  }

  switchalert(){
    this.Messages = false
    this.Alert = !this.Alert
  }

  switchSettings(){
    this.Settings = !this.Settings
  }

  gettop(){
    this.service.authget('notification/gettop','admin').subscribe(res=>{
      if(res['statusCode']==200){
        this.notification=res['data']
      }
      console.log(res)
    },err=>{

    })
  }

}
