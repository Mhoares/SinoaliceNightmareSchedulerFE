import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {BehaviorSubject, Observable, Subject, Subscription} from "rxjs";
import {environment} from "../../environments/environment";
import {Jobs} from "../shared/analyzer.constants";
import {WeaponRaw} from "../shared/weapon_raw.model";
import {Skill, SupportSkill, Weapon} from "../shared/weapon.class";
import {SupportSkillDefinition} from "../shared/support_skill_definition.model";
import {Grid, StorageGrid} from "../shared/grid.class";

@Injectable({
  providedIn: 'root'
})
export class AnalyzerService {
  boostDefinitions: BehaviorSubject<Map<string, SupportSkillDefinition>> = new BehaviorSubject<Map<string, SupportSkillDefinition>>(new Map<string, SupportSkillDefinition>())
  inventory: Weapon[] = []
  antGridChange?:Subscription
  grid = new BehaviorSubject<Grid>(new Grid({
    patk: 0,
    pdef: 0,
    matk: 0,
    mdef: 0,
    hnm: false
  }, 'default',
    new Date().getTime()))
  grids: Grid[] = []
  inventoryChanged = new Subject<void>()

  constructor(private http: HttpClient) {
    this.readInventory()
    this.readGrids()
    this.inventoryChanged.asObservable().subscribe(() => this.writeInventory())

    this.grid.asObservable().subscribe(value => {
      if(!this.antGridChange)
        this.antGridChange = value.change$.subscribe(() => this.writeGrids())
      else {
        this.antGridChange.unsubscribe()
        this.antGridChange = value.change$.subscribe(() => this.writeGrids())
      }

    })
  }

  writeInventory() {
    const storage = JSON.stringify(this.inventory)
    if (storage)
      localStorage.setItem('inventory', storage)
  }

  readInventory() {
    const storage = localStorage.getItem('inventory')
    const weapons = storage && JSON.parse(storage)
    let tmp: Weapon[] = []
    if (weapons)
      weapons.forEach((w: Weapon) => {

        tmp.push(this.copyWeapon(w)
        )
      })
    this.inventory = tmp
  }

  set currentGrid(id: number) {
    const found = this.grids.find(g => g.id == id)
    if (found)
      this.grid.next(found)
  }

  writeGrids() {

    let storage: StorageGrid[] = []

    this.grids.forEach((g) => {
      const tmp: StorageGrid = {
          id:g.id,
        _job: g.job,
        _weapons: g._weapons,
        _stats: g.stats,
        supports: g.supports,
        _name: g.name
      }
      storage.push(tmp)
    })
    localStorage.setItem('grid', JSON.stringify(storage))
  }

  addGrid(g: Grid) {
    const exist = this.exist(g)
    if (!exist) {
      this.grids.push(g)
      this.grid.next(g)

    }

  }
  delete(){

    this.grids.forEach(( g, i) =>{
      if(g.id == this.grid.value.id){
        this.grids.splice(i,1)

      }
    })

    this.grid.next(new Grid({
        patk: 0,
        pdef: 0,
        matk: 0,
        mdef: 0,
        hnm: false
      },
      '',
      new Date().getTime()))
    this.grid.value.change.next()

  }
  exist(g: Grid) {
    return this.grids.find(gr => g.id == gr.id)
  }

  readGrids() {
    const storage = localStorage.getItem('grid')
    const gridsStored: StorageGrid[] = storage && JSON.parse(storage)
    let tmp: Grid | undefined
    let weapons: Weapon[] = []

    if (gridsStored) {
      gridsStored.forEach(g => {
        weapons =[]
        g._weapons.forEach(w =>{
          const found = this.findInInventory(w)
          if (found)
              weapons.push(found)
        })
        tmp = new Grid(g._stats, g._name, g.id,g._job)
        tmp._weapons = weapons
        this.grids.push(tmp)

      })
      if (tmp){
        this.grid.next(tmp)
        this.grid.value.change.next()
      }

    }

  }
  findInInventory(w: Weapon): Weapon | undefined{
    const found = this.inventory.find(wp => wp.id == w.id)

    return found

  }

  addToInventory(w: Weapon): boolean {
    const exists = this.inventory.find(wp => wp.name == w.name)
    let result = false
    if (!exists) {
      this.inventory.push(w.clone())
      result = true
      this.inventoryChanged.next()
    }

    return result
  }

  addToGrid(w: Weapon): boolean {

    return this.grid.value.add(w)
  }
  removeFromGrids(w: Weapon){
    this.grid.value.remove(w)
    this.grids.forEach(g => g.remove(w))
  }

  removeFromInventory(w: Weapon): boolean {
    let result = false
    const exists = this.inventory.indexOf(w)
    if (exists != -1) {
      this.inventory.splice(exists, 1)
      result = true
      this.inventoryChanged.next()
    }
    return result
  }

  editFromInventory(w: Weapon): boolean {
    let result = false
    const exists = this.inventory.find(wp => w.id == wp.id)

    if (exists) {
      const index = this.inventory.indexOf(exists)
      this.inventory[index] = w
      this.inventory[index] = this.setSupportSkillLvl(this.inventory[index], w.support.level)
      result = true
      this.inventoryChanged.next()

    }
    return result
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
      const w = this.rawToWeapon(wr)
      tmp.push(w)

    })
    return tmp
  }

  setSupportSkillLvl(weapon: Weapon, lvl: number): Weapon {
    const support = this.boostDefinitions.value.get(weapon.support.name)

    if (support && lvl <= 20) {
      weapon.support.level = lvl
      weapon.support.rate = support.support_skill_tier[weapon.support.tier][lvl - 1].rate || 0
      weapon.support.value = support.support_skill_tier[weapon.support.tier][lvl - 1].value || undefined
    }
    return weapon
  }

  rawToWeapon(wr: WeaponRaw): Weapon {
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
    return new Weapon(wr.id,
      wr.resource_id,
      wr.name,
      wr.type,
      wr.rarity,
      wr.cost,
      wr.attribute,
      wr.evo,
      wr.is_infinite_evo,
      skill,
      support,
      wr.max_patk,
      wr.max_matk,
      wr.max_pdef,
      wr.max_mdef,
      wr.add_patk,
      wr.add_matk,
      wr.add_pdef,
      wr.add_mdef)

  }

  copyWeapon(w: Weapon): Weapon {
    const skill = new Skill(
      w.skill.level,
      w.skill.targets,
      w.skill.skill_name,
      w.skill.sp,
      w.skill.damage,
      w.skill.recover,
      w.skill.patk,
      w.skill.matk,
      w.skill.pdef,
      w.skill.mdef,
      w.skill.weapon
    )
    const support = new SupportSkill(
      w.support.level,
      w.support.name,
      w.support.tier,
      w.support.rate,
      w.support.value
    )
    return new Weapon(
      w.id,
      w.resource_id,
      w.name,
      w.type,
      w.rarity,
      w.cost,
      w.attribute,
      w.evo,
      w.is_infinite_evo,
      skill,
      support,
      w.max_patk,
      w.max_matk,
      w.max_pdef,
      w.max_mdef,
      w.add_patk,
      w.add_matk,
      w.add_pdef,
      w.add_mdef,
      w.lb)
  }
}
