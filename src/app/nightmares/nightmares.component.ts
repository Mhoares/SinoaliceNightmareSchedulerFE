import {Component, OnDestroy, OnInit} from '@angular/core';
import { Nightmare } from '../shared/nightmare.model';
import {NightmareService} from "./nightmare.service";
import {Subject, Subscription} from "rxjs";

@Component({
  selector: 'app-nightmares',
  templateUrl: './nightmares.component.html',
  styleUrls: ['./nightmares.component.sass']
})
export class NightmaresComponent implements OnInit,OnDestroy {
  nms: Nightmare[] =[]
  load: boolean = false
  private snm: Subscription
  selectedNm:Subject<Nightmare> = new Subject<Nightmare>();
  constructor(private service:NightmareService) {

    this.snm = this.service.getNightmares().subscribe(nms =>{
      this.nms = nms
      this.load = true
    })
  }

  ngOnInit(): void {

  }
  ngOnDestroy():void{
    this.snm.unsubscribe()
  }

}
