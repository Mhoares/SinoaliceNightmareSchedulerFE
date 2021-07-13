import {AnalyzerConstants, Jobs} from "./analyzer.constants";
import {SkillResult, Stats, SupportSkill, Weapon} from "./weapon.class";
import {BehaviorSubject, Subject} from "rxjs";

export class Grid {
  private _skillResult = new BehaviorSubject<SkillResult>({damage: 0, recover: 0, patk: 0, pdef: 0, mdef: 0, matk: 0})
  public _skillResult$ = this._skillResult.asObservable()
  private change = new Subject<void>()
  public change$ = this.change.asObservable()
  public _weapons: Weapon[] = []
  private _enemy?: Stats
  public supports = false

  constructor(private _job: Jobs,
              private _stats: Stats,
              private _name: string) {
    this.change$.subscribe(() => this.calculate())
  }

  public add(weapon: Weapon): boolean {
    let result = false
    const canEquip = AnalyzerConstants.Jobs[this._job].canEquip.indexOf(weapon.type) != -1
    const exist = this._weapons.indexOf(weapon) != -1
    if (!exist && canEquip && this._weapons.length < 20) {
      this._weapons.push(weapon)
      this.change.next()
      result = true
    }
    return result
  }

  public remove(weapon: Weapon): boolean {
    let result = false
    const index = this._weapons.indexOf(weapon)
    if (index != -1) {
      this._weapons.splice(index, 1)
      this.change.next()
      result = true
    }
    return result
  }

  public edit(weapon: Weapon, next: Weapon): boolean {
    let result = false
    const index = this._weapons.indexOf(weapon)
    if (index != -1) {
      this._weapons[index] = next
      this.change.next()
      result = true
    }
    return result
  }

  get supportSkills(): SupportSkill[] {
    return this._weapons.map<SupportSkill>(w => w.support)

  }

  public calculate() :SkillResult {
    const result = this._weapons.reduce<SkillResult>((a, b) => {
      let tmp: SkillResult
      if (this.supports)
        tmp = b.skill.calculate(this._stats, this.supportSkills, this.enemy)
      else
        tmp = b.skill.calculate(this._stats, undefined, this.enemy)
      return {
        damage: a.damage + tmp.damage,
        recover: a.recover + tmp.recover,
        patk: a.patk + tmp.patk,
        pdef: a.pdef + tmp.pdef,
        mdef: a.mdef + tmp.mdef,
        matk: a.matk + tmp.matk
      }
    }, {damage: 0, recover: 0, patk: 0, pdef: 0, mdef: 0, matk: 0})
    this._skillResult.next(result)
    return result
  }

  set job(job: Jobs) {
    const weapon = AnalyzerConstants.Jobs[this._job].default
    const newWeapon = AnalyzerConstants.Jobs[job].default
    const isVG = AnalyzerConstants.VGWeapons.indexOf(weapon) != -1
    const isNewVG = AnalyzerConstants.VGWeapons.indexOf(newWeapon) != -1

    if ((isVG && isNewVG) || (!isVG && !isNewVG)) {
      this._job = job
      this._stats.job = job
    }

  }

  get job(): Jobs {
    return this._job
  }

  set stats(stats: Stats) {
    this._stats = stats
  }

  get stats(): Stats {
    return this._stats
  }

  set enemy(stats: Stats | undefined) {
    this._enemy = stats
  }

  get enemy(): Stats | undefined {
    return this._enemy
  }

  get name(): string {
    return this._name
  }
  get weapon():Weapon[]{
    return this._weapons
  }

  set name(name: string) {
    this._name = name
  }
}
