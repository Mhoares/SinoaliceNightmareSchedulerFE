import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Subject} from "rxjs";
import {Nightmare} from "../../shared/nightmare.model";
import {Timeline} from "../../shared/timeline.model";
import {Fragment} from "../../shared/fragment.model";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {TimeLineService} from "../time-line.service";

@Component({
  selector: 'app-time-line',
  templateUrl: './time-line.component.html',
  styleUrls: ['./time-line.component.sass']
})
export class TimeLineComponent implements OnInit {
  @Input() selectedNm: Subject<Nightmare> = new Subject<Nightmare>()
  timeLine: Timeline
  updateNm?: Nightmare
  insertFr?: Fragment
  action ="add"
  help ='Simplified view, add Nightmares to the timeline by double clicking them in the panel'
  canEdit = false
  snackbarDuration = 5000
  constructor(private _snackBar: MatSnackBar, private service: TimeLineService) {
    this.timeLine = service.timeline
  }

  ngOnInit(): void {
    this.service.canEdit.asObservable().subscribe( can =>
    {
      this.canEdit = can
      if(this.canEdit)
        this.help ="Edit mode , edit your timeline..."
      else
        this.help ='Simplified view, add Nightmares to the timeline by double clicking them in the panel'
    })
    this.selectedNm.asObservable().subscribe(nm =>{
      if(this.action =="add"){
        if(this.timeLine.add(nm)){
          this._snackBar.open(`${nm.NameEN} has been added`,"close", {duration: this.snackbarDuration})
          this.service.timeline = this.timeLine
        }
        else
          this._snackBar.open(` ${nm.NameEN} can't be added `,"close", {duration: this.snackbarDuration})
      }

      if(this.action =="edit" && this.updateNm){
        if (this.timeLine.update(this.updateNm, nm )){
          this._snackBar.open(`${this.updateNm.NameEN} has been changed for ${nm.NameEN}`,"close", {duration: this.snackbarDuration})
          this.service.timeline = this.timeLine
        }

        else
          this._snackBar.open(`${this.updateNm.NameEN} can't be changed for ${nm.NameEN}, press the button again to retry`,"close")

        this.help ="Select a Nightmare in the panel with double click to add it to the timeline"
        this.action = "add"
      }
      if (this.action =="insert" && this.insertFr){
        if (this.timeLine.insert(nm,this.insertFr)){
          this._snackBar.open(`${nm.NameEN} has been inserted`,"close", {duration: this.snackbarDuration})
          this.service.timeline = this.timeLine
        }
        else
          this._snackBar.open(`${nm.NameEN} can't be inserted, press the button again to retry`,"close", {duration: this.snackbarDuration})
        this.help ="Select a Nightmare in the panel with double click to add it to the timeline"
        this.action = "add"
      }

    })
  }
  remove( nm: Nightmare){
     this.timeLine.remove(nm)
    this._snackBar.open(`${nm.NameEN} has been removed`,"close", {duration: this.snackbarDuration})
    this.service.timeline = this.timeLine
  }
  update(nm:Nightmare){
    this.action = "edit"
    this.help =`Select a Nightmare in the panel with double click to change ${nm.NameEN}`
    this._snackBar.open(this.help,'close', {duration: this.snackbarDuration})
    this.updateNm = nm
  }
  insert(fr :Fragment){
    this.action ="insert"
    this.help =`Select a Nightmare in the panel with double click for insert it`
    this._snackBar.open(this.help,'close', {duration: this.snackbarDuration})
    this.insertFr = fr
  }
  delete(){
    this.timeLine.delete()
    this.service.timeline = this.timeLine
  }


}
