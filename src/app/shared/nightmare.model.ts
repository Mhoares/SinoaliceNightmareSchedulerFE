import {NightmareService} from "../nightmares/nightmare.service";
import {Observable, Subscription} from "rxjs";

export enum Rarity {
    A=3,
    S,
    SR,
    L
}
export enum Attribute {
  Fire=1,
  Water,
  Wind
}


export class  Nightmare {

  private readonly _ID : number
  private readonly _Icon: string
  private readonly _Attribute : Attribute
  private readonly _Rarity : Rarity
  private readonly _NameEN : string
  private readonly _GvgSkillEN :string
  private readonly _GvgSkillDur : number
  private readonly _GvgSkillLead : number
  private readonly _GvgSkillSP : number
  private readonly _Global: boolean

 constructor( ID : number,
              Icon: string,
              Attribute : number,
              Rarity : Rarity,
              NameEN : string,
              GvgSkillEN :string,
              GvgSkillDur : number,
              GvgSkillLead : number,
              GvgSkillSP : number,
              Global: boolean) {
   this._ID = ID;
   this._Icon = Icon;
   this._Attribute = Attribute;
   this._Rarity = Rarity;
   this._NameEN = NameEN;
   this._GvgSkillEN = GvgSkillEN;
   this._GvgSkillDur = GvgSkillDur;
   this._GvgSkillLead = GvgSkillLead;
   this._GvgSkillSP = GvgSkillSP;
   this._Global= Global}

  get Global():boolean{
    return this._Global
  }
  get GvgSkillLead(): number {
    return this._GvgSkillLead;
  }
  get GvgSkillDur(): number {
    return this._GvgSkillDur;
  }

  get GvgSkillEN(): string {
    return this._GvgSkillEN;
  }
  get NameEN(): string {
    return this._NameEN;
  }
  get Rarity(): Rarity {
    return this._Rarity;
  }

  get Attribute(): number {
    return this._Attribute;
  }
  get Icon(): string {
    return this._Icon;
  }
  get ID(): number {
    return this._ID;
  }


  get GvgSkillSP(): number {
    return this._GvgSkillSP;
  }
  public getTotalTime(): number{
    return this._GvgSkillDur + this._GvgSkillLead
  }
  public getSkill(): string{
    const limit = this._GvgSkillEN.indexOf("(")
    const  skill = this._GvgSkillEN.slice(0,limit)
    return skill
  }
  public hasSkill(n :Nightmare):boolean{
    return this.getSkill() === n.getSkill()
  }
  public hasActiveTIme(): boolean{
    return this._GvgSkillDur !==0
  }
  public getImageURL(): string{
    const ext=".png"
    let tmp:string = 'https://sinoalice.game-db.tw/images/card/CardS'
    if ( this.ID/1000 < 1){
      tmp+='0'
    }
    return tmp+this.Icon+ext
  }
  public getImage(service: NightmareService): Observable<string>{
        return service.getImage(this._Icon)
  }
  public toString():string{
    return `${this._NameEN}
            Skill: ${this._GvgSkillEN}
            Preparation: ${this._GvgSkillLead}s
            Duration: ${this._GvgSkillDur}s
            SP: ${this._GvgSkillSP}`;
  }

}
export function copyNightmare( nm: Nightmare): Nightmare {
  return new Nightmare(nm.ID,
    nm.Icon,
    nm.Attribute,
    nm.Rarity,
    nm.NameEN,
    nm.GvgSkillEN,
    nm.GvgSkillDur,
    nm.GvgSkillLead,
    nm.GvgSkillSP,
    nm.Global)
}
export function copyNightmareFromStorage(obj:any){
  return new Nightmare(obj._ID,
    obj._Icon,
    obj._Attribute,
    obj._Rarity,
    obj._NameEN,
    obj._GvgSkillEN,
    obj._GvgSkillDur,
    obj._GvgSkillLead,
    obj._GvgSkillSP,
  obj._Global)
}
