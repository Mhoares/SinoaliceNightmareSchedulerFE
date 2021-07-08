import {Fragment} from "./fragment.model";
import {Nightmare} from "./nightmare.model";
import {NightmareService} from "../nightmares/nightmare.service";


export class Timeline {
  get max(): number {
    return this._max;
  }
  get init(): number {
    return this._init;
  }
  get fragment(): Fragment[] {
    return this._fragment;
  }
  private _fragment: Fragment[]  = []
  private readonly _init: number
  private readonly _max: number

  constructor(init:number, max:number) {
    this._init = init
    this._max = max
  }
  add(nm :Nightmare, summoner? :string): boolean{
    const lenght = this._fragment.length
    let exist: Fragment|undefined
    let added = false
    if (this.totalTime() < this._max){
      if(!lenght){
        this._fragment.push(new Fragment(nm,undefined, this._init))
        if (summoner)
          this._fragment[this._fragment.length-1].summoner = summoner
        added = true
      } else{
        exist = this._fragment.find(f => f.nm.hasSkill(nm))
        if(!exist){
          added = true
          this._fragment.push(new Fragment(nm,this._fragment[lenght-1]))
          if (summoner)
            this._fragment[this._fragment.length-1].summoner = summoner
        }
      }
    }
    return added
  }
  insert(nm :Nightmare, fr :Fragment, flex :boolean = false, summoner?:string): boolean{
    const i = this._fragment.indexOf(fr)
    const  exist = this._fragment.find(f => f.nm.hasSkill(nm))
    const last = this._fragment.length -1
    const  lastCast = this.totalTime() - this._fragment[last].nm.GvgSkillLead + nm.getTotalTime()
    let tmp: Fragment
    if(  !flex && exist)
      return false
    if(lastCast > this._max)
      return false
    if(i>0){
      tmp = new Fragment(nm,this._fragment[i].ant)
    }else{
      tmp = new Fragment(nm,undefined,this._init)
    }
    if(summoner)
      tmp.summoner = summoner
    this._fragment[i].ant = tmp
    this._fragment.splice(i,0,tmp)
    return true
  }
  update(nm: Nightmare, unm:Nightmare): boolean{
    const lenght = this._fragment.length
    const last = this._fragment.length -1
    const  lastCast = this.totalTime() - this._fragment[last].nm.GvgSkillLead - nm.getTotalTime()  + unm.getTotalTime()
    let updated = 0
    let exist: Fragment|undefined
    let fr :Fragment | undefined

    if (lastCast > this._max)
      return false
    if ( lenght && nm.ID != unm.ID ){
      fr = this._fragment.find(f => f.nm.ID == nm.ID)
      exist = this._fragment.find(f =>nm.ID !=f.nm.ID && f.nm.hasSkill(unm))
      if(fr && !exist){
        updated = this._fragment.indexOf(fr)
        this._fragment[updated].nm = unm
        this._fragment[updated].nm.Image = ''
        return true
      }
    }
    return false
  }
  remove(nm: Nightmare):boolean{
    const lenght = this._fragment.length
    let removed = 0
    let fr :Fragment | undefined

    if(lenght){
      fr = this._fragment.find(f => f.nm.ID == nm.ID)
      if(fr){
        removed = this._fragment.indexOf(fr)
        this._fragment.splice(removed,1)
        if (removed > 0 && this._fragment.length !=removed){
          this._fragment[removed].ant = this._fragment[removed-1]
        }else if(this._fragment.length > 0 &&  removed == 0){
          this._fragment[removed].begin = this._init
          this._fragment[removed].ant = undefined
        }

      }else
        return false

    }else
      return false
    return true
  }

  totalTime(): number{
    let time = 0
    this._fragment.forEach(fr => time+=fr.nm.getTotalTime())
    return time
  }
  delete(){
    this._fragment.splice(0,this._fragment.length)
  }
  adjustTimes(current :number , previous :number){
    const  p =  this._fragment[previous].nm
    const n = this._fragment[previous].summoner
    this.remove(p)
    if(current < this._fragment.length)
      this.insert(p,this._fragment[current],true, n)
    else
      this.add(p,n)

  }
}
