import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { first } from 'rxjs/operators';
import { HttpService } from 'src/app/_service/http.service';

@Component({
  selector: 'app-milestone-fund-set',
  templateUrl: './milestone-fund-set.component.html',
  styleUrls: ['./milestone-fund-set.component.scss']
})
export class MilestoneFundSetComponent implements OnInit {
  setMilestoneForm:any = {}

  modalRef: BsModalRef;
  message:any = [];
  @ViewChild('messagebox', { read: TemplateRef }) messagebox:TemplateRef<any>;

  constructor(
    private service: HttpService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    this.getMilestoneFundPer();
  }

  getMilestoneFundPer(){
    this.service.authget('milestone-fund','admin')
    .pipe(first())
    .subscribe(res=>{
      if(res['statusCode']==200){        
        this.setMilestoneForm['milestone1fundper'] = res['data'][0]['value']
        this.setMilestoneForm['milestone2fundper'] = res['data'][1]['value']
        this.setMilestoneForm['milestone3fundper'] = res['data'][2]['value']
        
      }else{
        this.message = res['message']
        this.modalRef = this.modalService.show(this.messagebox);
      }
    },err=>{
      if(err['error']['message'].isArray){
        this.message = err['error']['message']
      }else{
        this.message = [err['error']['message']]
      }
      this.modalRef = this.modalService.show(this.messagebox);
    })
  }

  number(data){
    return data.target.value = data.target.value.replace(/[^0-9.]/g,'')
  }

  updateMilestoneFundPer(){
    if(this.setMilestoneForm['milestone1fundper'] !='' && this.setMilestoneForm['milestone2fundper'] !='' && this.setMilestoneForm['milestone3fundper'] !=''){
      if(
        Number(this.setMilestoneForm['milestone1fundper']) + 
        Number(this.setMilestoneForm['milestone2fundper']) + 
        Number(this.setMilestoneForm['milestone3fundper']) == 100){
        this.service.authput('milestone-fund/update', 'admin', this.setMilestoneForm)
        .pipe(first())
        .subscribe(res=>{
          if(res['statusCode']==200){  
            this.message = res['message']
            this.modalRef = this.modalService.show(this.messagebox);
          }else{
            this.message = res['message']
            this.modalRef = this.modalService.show(this.messagebox);
          }
        },err=>{
          if(err['error']['message'].isArray){
            this.message = err['error']['message']
          }else{
            this.message = [err['error']['message']]
          }
          this.modalRef = this.modalService.show(this.messagebox);
        })    
      }else{
        this.message = ['Please enter correct percentage values!']
        this.modalRef = this.modalService.show(this.messagebox);
      }
    }else{
      this.message = ['Please enter all values!']
      this.modalRef = this.modalService.show(this.messagebox);
    }
  }
}
