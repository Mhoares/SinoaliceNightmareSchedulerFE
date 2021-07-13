import {AnalyzerConstants, Jobs, Weapons} from "./analyzer.constants";

export class Weapon {

  constructor(
    public id: number,
    public resource_id: number,
    public name: string,
    public type: Weapons,
    public rarity: string,
    public cost: number,
    public attribute: number,
    public evo: number,
    public is_infinite_evo: number,
    public skill: Skill,
    public support: SupportSkill
  ) {
  }

  public clone(): Weapon {
    return new Weapon(
      this.id,
      this.resource_id,
      this.name,
      this.type,
      this.rarity,
      this.cost,
      this.attribute,
      this.evo,
      this.is_infinite_evo,
      this.skill.clone(),
      this.support.clone()
    )
  }
  public toString(): string{
    return `${this.name}
            cost: ${this.cost}
            Skill: ${this.skill.skill_name}
            Aid Skill: ${this.support.name}`
  }
  public getImageURL():string{
    let tmp =''
    if ( this.resource_id/10 < 1){
      tmp+='000'
    }else if (this.resource_id/100 < 1){
      tmp+='00'
    }else if (this.resource_id/1000 < 1){
      tmp+='0'
    }
    return `https://sinoalice.picobin.com/cards/cards${tmp}${this.resource_id}.png`
  }
}

enum MainSkillType {
  dps = 'dps',
  recover = 'recover'
}

export class Skill {

  constructor(
    public level: number,
    public targets: number,
    public skill_name: string,
    public sp: number,
    public damage: number,
    public recover: number,
    public patk: number,
    public matk: number,
    public pdef: number,
    public mdef: number,
    public weapon: Weapons) {
  }

  public clone(): Skill {
    return new Skill(
      this.level,
      this.targets,
      this.skill_name,
      this.sp,
      this.damage,
      this.recover,
      this.patk,
      this.matk,
      this.pdef,
      this.mdef,
      this.weapon
    )
  }

  public mainSkill(type: MainSkillType | ''): number {
    let tmp = 1.0
    let factor = 0.04
    if (type == MainSkillType.dps) {
      factor = 0.025
    } else if (type == MainSkillType.recover) {
      factor = 0.03
    }
    tmp += (factor * this.level) - factor
    if (MainSkillType.dps != type && this.level >= 15) {
      tmp += factor
    }
    if (this.level == 20) {
      tmp += 0.05
    }
    return tmp
  }

  public jobCorrection(job: Jobs, hnm: Boolean): number {
    if (hnm && AnalyzerConstants.Jobs[job].default == this.weapon) {
      return AnalyzerConstants.Jobs[job].HNM.default
    } else if (hnm && AnalyzerConstants.Jobs[job].HNM.exception == this.weapon) {
      return AnalyzerConstants.Jobs[job].noEffect
    } else if (hnm) {
      return AnalyzerConstants.Jobs[job].HNM.any
    }
    if (AnalyzerConstants.Jobs[job].default == this.weapon) {
      return AnalyzerConstants.Jobs[job].normal
    }
    return AnalyzerConstants.Jobs[job].noEffect

  }

  public calculate(self: Stats, supports?: SupportSkill[], enemy?: Stats): SkillResult {
    let tmp: SkillResult = {damage: 0, recover: 0, matk: 0, mdef: 0, patk: 0, pdef: 0}
    let isPhysical = false
    const isDamage = this.damage > 0
    if (isDamage) {
      isPhysical = AnalyzerConstants.PWeapons.indexOf(this.weapon) != -1
      tmp.damage = isPhysical ? self.patk : self.matk
      if (self.combo)
        tmp.damage *= self.combo
      if (enemy) {
        let r = isPhysical ? enemy.pdef : enemy.mdef
        r /= (2 / 3)
        tmp.damage -= r
      }
      tmp.damage *= 0.05 * 0.95 * this.targets
      if (self.job)
        tmp.damage *= this.jobCorrection(self.job, self.hnm)
      tmp.damage *= (this.mainSkill(MainSkillType.dps) * this.damage)
      if (supports)
        tmp.damage = this.applySupport('Dauntless Courage', supports, tmp.damage)

    }
    if (this.recover > 0) {
      tmp.recover = (self.mdef + self.pdef)
      if (self.job)
        tmp.recover *= this.jobCorrection(self.job, self.hnm)
      tmp.recover *= (this.mainSkill(MainSkillType.recover) * this.recover)
      tmp.recover *= 0.05 * this.targets
      if (supports)
        tmp.recover = this.applySupport('Recovery Support', supports, tmp.recover)
    }
    if (this.patk > 0) {
      if (self.job)
        tmp.patk = this.modifier(self.patk, this.patk, self.job, self.hnm)
      tmp.patk *= 0.05 * 0.95 * this.targets
      if (supports)
        tmp.patk = this.applySupport('Support Boon', supports, tmp.patk)
    }
    if (this.pdef) {
      if (self.job)
        tmp.pdef = this.modifier(self.pdef, this.pdef, self.job, self.hnm)
      tmp.pdef *= 0.05 * 0.95 * this.targets
      if (supports)
        tmp.pdef = this.applySupport('Support Boon', supports, tmp.pdef)
    }
    if (this.matk) {
      if (self.job)
        tmp.matk = this.modifier(self.matk, this.matk, self.job, self.hnm)
      tmp.matk *= 0.05 * 0.95 * this.targets
      if (supports)
        tmp.matk = this.applySupport('Support Boon', supports, tmp.matk)
    }
    if (this.mdef) {
      if (self.job)
        tmp.mdef = this.modifier(self.mdef, this.mdef, self.job, self.hnm)
      tmp.mdef *= 0.05 * 0.95 * this.targets
      if (supports)
        tmp.mdef = this.applySupport('Support Boon', supports, tmp.mdef)
    }
    return tmp
  }

  public modifier(tmp: number, skill: number, job: Jobs, hnm: boolean): number {
    tmp *= this.jobCorrection(job, hnm)
    tmp *= (this.mainSkill('') * skill)
    return tmp
  }

  public applySupport(name: string, supports: SupportSkill[], target: number): number {
    const apply = supports.filter(s => s.name == name)
    const total = apply.reduce((a, b) => {
      const value = b.value && 'boost' in b.value && b.value['boost']
      if (value)
        return a + ((1 + (value / 100)) * (1 + (b.rate / 100)))
      return a
    }, 0) || 1

    return target * total
  }
}

export class SupportSkill {

  constructor(public level: number,
              public name: string,
              public tier: string,
              public rate: number,
              public value?: Record<string, number>[]) {
  }
  public clone():SupportSkill{
    return new SupportSkill(
      this.level,
      this.name,
      this.tier,
      this.rate,
      this.value
    )
  }
}

export interface Stats {
  patk: number,
  matk: number,
  pdef: number,
  mdef: number
  job?: Jobs
  hnm: boolean
  combo?: number
}

export interface SkillResult {
  damage: number,
  recover: number,
  patk: number,
  matk: number,
  pdef: number,
  mdef: number

}
