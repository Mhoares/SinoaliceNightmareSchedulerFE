import {Component, OnInit} from '@angular/core';
import {TimeLineService} from "./nightmares/time-line.service";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit{
  title = 'SinoaliceNightmareSchedulerFE';
  canEdit = false
  constructor(private tmservice:TimeLineService) {
  }
  ngOnInit() {
    this.canEdit = this.tmservice.canEdit.value
  }
  edit( e : MatSlideToggleChange){
    this.canEdit = e.checked
    this.tmservice.canEdit.next(this.canEdit)


  }
}
