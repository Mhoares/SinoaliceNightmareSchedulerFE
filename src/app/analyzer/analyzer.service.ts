import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {Ranks} from "../shared/ranks.model";
import {environment} from "../../environments/environment";
import {Weapons} from "../shared/analyzer.constants";
import {WeaponRaw} from "../shared/weapon_raw.model";
import {Skill, SupportSkill, Weapon} from "../shared/weapon.class";
import {map} from "rxjs/operators";
import {SupportSkillDefinition} from "../shared/support_skill_definition.model";

@Injectable({
  providedIn: 'root'
})
export class AnalyzerService {
  boostDefinitions: BehaviorSubject<Map<string, SupportSkillDefinition>> = new BehaviorSubject<Map<string, SupportSkillDefinition>>(new Map<string, SupportSkillDefinition>())

  constructor(private http: HttpClient) {
  }

  getWeaponsRaw(): Observable<WeaponRaw[]> {

    return this.http.get<WeaponRaw[]>(`${environment.apiUrl}/weapon`)
  }

  getSupportSkillDefinition(name: string): Observable<SupportSkillDefinition> {
    let params = new HttpParams().set("name", name)
    return this.http.get<SupportSkillDefinition>(`${environment.apiUrl}/weapon/support_skill`, {params})
  }

  async getBoostDefinitions() {
    let tmp = new Map<string, SupportSkillDefinition>()
    await this.getSupportSkillDefinition('Support Boon').toPromise().then(s => tmp.set(s.support_skill_name, s))
    await this.getSupportSkillDefinition('Recovery Support').toPromise().then(s => tmp.set(s.support_skill_name, s))
    await this.getSupportSkillDefinition('Dauntless Courage').toPromise().then(s => tmp.set(s.support_skill_name, s))
    this.boostDefinitions.next(tmp)
  }

  async getWeapons(): Promise<Weapon[]> {
    let tmp: Weapon[] = []
    await this.getBoostDefinitions()
    let raw = await this.getWeaponsRaw().toPromise()
    raw.forEach(wr => {
      const w =  this.rawToWeapon(wr)
      tmp.push(w)

    })
    return tmp
  }
  setSupportSkillLvl(weapon: Weapon,lvl:number) :boolean{
    let result = false
    const support = this.boostDefinitions.value.get(weapon.support.name)

    if (support && lvl<=20){
      weapon.support.level = lvl
      weapon.support.rate = support.support_skill_tier[weapon.support.tier][lvl-1].rate ||0
      weapon.support.value =support.support_skill_tier[weapon.support.tier][0].value || undefined
    }
    return result
  }
  rawToWeapon(wr :WeaponRaw) :Weapon{
    const skill = new Skill(1,
      wr.targets,
      wr.skill_name,
      wr.sp,
      wr.damage,
      wr.recover,
      wr.patk,
      wr.matk,
      wr.pdef,
      wr.mdef,
      wr.type)
    const support = new SupportSkill(1,
      wr.support_skill_name,
      wr.support_skill_tier,
      this.boostDefinitions.value.get(wr.support_skill_name)?.support_skill_tier[wr.support_skill_tier][0].rate || 0,
      this.boostDefinitions.value.get(wr.support_skill_name)?.support_skill_tier[wr.support_skill_tier][0].value || undefined
    )
    return new Weapon(wr.id, wr.resource_id,wr.name, wr.type, wr.rarity, wr.cost,wr.attribute, wr.evo, wr.is_infinite_evo, skill, support)

  }
}
