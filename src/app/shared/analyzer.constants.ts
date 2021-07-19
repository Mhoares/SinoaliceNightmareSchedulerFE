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

