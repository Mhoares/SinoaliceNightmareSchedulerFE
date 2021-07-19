import {Component, Input, OnInit} from '@angular/core';
import {Weapon} from "../../shared/weapon.class";
import {BehaviorSubject, Subject} from "rxjs";
import {Attribute} from "../../shared/nightmare.model";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Weapons} from "../../shared/analyzer.constants";
import {AnalyzerService} from "../analyzer.service";
import {Grid} from "../../shared/grid.class";


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
  @Input()  showAsGrid = false
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

  constructor(private service: AnalyzerService, private fb: FormBuilder) {
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
      if (this.isInventorySelected.value) {
        this.service.addToInventory(w)
        this.filter()

      } else if (this.grid) {
        this.service.addToGrid(w)
        this.filter()

      }
    })
    this.isInventorySelected.subscribe(selected=>{
      if (this.grid && selected)
        this.displayedWeapon.next(undefined)
    })
    if (!this.grid)
      this.service.inventoryChanged.asObservable().subscribe(() => {
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
  }

}
