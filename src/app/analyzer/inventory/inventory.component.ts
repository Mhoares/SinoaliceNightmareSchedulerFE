import {Component, Input, OnInit} from '@angular/core';
import {SkillResult, Stats, SupportSkill, Weapon} from "../../shared/weapon.class";
import {BehaviorSubject, Subject} from "rxjs";
import {Attribute} from "../../shared/nightmare.model";
import {FormBuilder, FormGroup} from "@angular/forms";
import {AnalyzerConstants, Jobs, Weapons} from "../../shared/analyzer.constants";
import {AnalyzerService} from "../analyzer.service";
import {Grid} from "../../shared/grid.class";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Sort} from "@angular/material/sort";
import {SupportSkillDefinition} from "../../shared/support_skill_definition.model";


@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.sass']
})
export class InventoryComponent implements OnInit {
  @Input() inventory: Weapon[] = []
  @Input() selectedWp: Subject<Weapon> = new Subject<Weapon>()
  @Input() isInventorySelected = new BehaviorSubject<boolean>(true)
  @Input() currentGrid?: BehaviorSubject<Grid>
  @Input() cols = 6
  @Input() showAsGrid = false
  snackbarTime = 5000
  sortState?: Sort
  grid?: Grid
  displayedWeapon = new BehaviorSubject<Weapon | undefined>(undefined)
  visibleWps: Weapon[] = []
  searchForm: FormGroup
  types = ['All',
    Weapons.Orb,
    Weapons.Bow,
    Weapons.Book,
    Weapons.Harp,
    Weapons.Staff,
    Weapons.Pole,
    Weapons.Sword,
    Weapons.Hammer]

  constructor(private service: AnalyzerService, private fb: FormBuilder, private _snackBar: MatSnackBar) {
    this.searchForm = this.fb.group(
      {
        name: [''],
        chkL: [false],
        chkSR: [false],
        chkS: [false],
        chkA: [false],
        chkFire: [false],
        chkWater: [false],
        chkWind: [false],
        type: ['All']
      }
    )

  }

  ngOnInit(): void {
    this.filter()
    this.currentGrid?.asObservable().subscribe(g => {
      this.grid = g
      this.inventory = g._weapons
      this.filter()
      this.displayedWeapon.next(undefined)
      this.grid.change$.subscribe(() => this.filter())

    })

    this.selectedWp.asObservable().subscribe(w => {

      let msg = `${w.name} can't be added`
      if (this.isInventorySelected.value) {
        if (this.service.addToInventory(w))
          msg = `${w.name} has been added`
        this.filter()
        if (this.isInventorySelected.value && !this.grid)
          this._snackBar.open(msg, "close", {
            duration: this.snackbarTime,
            horizontalPosition: 'end',
            verticalPosition: 'bottom'
          })
      } else if (this.grid) {
        if (this.service.addToGrid(w))
          msg = `${w.name} has been added`
        this.filter()
        if (!this.isInventorySelected.value && this.grid && this.currentGrid?.value.job)
          this._snackBar.open(msg, "close", {
            duration: this.snackbarTime,
            horizontalPosition: 'end',
            verticalPosition: 'bottom'
          })
        else if (!this.isInventorySelected.value && this.grid && !this.grid.job) {
          this._snackBar.open(msg + ", please select a job before adding a weapon", "close", {
            duration: this.snackbarTime,
            horizontalPosition: 'end',
            verticalPosition: 'bottom'
          })
        }
      }


    })
    this.isInventorySelected.subscribe(selected => {
      if (this.grid && selected)
        this.displayedWeapon.next(undefined)
    })
    if (!this.grid)
      this.service.inventoryChanged.asObservable().subscribe(() => {
        this.inventory = this.service.inventory
        this.filter()
      })


    this.searchForm.get('name')?.valueChanges.subscribe(() => this.filter())
    this.searchForm.get('type')?.valueChanges.subscribe(() => {
      this.filter()
    })

  }

  reset() {
    this.visibleWps = []
    this.inventory.forEach(w => this.visibleWps.push(w))
  }

