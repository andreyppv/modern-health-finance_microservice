import { Component, OnInit,TemplateRef,ViewChild } from '@angular/core';
import { HttpService } from '../../_service/http.service';
import { first } from 'rxjs/operators';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from "@angular/router";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-rolespermission',
  templateUrl: './rolespermission.component.html',
  styleUrls: ['./rolespermission.component.scss']
})
export class RolespermissionComponent implements OnInit {
  roles:any = []
  data:any = []
  f1:any={}
  modalRef: BsModalRef;
  message:any = [];
  pages:any = {}
  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;



  itemList = [];
  selectedItems = [];
  settings = {};

  itemList1 = [];
  selectedItems1 = [];
  settings1 = {};
  

  constructor(private service: HttpService,private modalService: BsModalService,private route: ActivatedRoute,public router:Router) { }

  ngOnInit(): void {
    this.check(this.route.snapshot.paramMap.get('id'))
    this.get(this.route.snapshot.paramMap.get('id'))
    this.settings = {
      enableSearchFilter: true,
      singleSelection: true, 
      text:"Select Portal"
    };

    

      this.settings1 = {
        singleSelection: false,
        text: "Select Pages",
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        searchPlaceholderText: 'Search Pages',
        enableSearchFilter: true,
        badgeShowLimit: 5,
        groupBy: "pagesname"
        
      };
      

  }


  check(id){
    this.service.authget('roles/checkpermission/'+id,'admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200 && res['data'].length>0){
        this.roles= res['data']
      }else{
        this.message = ["Invalid Role ID"]
        this.modalRef = this.modalService.show(this.messagebox);
        this.router.navigate(['admin/settings/roles']);
      }
    },err=>{
      console.log(err)
    })
  }


  get(id){
    this.service.authget('roles/getmenulist/'+id,'admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){
        this.data= res['data']
        console.log(this.data['list'])
        
        let portal = [];
        for (let i = 0; i < this.data['list'].length; i++) {
          if(portal.indexOf(this.data['list'][i]['portal_id'])==-1){
            this.itemList.push({id:this.data['list'][i]['portal_id'],itemName:this.data['list'][i]['portal_name']})
            this.pages[this.data['list'][i]['portal_name']] = []
            portal.push(this.data['list'][i]['portal_id'])
          }
          this.pages[this.data['list'][i]['portal_name']].push(this.data['list'][i])
        }

        

        for (let i = 0; i < this.data['select'].length; i++) {
          let portal = [];
          if(portal.indexOf(this.data['select'][i]['portal_id'])==-1){
            this.itemList1 = this.pages[this.data['select'][i]['portal_name']]
            this.selectedItems.push({id:this.data['select'][i]['portal_id'], itemName:this.data['select'][i]['portal_name']})
            portal.push(this.data['select'][i]['portal_id'])
          }
        }

      
        this.selectedItems1 = this.data['select']
      
      }
    },err=>{
      console.log(err)
    })
  }

  close(): void {
    this.modalRef.hide();
  }


 
onItemSelect(item:any){
console.log(item);
this.itemList1 = this.pages[item.itemName]
this.selectedItems1 = []
console.log(this.selectedItems);
}
OnItemDeSelect(item:any){
console.log(item);
console.log(this.selectedItems);
}

onItemSelect1(item:any){
  console.log(item);
  console.log(this.selectedItems1);
  }

  OnItemDeSelect1(item:any){
  console.log(item);
  console.log(this.selectedItems1);
  }

onSelectAll(items: any) {
  console.log(items);
}
onDeSelectAll(items: any) {
  console.log(items);
}


save(){
  if(this.selectedItems.length>0){
    if(this.selectedItems1.length>0){
      let data = {
        id : +this.route.snapshot.paramMap.get('id'),
        ids:[]
      }
      let ids = []
      for (let i = 0; i < this.selectedItems1.length; i++) {
        if(ids.indexOf(this.selectedItems1[i]['pagetabs_id'])==-1){
          data.ids.push({   
            portal_id: this.selectedItems1[i]['portal_id'], 
            pages_id:this.selectedItems1[i]['pages_id'],    
            pagetabs_id: this.selectedItems1[i]['pagetabs_id'],
            })
            ids.push(this.selectedItems1[i]['pagetabs_id'])
        }
        
      }
      console.log(data)
      this.service.authpost('roles/addpermission','admin',data)
      .pipe(first())
      .subscribe(res=>{
        if(res['statusCode']==200){
          this.message = ["Successfully Saved"]
          this.modalRef = this.modalService.show(this.messagebox);
          this.router.navigate(['admin/settings/roles']);
        }
      },err=>{
        console.log(err)
      })
    }else{
      this.message = ["Please select Page"]
      this.modalRef = this.modalService.show(this.messagebox);
    }
  }else{
    this.message = ["Please select Portal"]
    this.modalRef = this.modalService.show(this.messagebox);
  }
  
}

}
