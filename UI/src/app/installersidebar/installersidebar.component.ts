import { Component, OnInit } from '@angular/core';
import { HttpService} from '../_service/http.service';

@Component({
  selector: 'app-installersidebar',
  templateUrl: './installersidebar.component.html',
  styleUrls: ['./installersidebar.component.scss']
})
export class InstallersidebarComponent implements OnInit {

  constructor(private service:HttpService) { }
  pages:any = {
    "Dashboard":false,
    "Customers":false,
    "Profile":false,
    "Transaction":false
   }
  ngOnInit(): void {
    let pages = sessionStorage.getItem('pages')
   
    if(pages){
      pages = JSON.parse(pages)
      for (let i = 0; i < pages.length; i++) {
        this.pages[pages[i]['name']]=true;
      }
    }
  }

  logout(){
    this.service.logout()
  }

}
