import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Subject} from "rxjs";
import {Nightmare} from "../../shared/nightmare.model";
import {Timeline} from "../../shared/timeline.model";
import {Fragment} from "../../shared/fragment.model";
import {MatSnackBar} from "@angular/material/snack-bar";
import {TimeLineService} from "../time-line.service";
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import html2canvas from "html2canvas"
import {saveAs} from "file-saver";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";


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
  updated : Subject<Map<number, boolean>> = new Subject<Map<number,boolean>>()
  action ="add"
  help ='Simplified view, add Nightmares to the timeline by double clicking them in the panel'
  canEdit = false
  saving = false
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
        this.help ='Simplified view, add Nightmares to the timeline by double clicking them in the panel, also you can drag and drop to reorder in the timeline'
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
          const map = new Map<number, boolean>()
          map.set(nm.ID, true)
          this.updated.next(map)
          this.service.timeline = this.timeLine
        }
        else{
          this._snackBar.open(`${this.updateNm.NameEN} can't be changed for ${nm.NameEN}, press the button again to retry`,"close")
        }

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
  drop(event: CdkDragDrop<Fragment[]>) {
    if (event.previousIndex != event.currentIndex) {
      this.timeLine.adjustTimes(event.currentIndex, event.previousIndex)
      this.service.timeline = this.timeLine
    }
  }
  save(){
      const nms = document.getElementById('schedule')
      if (nms)
      html2canvas(nms).then(canvas =>{

        canvas.toBlob( blob => {
          if (blob)
            saveAs(blob,'schedule'+new Date().getTime())
        },"image/png")
      })
    this._snackBar.open("Saving...",'close', {duration: this.snackbarDuration})
  }
  canSave(e: MatSlideToggleChange){
    this.saving = e.checked
    if(this.saving){
      this.service.canEdit.next(false)
      this.service.disableEdit.next(true)
    }else{
      this.service.disableEdit.next(false)
    }


  }


}
