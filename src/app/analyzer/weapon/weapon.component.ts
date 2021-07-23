import {Component, Input, OnInit} from '@angular/core';
import {Weapon} from "../../shared/weapon.class";

@Component({
  selector: 'app-weapon',
  templateUrl: './weapon.component.html',
  styleUrls: ['./weapon.component.sass']
})
export class WeaponComponent implements OnInit {
  @Input()wp?:Weapon
  constructor() { }

  ngOnInit(): void {
  }

}