  filter() {
    const name = this.searchForm.get('name')
    const chkL = this.searchForm.get('chkL')
    const chkSR = this.searchForm.get('chkSR')
    const chkS = this.searchForm.get('chkS')
    const chkA = this.searchForm.get('chkA')
    const chkFire = this.searchForm.get('chkFire')
    const chkWater = this.searchForm.get('chkWater')
    const chkWind = this.searchForm.get('chkWind')
    const filterType = this.searchForm.get('type')
    let filterRarity: ('S' | 'SR' | 'L' | 'A')[] = []
    let filterAttribute: Attribute[] = []

    this.reset()
    if (name && name.value != '') {
      this.visibleWps = this.visibleWps.filter(w => w.name.toLocaleUpperCase().includes(name.value.toLocaleUpperCase()))
    }
    if (chkL && chkL.value) {
      filterRarity.push("L")
    }
    if (chkSR && chkSR.value) {
      filterRarity.push('SR')
    }
    if (chkS && chkS.value) {
      filterRarity.push('S')
    }
    if (chkA && chkA.value) {
      filterRarity.push('A')
    }
    if (chkFire && chkFire.value) {
      filterAttribute.push(Attribute.Fire)
    }
    if (chkWater && chkWater.value) {
      filterAttribute.push(Attribute.Water)
    }
    if (chkWind && chkWind.value) {
      filterAttribute.push(Attribute.Wind)
    }
    if (filterType && 'All' != filterType.value)
      this.visibleWps = this.visibleWps.filter(w => w.type == filterType.value)

    if (filterRarity.length || filterAttribute.length)
      this.visibleWps = this.visibleWps.filter(w => {
        let isValidRarity = false
        let isValidAttribute = false
        let isValid = true
        if (filterRarity.length) {
          filterRarity.forEach(r => isValidRarity = r == w.rarity || isValidRarity)
          isValid = isValid && isValidRarity
        }
        if (filterAttribute.length) {
          filterAttribute.forEach(a => isValidAttribute = a == w.attribute || isValidAttribute)
          isValid = isValid && isValidAttribute
        }
        return isValid
      })
    if (this.sortState)
      this.sortData(this.sortState)
  }

  selectDisplayed(wp: Weapon) {
    this.displayedWeapon.next(wp)
  }

  sortData(sort: Sort) {
    this.sortState = sort
    let supports: SupportSkill []

    const data = this.visibleWps.slice();

    if (!sort.active || sort.direction === '') {
      this.visibleWps = data;
      return;
    }
    if (this.grid && this.currentGrid?.value.supports)
      supports = this.currentGrid?.value.supportSkills

    if (this.currentGrid)
      this.visibleWps = data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        let AResult: SkillResult = AnalyzerConstants.voidSKillResult
        let BResult: SkillResult = AnalyzerConstants.voidSKillResult

        if (this.currentGrid) {
          AResult = a.skill.calculate(this.currentGrid.value.stats, supports, this.currentGrid.value.enemy)
          BResult = b.skill.calculate(this.currentGrid.value.stats, supports, this.currentGrid.value.enemy)

        }

        switch (sort.active) {
          case 'heal':
            return this.compare(AResult.recover, BResult.recover, isAsc);
          case 'damage':
            return this.compare(AResult.damage, BResult.damage, isAsc);
          case 'P.ATK':
            return this.compare(AResult.patk, BResult.patk, isAsc);
          case 'M.ATK':
            return this.compare(AResult.matk, BResult.matk, isAsc);
          case 'M.DEF':
            return this.compare(AResult.mdef, BResult.mdef, isAsc);
          case 'P.DEF':
            return this.compare(AResult.pdef, BResult.pdef, isAsc);
          case 'Debuff P.ATK':
            return this.compare(AResult.debuff?.patk || 0, BResult.debuff?.patk || 0, isAsc);
          case 'Debuff M.ATK':
            return this.compare(AResult.debuff?.matk || 0, BResult.debuff?.matk || 0, isAsc);
          case 'Debuff M.DEF':
            return this.compare(AResult.debuff?.mdef || 0, BResult.debuff?.mdef || 0, isAsc);
          case 'Debuff P.DEF':
            return this.compare(AResult.debuff?.pdef || 0, BResult.debuff?.pdef || 0, isAsc);
          default:
            return 0;
        }
      });
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  get vg(): boolean {
    const job = this.grid?.job
    const random = AnalyzerConstants.VGWeapons[0]
    if (job) {
      return AnalyzerConstants.Jobs[job].canEquip.indexOf(random) != -1
    }
    return false

  }

  isBufforDebbuff(): boolean {
    return Jobs.Minstrel == this.grid?.job || Jobs.Sorcerer == this.grid?.job
  }

}
