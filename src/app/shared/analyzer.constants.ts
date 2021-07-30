export class AnalyzerConstants {
  static get VGWeapons() {
    return [Weapons.Bow, Weapons.Sword, Weapons.Pole, Weapons.Hammer]
  }

  static get PWeapons() {
    return [Weapons.Sword, Weapons.Hammer]
  }

  static get MWeapons() {
    return [Weapons.Bow, Weapons.Pole, Weapons.Orb]
  }

  static get RGWeapons() {
    return [Weapons.Staff, Weapons.Harp, Weapons.Book, Weapons.Orb]
  }

  static get AidSKills() {
    return [AidSkill.ArmorRepair
      , AidSkill.BarrierDeployment
      , AidSkill.BladeDeployment
      , AidSkill.DauntlessCourage
      , AidSkill.ReplenishMagic
      , AidSkill.SupportBoon
      , AidSkill.RecoverySupport
      , AidSkill.DestroyArmor
      , AidSkill.DestroyWeapon
      , AidSkill.IronShieldDeployment
      , AidSkill.WeaponRepair
      , AidSkill.DeploySquareFormation
    ]
  }
  static get AssistanceSKills() {
    return [AidSkill.ArmorRepair
      , AidSkill.BarrierDeployment
      , AidSkill.BladeDeployment
      , AidSkill.DestroyArmor
      , AidSkill.DestroyWeapon
      , AidSkill.IronShieldDeployment
      , AidSkill.WeaponRepair
      , AidSkill.DeploySquareFormation
    ]
  }
  static get AssistanceDebuffSKills() {
    return [AidSkill.DestroyArmor
      , AidSkill.DestroyWeapon
    ]
  }

  static get voidSKillResult() {
    return {
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
    }
  }

  static get Jobs() {
    return {
      'Breaker': {
        'default': Weapons.Sword,
        'canEquip': this.VGWeapons,
        'HNM': {
          'default': 1.35,
          'exception': Weapons.Pole,
          'any': 0.25
        },
        'normal': 1.1,
        'noEffect': 1
      },
      'Crusher': {
        'default': Weapons.Hammer,
        'canEquip': this.VGWeapons,
        'HNM': {
          'default': 1.35,
          'exception': Weapons.Bow,
          'any': 0.25
        },
        'normal': 1.1,
        'noEffect': 1
      },
      'Gunner': {
        'default': Weapons.Bow,
        'canEquip': this.VGWeapons,
        'HNM': {
          'default': 1.35,
          'exception': Weapons.Hammer,
          'any': 0.25
        },
        'normal': 1.1,
        'noEffect': 1
      },
      'Polearm': {
        'default': Weapons.Pole,
        'canEquip': this.VGWeapons,
        'HNM': {
          'default': 1.35,
          'exception': Weapons.Sword,
          'any': 0.25
        },
        'normal': 1.1,
        'noEffect': 1
      },
      'Cleric': {
        'default': Weapons.Staff,
        'canEquip': this.RGWeapons,
        'HNM': {
          'default': 1.35,
          'exception': Weapons.Orb,
          'any': 0.25
        },
        'normal': 1.1,
        'noEffect': 1
      },
      'Sorcerer': {
        'default': Weapons.Book,
        'canEquip': this.RGWeapons,
        'HNM': {
          'default': 1.15,
          'exception': Weapons.Orb,
          'any': 0.25
        },
        'normal': 1.1,
        'noEffect': 1
      },
      'Minstrel': {
        'default': Weapons.Harp,
        'canEquip': this.RGWeapons,
        'HNM': {
          'default': 1.15,
          'exception': Weapons.Orb,
          'any': 0.25
        },
        'normal': 1.1,
        'noEffect': 1
      },
      'Mage': {
        'default': Weapons.Orb,
        'canEquip': this.RGWeapons,
        'HNM': {
          'default': 1.35,
          'exception': '',
          'any': 1
        },
        'normal': 1.1,
        'noEffect': 1
      },
    }
  }
}

export enum Weapons {
  Bow = 'Bow',
  Hammer = 'Hammer',
  Book = 'Book',
  Sword = 'Sword',
  Orb = 'Orb',
  Staff = 'Staff',
  Harp = 'Harp',
  Pole = 'Pole'
}

export enum AidSkill {
  ReplenishMagic = "Replenish Magic",
  DauntlessCourage = 'Dauntless Courage',
  RecoverySupport = 'Recovery Support',
  SupportBoon = 'Support Boon',
  BladeDeployment = 'Blade Deployment',
  BarrierDeployment = 'Barrier Deployment',
  IronShieldDeployment = 'Iron Shield Deployment',
  ArmorRepair = 'Armor Repair',
  DestroyArmor = 'Destroy Armor',
  DestroyWeapon = 'Destroy Weapon',
  WeaponRepair = 'Weapon Repair',
  DeploySquareFormation = 'Deploy Square Formation'
}

export enum Jobs {
  Gunner = 'Gunner',
  Crusher = 'Crusher',
  Sorcerer = 'Sorcerer',
  Breaker = 'Breaker',
  Mage = 'Mage',
  Cleric = 'Cleric',
  Minstrel = 'Minstrel',
  Polearm = 'Polearm'
}

