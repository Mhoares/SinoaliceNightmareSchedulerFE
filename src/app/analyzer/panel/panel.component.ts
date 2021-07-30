import {Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject, Subject} from "rxjs";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Weapon} from "../../shared/weapon.class";
import {Attribute, Rarity} from "../../shared/nightmare.model";
import {Weapons} from "../../shared/analyzer.constants";
import {AnalyzerService} from "../analyzer.service";

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.sass']
})
export class PanelComponent implements OnInit {
  @Input() catalog: Weapon[] = []
  @Input() inventory: Weapon[] = []
  @Input() selectedWp: Subject<Weapon> = new Subject<Weapon>()
  @Input() isInventorySelected = new BehaviorSubject<boolean>(true)
  wps: Weapon[] = []
  visibleWps: Weapon[] = []
  searchForm: FormGroup
  title = 'Weapons'
  types = ['All',
    Weapons.Orb,
    Weapons.Bow,
    Weapons.Book,
    Weapons.Harp,
    Weapons.Staff,
    Weapons.Pole,
    Weapons.Sword,
    Weapons.Hammer]

  constructor(private fb: FormBuilder, private service:AnalyzerService) {
    this.searchForm = this.fb.group(
      {
        name: [''],
        chkL: [true],
        chkSR: [false],
        chkS: [false],
        chkA: [false],
        chkFire: [false],
        chkWater: [false],
        chkWind: [false],
        type: ['Pole']
      }
    )

  }

  ngOnInit(): void {
    this.wps = this.catalog
    this.filter()
    this.isInventorySelected.subscribe(selected => {
      if (selected) {
        this.wps = this.catalog
        this.title = 'Weapons'
        this.filter()
      } else {
        this.wps = this.inventory
        this.title = 'Inventory'
        this.filter()
      }
    })
    this.searchForm.get('name')?.valueChanges.subscribe(() => this.filter())
    this.searchForm.get('type')?.valueChanges.subscribe(() => {
      this.filter()
    })
  }


  reset() {
    this.visibleWps = []
    this.wps.forEach(w => this.visibleWps.push(w))
  }
  isChosen( weapon :Weapon):boolean{
    if(this.isInventorySelected.value){
      return this.inventory.find(wp => weapon.id == wp.id)!= undefined
    }else{
      return this.service.grid.value._weapons.find(wp => wp.id == weapon.id) !=undefined
    }
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
    if(filterType && 'All' != filterType.value)
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
  selectWeapon(wp:Weapon){
    this.selectedWp.next(wp)
  }

}
