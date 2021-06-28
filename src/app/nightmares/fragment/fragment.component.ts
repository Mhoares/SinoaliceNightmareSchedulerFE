import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Fragment} from "../../shared/fragment.model";
import {Nightmare} from "../../shared/nightmare.model";
import {NightmareService} from "../nightmare.service";
import {Subject} from "rxjs";
import {TimeLineService} from "../time-line.service";

@Component({
  selector: 'app-fragment',
  templateUrl: './fragment.component.html',
  styleUrls: ['./fragment.component.sass']
})
export class FragmentComponent implements OnInit {
  @Input() fragment? :Fragment
  @Input() isLast : boolean = false
  @Input()  canEdit : boolean = false
  @Input()  saving : boolean = false
  @Input() statusUpdate? : Subject<Map<number, boolean>>
  @Output() removed :EventEmitter<Nightmare> = new EventEmitter<Nightmare>()
  @Output()  updated :EventEmitter<Nightmare> = new EventEmitter<Nightmare>()
  @Output()  inserted :EventEmitter<Fragment> = new EventEmitter<Fragment>()
  img =''

  constructor(private service:NightmareService, private tlService:TimeLineService) { }

  ngOnInit(): void {
    this.fragment?.nm.getImage(this.service).then( img => this.img = img)
  }
  date(s:number):Date{

    return new Date(Math.abs(s *1000))
  }
  delete(){
    this.removed.emit(this.fragment?.nm)
  }
  update(){
    this.updated.emit(this.fragment?.nm)
    this.statusUpdate?.asObservable().subscribe( map => {
      if (map.get(this.fragment?.nm.ID|| 0))
        this.fragment?.nm.getImage(this.service).then(img =>{
            this.img = img
        }

        )
    })

  }
  insert(){
    this.inserted.emit(this.fragment)
  }
  symbol(s :number): string{
    if(s < 0)
      return '-'
    return ''
  }

}
