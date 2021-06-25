import {BehaviorSubject, Subscription} from 'rxjs';
import {Nightmare} from "./nightmare.model";
export class Fragment {
  get activation(): number {
    return this._activation;
  }

  get begin(): number {
    return this._begin;
  }

  set begin(value: number) {
    this.setTimes(value)
  }
  get ant(): Fragment | undefined {
    return this._ant;
  }

  set ant(value: Fragment | undefined) {
    this.antEnd?.unsubscribe()
    if (value){
      this._ant = value
      this.antEnd = this._ant?.end?.asObservable().subscribe(n => this.setTimes(n))
    }else{
      this._ant = value;
    }
  }
  get nm(): Nightmare {
    return this._nm;
  }

  set nm(value: Nightmare) {
    this._nm = value;
    this._activation = this._begin  - this.nm.GvgSkillLead
    this.end?.next( this._activation - this.nm.GvgSkillDur)
  }
  get end(): BehaviorSubject<number> | undefined {
    return this._end;
  }
  private _begin : number = 0
  private _activation:number = 0
  private _end? : BehaviorSubject<number>
  private _ant?: Fragment
  private antEnd?:Subscription
  private _nm : Nightmare
  constructor( nm :Nightmare ,ant? : Fragment, init?: number) {
    this._nm =nm
    if(ant){
      this.ant =ant
      this.antEnd = this.ant.end?.asObservable().subscribe(n=>{
        this.setTimes(n)
      })
    }
    if(init)
      this.setTimes(init)
  }
   private setTimes( init :number, ){

    this._begin =  init
    this._activation = this._begin  - this.nm.GvgSkillLead
     if(!this._end)
       this._end = new BehaviorSubject<number>(this._activation - this.nm.GvgSkillDur)
     else
       this.end?.next( this._activation - this.nm.GvgSkillDur)
  }

}
