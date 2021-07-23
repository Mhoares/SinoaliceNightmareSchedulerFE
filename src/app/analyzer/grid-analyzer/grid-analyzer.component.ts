import {Component, Input, OnInit} from '@angular/core';
import {SkillResult, Weapon} from "../../shared/weapon.class";
import {BehaviorSubject, Subject} from "rxjs";
import {Grid} from "../../shared/grid.class";
import {AnalyzerConstants, Jobs} from "../../shared/analyzer.constants";
import {FormBuilder, FormGroup} from "@angular/forms";
import {AnalyzerService} from "../analyzer.service";
import {MatSelectChange} from "@angular/material/select";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-grid-analyzer',
  templateUrl: './grid-analyzer.component.html',
  styleUrls: ['./grid-analyzer.component.sass']
})
export class GridAnalyzerComponent implements OnInit {
  skillResult: SkillResult | undefined

  @Input() selectedWp: Subject<Weapon> = new Subject<Weapon>()
  @Input() isInventorySelected = new BehaviorSubject<boolean>(true)
  @Input() currentGrid = new BehaviorSubject<Grid>(new Grid({
      patk: 0,
      pdef: 0,
      matk: 0,
      mdef: 0,
      hnm: false
    },
    '',
    new Date().getTime()))
  inventory :Weapon[] = []
  grid: Grid |undefined
  description: FormGroup
  jobs = [Jobs.Cleric, Jobs.Breaker, Jobs.Crusher, Jobs.Mage, Jobs.Polearm, Jobs.Gunner, Jobs.Sorcerer, Jobs.Minstrel]

  constructor(private fb: FormBuilder, private service: AnalyzerService,  private _snackBar: MatSnackBar) {

    this.description = this.fb.group({
      name: [''],
      job: [this.grid?.job],
      patk: [this.grid?.stats.patk],
      pdef: [this.grid?.stats.pdef],
      matk: [this.grid?.stats.matk],
      mdef: [this.grid?.stats.mdef],
      hnm: [false],
      grid:['']
    })

  }

  ngOnInit(): void {
    this.currentGrid.asObservable().subscribe(g =>{
      this.grid = g
      this.grid._skillResult$.subscribe(skr => this.skillResult = skr)
      this.initForm()

    })


    this.description.get('name')?.valueChanges.subscribe(() => {
      const value = this.description.get('name')?.value
      if (value && this.grid) {
        this.grid.name = value
      }


    })
    this.description.get('job')?.valueChanges.subscribe(() => {
      const value = this.description.get('job')?.value
      if (value && this.grid) {
        this.grid.job = value
        this.grid.change.next()
        if(this.grid.job != value && this.grid._weapons.length){
          this._snackBar.open(`${this.currentGrid.value.job} can't be changed to ${value}`, "close", {duration: 5000})
          this.description.get('job')?.setValue(this.grid.job)
        }
      }
    })
    this.description.get('patk')?.valueChanges.subscribe(() => {
      const value = this.description.get('patk')?.value
      if (value && this.grid) {
        this.grid.stats.patk = value
        this.grid.change.next()
      }
    })
    this.description.get('matk')?.valueChanges.subscribe(() => {
      const value = this.description.get('matk')?.value
      if (value && this.grid) {
        this.grid.stats.matk = value
        this.grid.change.next()
      }
    })
    this.description.get('mdef') ?.valueChanges.subscribe(() => {
      const value = this.description.get('mdef')?.value
      if (value && this.grid) {
        this.grid.stats.mdef = value
        this.grid.change.next()
      }
    })
      this.description.get('pdef') ?.valueChanges.subscribe(() => {
        const value = this.description.get('pdef')?.value
        if (value && this.grid) {
          this.grid.stats.pdef = value
          this.grid.change.next()
        }
      })
        this.description.get('hnm')?.valueChanges.subscribe(() => {
          const value = this.description.get('hnm')?.value
          if (value!=null && value!=undefined && this.grid) {
            this.grid.stats.hnm = value
            this.grid.change.next()
          }
        })

  }
  initForm(){
    this.description.get('grid')?.setValue(this.grid?.name)
    this.description.get('name')?.setValue(this.grid?.name)
    this.description.get('job')?.setValue(this.grid?.job)
    this.description.get('patk')?.setValue(this.grid?.stats.patk)
    this.description.get('matk')?.setValue(this.grid?.stats.matk)
    this.description.get('mdef')?.setValue(this.grid?.stats.mdef)
    this.description.get('pdef')?.setValue(this.grid?.stats.pdef)
    this.description.get('hnm')?.setValue(this.grid?.stats.hnm)
  }
  get grids() : Grid[]{
    return this.service.grids
  }
  reset(){
    this._snackBar.open(`${this.currentGrid.value.name} has been removed`, "close", {duration: 5000})
    this.service.delete()

  }
  save(){
    if (this.grid)
      this.service.addGrid(this.grid)
    this._snackBar.open(`${this.currentGrid.value.name} has been saved`, "close", {duration: 5000})

  }
  exist():Grid | undefined{
    if (this.grid)
      return this.service.exist(this.grid)
    return undefined
  }

  add(){
    this.service.addGrid(new Grid({
          patk: 0,
          pdef: 0,
          matk: 0,
          mdef: 0,
          hnm: false
        },
        "New Grid",
      new Date().getTime()))
    this._snackBar.open(`${this.currentGrid.value.name} has been added`, "close", {duration: 5000})
  }

  setGrid(selected: MatSelectChange){
    this.service.currentGrid = selected.value
  }

}
