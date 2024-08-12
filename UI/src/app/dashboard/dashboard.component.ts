import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  user:any = {
		name : "",
		email :""
	}
  constructor(public router:Router) { }

  ngOnInit(): void {
  	let user:any = localStorage.getItem('user')
  	if(user){
  		this.user = JSON.parse(user)
  	}else{
  		this.router.navigate(['account/register']);
  	}
  }

}
