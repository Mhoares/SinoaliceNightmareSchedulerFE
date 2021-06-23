import { Component, Input, OnInit } from '@angular/core';
import { Nightmare } from 'src/app/shared/nightmare.model';

@Component({
  selector: 'app-nightmare',
  templateUrl: './nightmare.component.html',
  styleUrls: ['./nightmare.component.sass']
})
export class NightmareComponent implements OnInit {
  @Input() nm : Nightmare | any = null

  constructor() { }

  ngOnInit(): void {
  }

}
