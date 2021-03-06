import {AnalyzerConstants, Jobs, Weapons} from "./analyzer.constants";
import {SkillResult, Stats, SupportSkill, Weapon} from "./weapon.class";
import {BehaviorSubject, Subject} from "rxjs";
import {Attribute} from "./nightmare.model";

export class Grid {
  private _skillResult = new BehaviorSubject<SkillResult>({damage: 0, recover: 0, patk: 0, pdef: 0, mdef: 0, matk: 0})
  public _skillResult$ = this._skillResult.asObservable()
  public elements = new BehaviorSubject<Map<Attribute, {
    result: SkillResult,
    weapons: Weapon[]
  }>>(new Map<Attribute, {
    result: SkillResult,
    weapons: Weapon[]
  }>())
  public change = new Subject<void>()
  public change$ = this.change.asObservable()
  public _weapons: Weapon[] = []
  private _enemy?: Stats
  public supports = false

  constructor(
    private _stats: Stats,
    private _name: string,
    public id: number,
    private _job?: Jobs,
    public isOwner = true
  ) {
    this.change$.subscribe(() => {
      this.calculate()
      this.calculateByElements()
    })
  }

  public add(weapon: Weapon): boolean {
    let result = false
    if (!this._job)
      return false
    const canEquip = AnalyzerConstants.Jobs[this._job].canEquip.indexOf(weapon.type) != -1
    const exist = this._weapons.find(w => w.name == weapon.name)
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

  get dauntlessCourage() {
    return this.getSupportSkillDetails('Dauntless Courage')
  }

  get recoverySupport() {
    return this.getSupportSkillDetails("Recovery Support")
  }

  get supportBoon() {
    const sb = this.supportSkills.filter(s => s.name == "Support Boon")
    const tiers = new Set<string>()
    let tmp = new Map<string, DetailsSupport>()
    sb.forEach(s => {
      tiers.add(s.tier)
    })
    tiers.forEach(
      t => {
        let i = 0
        let boost = 0
        sb.forEach(s => {
          if (t == s.tier) {
            const value = s.value && 'boost' in s.value && s.value['boost']
            i++
            if (value)
              boost += ((s.rate / 100) * (value / 100))
          }
        })
        tmp.set(t, {
          name: 'Support Boon',
          boost: boost * 100,
          quantity: i,
          tier: t
        })
      }
    )
    return tmp

  }

  getSupportSkillDetails(name: string) {
    const sb = this.supportSkills.filter(s => s.name == name)
    const tiers = new Set<string>()
    let tmp = new Map<string, DetailsSupport>()
    sb.forEach(s => {
      tiers.add(s.tier)
    })
    tiers.forEach(
      t => {
        let i = 0
        let boost = 0
        sb.forEach(s => {
          if (t == s.tier) {
            const value = s.value && 'boost' in s.value && s.value['boost']
            i++
            if (value)
              boost += ((s.rate / 100) * (value / 100))
          }
        })
        tmp.set(t, {
          name: name,
          boost: boost * 100,
          quantity: i,
          tier: t
        })
      }
    )
    return tmp
  }

  public calculateBurst(attribute?: Attribute): SkillResult {
    let target = this._weapons
    let total = AnalyzerConstants.voidSKillResult
    if (attribute) {
      target = this._weapons.filter(w => w.attribute == attribute)
    }
    const result = target.reduce<SkillResult>((a, b) => {
      let tmp: SkillResult
      if (this.supports)
        tmp = b.skill.calculateBurst(this._stats, this.supportSkills, this.enemy)
      else
        tmp = b.skill.calculateBurst(this._stats, undefined, this.enemy)
      if (tmp.damage)
        total.damage++
      if (tmp.recover)
        total.recover++
      if (tmp.patk)
        total.patk++
      if (tmp.matk)
        total.matk++
      if (tmp.mdef)
        total.mdef++
      if (tmp.pdef)
        total.pdef++
      if (tmp.debuff && total.debuff) {
        if (tmp.debuff.patk)
          total.debuff.patk++
        if (tmp.debuff.matk)
          total.debuff.matk++
        if (tmp.debuff.mdef)
          total.debuff.mdef++
        if (tmp.debuff.pdef)
          total.debuff.pdef++
      }

      return {
        damage: a.damage + tmp.damage,
        recover: a.recover + tmp.recover,
        patk: a.patk + tmp.patk,
        pdef: a.pdef + tmp.pdef,
        mdef: a.mdef + tmp.mdef,
        matk: a.matk + tmp.matk,
        debuff: {
          patk: (a.debuff?.patk || 0) + (tmp.debuff?.patk || 0),
          pdef: (a.debuff?.pdef || 0) + (tmp.debuff?.pdef || 0),
          mdef: (a.debuff?.mdef || 0) + (tmp.debuff?.mdef || 0),
          matk: (a.debuff?.matk || 0) + (tmp.debuff?.matk || 0)
        }
      }
    }, {
      damage: 0,
      recover: 0,
      patk: 0,
      pdef: 0,
      mdef: 0,
      matk: 0,
      debuff: {
        patk: 0,
        pdef: 0,
        mdef: 0,
        matk: 0
      }
    })
    return this.AVG(result, total, attribute)
  }

  getTotalBuffandDebuff(): number {
    let tmp = 0
    tmp = this._skillResult.value.patk
    tmp += this._skillResult.value.matk
    tmp += this._skillResult.value.pdef
    tmp += this._skillResult.value.mdef
    if (this._skillResult.value.debuff) {
      tmp += this._skillResult.value.debuff.patk
      tmp += this._skillResult.value.debuff.matk
      tmp += this._skillResult.value.debuff.pdef
      tmp += this._skillResult.value.debuff.mdef
    }
    return tmp

  }

  AVG(x: SkillResult, total: SkillResult, attribute?: Attribute): SkillResult {
    const totalBuffandDebuff = this.getTotalBuffandDebuff()
    const factor = 1
    let target: SkillResult | undefined = this._skillResult.value
    let weight = {
      damage: 1,
      recover: 1,
      patk: 1,
      pdef: 1,
      mdef: 1,
      matk: 1,
      debuff: {
        patk: 1,
        pdef: 1,
        mdef: 1,
        matk: 1
      }
    }

    if (attribute)
      target = this.elements.value.get(attribute)?.result

    if (target) {
      weight.recover = target.recover / this._skillResult.value.recover || 1
      weight.damage = target.damage / this._skillResult.value.damage || 1
      weight.patk = (target.patk / totalBuffandDebuff || 1) * factor
      weight.matk = (target.matk / totalBuffandDebuff || 1) * factor
      weight.pdef = (target.pdef / totalBuffandDebuff || 1) * factor
      weight.mdef = (target.mdef / totalBuffandDebuff || 1) * factor
      if (target.debuff) {
        weight.debuff.patk = (target.debuff.patk / totalBuffandDebuff || 1) * factor
        weight.debuff.matk = (target.debuff.matk / totalBuffandDebuff || 1) * factor
        weight.debuff.pdef = (target.debuff.pdef / totalBuffandDebuff || 1) * factor
        weight.debuff.mdef = (target.debuff.mdef / totalBuffandDebuff || 1) * factor
      }

    }


    x.recover /= (total.recover * (1 / weight.recover)) || 1
    x.damage /= (total.damage * (1 / weight.damage)) || 1
    x.pdef /= (total.pdef * (1 / weight.pdef)) || 1
    x.mdef /= (total.mdef * (1 / weight.mdef)) || 1
    x.patk /= (total.patk * (1 / weight.patk)) || 1
    x.matk /= (total.matk * (1 / weight.matk)) || 1
    if (x.debuff && total.debuff) {
      x.debuff.pdef /= (total.debuff.pdef * (1 / weight.debuff.pdef)) || 1
      x.debuff.mdef /= (total.debuff.mdef * (1 / weight.debuff.mdef)) || 1
      x.debuff.patk /= (total.debuff.patk * (1 / weight.debuff.patk)) || 1
      x.debuff.matk /= (total.debuff.matk * (1 / weight.debuff.matk)) || 1
    }
    return x
  }

  calculateByElements() {
    let tmp = new Map<Attribute, { result: SkillResult, weapons: Weapon[] }>()
    tmp.set(Attribute.Fire, {result: this.calculate(Attribute.Fire), weapons: this.getWeaponsByElement(Attribute.Fire)})
    tmp.set(Attribute.Wind, {result: this.calculate(Attribute.Wind), weapons: this.getWeaponsByElement(Attribute.Wind)})
    tmp.set(Attribute.Water, {
      result: this.calculate(Attribute.Water),
      weapons: this.getWeaponsByElement(Attribute.Water)
    })
    this.elements.next(tmp)
  }

  public calculate(attributte?: Attribute): SkillResult {
    let target = this._weapons
    if (attributte) {
      target = this._weapons.filter(w => w.attribute == attributte)
    }
    const result = target.reduce<SkillResult>((a, b) => {
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
        matk: a.matk + tmp.matk,
        debuff: {
          patk: (a.debuff?.patk || 0) + (tmp.debuff?.patk || 0),
          pdef: (a.debuff?.pdef || 0) + (tmp.debuff?.pdef || 0),
          mdef: (a.debuff?.mdef || 0) + (tmp.debuff?.mdef || 0),
          matk: (a.debuff?.matk || 0) + (tmp.debuff?.matk || 0)
        }
      }
    }, {
      damage: 0,
      recover: 0,
      patk: 0,
      pdef: 0,
      mdef: 0,
      matk: 0,
      debuff: {
        patk: 0,
        pdef: 0,
        mdef: 0,
        matk: 0
      }
    })
    if (!attributte)
      this._skillResult.next(result)
    return result
  }

