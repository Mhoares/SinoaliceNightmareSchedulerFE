import {Component, Input, OnInit} from '@angular/core';
import {AnalyzerService} from "./analyzer.service";
import {SupportSkillDefinition} from "../shared/support_skill_definition.model";
import {Jobs} from "../shared/analyzer.constants";
import {Weapon} from "../shared/weapon.class";
import {BehaviorSubject, Subject} from "rxjs";
import {MatTabChangeEvent} from "@angular/material/tabs";
import {Grid} from "../shared/grid.class";

@Component({
  selector: 'app-analyzer',
  templateUrl: './analyzer.component.html',
  styleUrls: ['./analyzer.component.sass']
})
export class AnalyzerComponent implements OnInit {
  load: boolean = false
  isInventorySelected = new BehaviorSubject<boolean>(true)
  wps: Weapon[] =[]
  catalog:Weapon[]=[]
  get inventory():Weapon[]{
    return this.service.inventory
  }
  get grid(){
    return this.service.grid
  }
  selectedWp: Subject<Weapon> = new Subject<Weapon>()
  constructor(private service: AnalyzerService) {
    this.service.getWeapons().then(
      w =>{
        this.wps = w
        this.catalog = this.wps
        this.load = true
      }
    )
  }

  ngOnInit(): void {


  }
  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.isInventorySelected.next(tabChangeEvent.index != 1)
  }


}
