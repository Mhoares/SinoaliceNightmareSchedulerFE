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
  disabled = false
  constructor(private tmservice:TimeLineService) {
  }
  ngOnInit() {
    this.canEdit = this.tmservice.canEdit.value
    this.tmservice.canEdit.asObservable().subscribe( v => {
      this.canEdit = v
    })
    this.tmservice.disableEdit.asObservable().subscribe(v => this.disabled = v)
  }
  edit( e : MatSlideToggleChange){
    this.canEdit = e.checked
    this.tmservice.canEdit.next(this.canEdit)


  }
}