  set job(job: Jobs | undefined) {
    if (job && this._job) {
      const weapon = AnalyzerConstants.Jobs[this._job].default
      const newWeapon = AnalyzerConstants.Jobs[job].default
      const isVG = AnalyzerConstants.VGWeapons.indexOf(weapon) != -1
      const isNewVG = AnalyzerConstants.VGWeapons.indexOf(newWeapon) != -1

      if ((isVG && isNewVG) || (!isVG && !isNewVG)) {
        this._job = job
        this._stats.job = job
      }
    } else if (!this._job) {
      this._job = job
      this._stats.job = job
    }
  }

  calculateAssistanceSkills(): SkillResult {
    let tmp: SkillResult = AnalyzerConstants.voidSKillResult
    let targets = this.countWeaponsByType(Weapons.Book) + this.countWeaponsByType(Weapons.Harp)
    this._weapons.forEach(w => {
        const supp = w.support
        if (AnalyzerConstants.AssistanceSKills.includes(supp.name)
          && AnalyzerConstants.AssistanceDebuffSKills.includes(supp.name)) {
          const patk = supp.value && 'P.Atk' in supp.value && supp.value['P.Atk']
          const matk = supp.value && 'M.Atk' in supp.value && supp.value['M.Atk']
          const mdef = supp.value && 'M.Def' in supp.value && supp.value['M.Def']
          const pdef = supp.value && 'P.Def' in supp.value && supp.value['P.Def']
          if (patk && tmp.debuff)
            tmp.debuff.patk += this.stats.patk * patk * this.calculateCorrectionSkill(supp.level) * (targets * (supp.rate / 100)) * 0.625 * 0.05
          if (matk && tmp.debuff)
            tmp.debuff.matk += this.stats.matk * matk * this.calculateCorrectionSkill(supp.level) * (targets * (supp.rate / 100)) * 0.625 * 0.05
          if (mdef && tmp.debuff)
            tmp.debuff.mdef += this.stats.mdef * mdef * this.calculateCorrectionSkill(supp.level) * (targets * (supp.rate / 100)) * 0.625 * 0.05
          if (pdef && tmp.debuff)
            tmp.debuff.pdef += this.stats.pdef * pdef * this.calculateCorrectionSkill(supp.level) * (targets * (supp.rate / 100)) * 0.625 * 0.05

        } else if (AnalyzerConstants.AssistanceSKills.includes(supp.name)) {
          const patk = supp.value && 'P.Atk' in supp.value && supp.value['P.Atk']
          const matk = supp.value && 'M.Atk' in supp.value && supp.value['M.Atk']
          const mdef = supp.value && 'M.Def' in supp.value && supp.value['M.Def']
          const pdef = supp.value && 'P.Def' in supp.value && supp.value['P.Def']
          if (patk)
            tmp.patk += this.stats.patk * patk * this.calculateCorrectionSkill(supp.level) * (targets * (supp.rate / 100)) * 0.6250 * 0.05
          if (matk)
            tmp.matk += this.stats.matk * matk * this.calculateCorrectionSkill(supp.level) * (targets * (supp.rate / 100)) * 0.625 * 0.05
          if (mdef)
            tmp.mdef += this.stats.mdef * mdef * this.calculateCorrectionSkill(supp.level) * (targets * (supp.rate / 100)) * 0.625 * 0.05
          if (pdef)
            tmp.pdef += this.stats.pdef * pdef * this.calculateCorrectionSkill(supp.level) * (targets * (supp.rate / 100)) * 0.625 * 0.05
        }
      }
    )
    return tmp
  }

