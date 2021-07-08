import { Component, Input, OnInit } from '@angular/core';
import {copyNightmare, Nightmare, Rarity, Attribute} from 'src/app/shared/nightmare.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import {Subject} from "rxjs";
@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.sass']
})
export class PanelComponent implements OnInit {
  @Input() nms: Nightmare[] =[]
  @Input()selectedNm: Subject<Nightmare> = new Subject<Nightmare>()
  visibleNms: Nightmare[] = []
  searchForm :FormGroup
  constructor(private fb:FormBuilder) {
    this.searchForm =  this.fb.group(
      { name:[''],
        chkL:[false],
        chkSR:[false],
        chkS:[false],
        chkA:[false],
        chkFire:[false],
        chkWater:[false],
        chkWind:[false],
        chkGlobal:[true],
        chkJP:[false]

      }
    )
  }

  ngOnInit(): void {
   this.filter()
    this.searchForm.get('name')?.valueChanges.subscribe(() =>this.filter())
  }
  resetNms(){
    this.visibleNms = []
    this.nms.forEach(nm =>{
      this.visibleNms.push(copyNightmare(nm))
    })
  }
  selected(nm :Nightmare){
    this.selectedNm.next(copyNightmare(nm))
  }
  filter(){
    const name = this.searchForm.get('name')
    const chkL = this.searchForm.get('chkL')
    const chkSR = this.searchForm.get('chkSR')
    const chkS = this.searchForm.get('chkS')
    const chkA = this.searchForm.get('chkA')
    const chkFire = this.searchForm.get('chkFire')
    const chkWater = this.searchForm.get('chkWater')
    const chkWind = this.searchForm.get('chkWind')
    const chkGlobal = this.searchForm.get('chkGlobal')
    const chkJP = this.searchForm.get('chkJP')
    let filterRarity : Rarity[] =[]
    let filterAttribute : Attribute[] =[]
    let filterRegion: boolean[] = []
    this.resetNms()
    if (name && name.value!='' ){
      this.visibleNms = this.visibleNms.filter(nm => nm.NameEN.toLocaleUpperCase().includes(name.value.toLocaleUpperCase()))
    }
    if (chkL && chkL.value ){
      filterRarity.push( Rarity.L )
    }
    if (chkSR && chkSR.value ){
      filterRarity.push( Rarity.SR )
    }
    if (chkS && chkS.value ){
      filterRarity.push(Rarity.S )
    }
    if (chkA && chkA.value ){
      filterRarity.push( Rarity.A )
    }
    if (chkFire && chkFire.value ){
      filterAttribute.push( Attribute.Fire )
    }
    if (chkWater && chkWater.value ){
      filterAttribute.push(Attribute.Water )
    }
    if (chkWind && chkWind.value ){
      filterAttribute.push( Attribute.Wind )
    }
    if (chkGlobal && chkGlobal.value ){
      filterRegion.push( true)
    }
    if (chkJP && chkJP.value ){
      filterRegion.push( false)
    }
    if (filterRarity.length || filterAttribute.length || filterRegion.length)
    this.visibleNms = this.visibleNms.filter(nm => {
      let isValidRarity = false
      let isValidAttribute = false
      let isValidRegion = false
      let isValid = true
      if(filterRarity.length) {
        filterRarity.forEach(r => isValidRarity = r == nm.Rarity|| isValidRarity)
        isValid = isValid && isValidRarity
      }
      if(filterAttribute.length) {
        filterAttribute.forEach(a => isValidAttribute = a == nm.Attribute|| isValidAttribute)
        isValid = isValid && isValidAttribute
      }
      if(filterRegion.length) {
        filterRegion.forEach(a => isValidRegion = a == nm.Global || isValidRegion)
        isValid = isValid && isValidRegion
      }
      return isValid
    })
  }

}
