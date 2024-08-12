import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-practice-settings',
  templateUrl: './practice-settings.component.html',
  styleUrls: ['./practice-settings.component.scss']
})
export class PracticeSettingsComponent implements OnInit {
  isListView : Boolean = true;
  data : any = [];
  constructor() { }

  ngOnInit(): void {
  }

}