  countWeaponsByType(type: Weapons): number {
    const weaponsType = this._weapons.filter(w => w.type == type)
    return weaponsType.length
  }

  calculateCorrectionSkill(SLv: number): number {
    let bonus = 0

    if (SLv >= 15) {
      bonus += 0.04
    }
    if (SLv == 20) {
      bonus += 0.05
    }
    return 1 + ((SLv - 1) * 0.04) + bonus
  }


  getWeaponsByElement(a: Attribute): Weapon[] {
    return this._weapons.filter(w => w.attribute == a)
  }

  get job(): Jobs | undefined {
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

  get weapon(): Weapon[] {
    return this._weapons
  }

  set name(name: string) {
    this._name = name
  }
}

export interface StorageGrid {
  id: number
  _weapons: Weapon[]
  _enemy?: Stats
  supports: boolean
  _stats: Stats
  _name: string
  _job?: Jobs
}

export interface DetailsSupport {
  quantity: number,
  boost: number,
  name: string,
  tier: string
}

export interface ElementChartParameters {
  weapons?: boolean,
  patk?: boolean,
  pdef?: boolean,
  mdef?: boolean,
  matk?: boolean,
  debuff?: boolean,
}

export interface RemoteGrid {
  webContentLink: string
  isOwner: Boolean
  alias: string
  aliasID: number
  fileID: string
  currentBody?: StorageGrid[]
  chkSum?: string
}

export interface StoredRemoteGrid {
  webContentLink: string
  alias: string
  aliasID: number
  fileID: string
}


