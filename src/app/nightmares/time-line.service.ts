import { Injectable } from '@angular/core';
import {Timeline} from "../shared/timeline.model";
import {copyNightmareFromStorage} from "../shared/nightmare.model";

@Injectable({
  providedIn: 'root'
})
export class TimeLineService {
  get timeline(): Timeline {
    const storage = localStorage.getItem('timeline')
    let tmp :Timeline
    let obj :any

    if(storage){
      obj = JSON.parse(storage)
      tmp = new Timeline(obj._init,obj._max)
      obj._fragment.forEach((fr :any) => tmp.add(copyNightmareFromStorage(fr._nm)))
    }
    else
      tmp = this._timeline
    return tmp
  }

  set timeline(value: Timeline) {
    let obj :any = {}
    obj._init = value.init
    obj._max = value.max
    obj._fragment =[]
    value.fragment.forEach(fr => obj._fragment.push({_nm: fr.nm}))

    localStorage.setItem('timeline',JSON.stringify(obj))
    this._timeline = value;
  }
  private _timeline :Timeline
  constructor() {
    this._timeline =  new Timeline(1200,1200)
  }
}
