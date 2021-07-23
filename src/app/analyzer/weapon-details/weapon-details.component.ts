import {Component, Input, OnInit} from '@angular/core';
import {SkillResult, Weapon} from "../../shared/weapon.class";
import {AnalyzerService} from "../analyzer.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {BehaviorSubject} from "rxjs";
import {Grid} from "../../shared/grid.class";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-weapon-details',
  templateUrl: './weapon-details.component.html',
  styleUrls: ['./weapon-details.component.sass']
})
export class WeaponDetailsComponent implements OnInit {
  @Input() displayed = new BehaviorSubject<Weapon | undefined>(undefined)
  @Input() currentGrid?:BehaviorSubject<Grid>
  grid?:Grid
  weapon: Weapon|undefined
  skills:FormGroup
  constructor(private service:AnalyzerService, private fb:FormBuilder, private _snackBar: MatSnackBar) {
    this.skills = this.fb.group(
      {skill:[1, [Validators.min(1), Validators.max(20)]],
      support: [1, [Validators.min(1), Validators.max(20)]]}
    )
  }

  ngOnInit(): void {
    this.currentGrid?.asObservable().subscribe(g=>{
      this.grid = g
      if (this.grid.job == undefined)
        this.displayed.next(undefined)

    })
    this.skills.get('skill')?.valueChanges.subscribe(()=>{
      const value = this.skills.get('skill')?.value
      if( this.skills.valid && value && this.weapon ){
        this.weapon.skill.level = value
        this.service.editFromInventory(this.weapon)
        if (this.grid)
            this.grid.change.next()
      }

    })
    this.skills.get('support')?.valueChanges.subscribe(()=>{
      const value = this.skills.get('support')?.value
      if( this.skills.valid && value && this.weapon ){
        this.weapon.support.level = value
        this.service.editFromInventory(this.weapon)
        if (this.grid)
          this.grid.change.next()
      }

    })
    this.displayed?.asObservable().subscribe(w =>{
      this.weapon = w
      this.skills.get('skill')?.setValue(w?.skill.level)
      this.skills.get('support')?.setValue(w?.support.level)
    })

  }
  get skillResult():SkillResult | undefined{
    if(this.grid && !this.grid.supports)
      return this.weapon?.skill.calculate(this.grid?.stats, undefined, this.grid.enemy)
    else if (this.grid)
      return this.weapon?.skill.calculate(this.grid?.stats, this.grid.supportSkills, this.grid.enemy)

    return undefined
  }
  destroy(){
    if(  !this.grid && this.weapon ){
      this.service.removeFromGrids(this.weapon)
      if(this.service.removeFromInventory(this.weapon))
        this._snackBar.open(`${this.weapon.name} has been removed from inventory`, "close", {duration: 5000})

      this.displayed.next(undefined)
    } else if (this.grid && this.weapon && this.grid.remove(this.weapon)){
      this._snackBar.open(`${this.weapon.name} has been removed from this grid`, "close", {duration: 5000})
      this.displayed.next(undefined)
      this.grid.change.next()
    }

  }

}
