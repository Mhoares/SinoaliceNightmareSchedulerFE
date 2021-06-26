import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RanksRoutingModule } from './ranks-routing.module';
import { RanksComponent } from './ranks.component';
import {SharedModule} from "../shared/shared.module";


@NgModule({
  declarations: [
    RanksComponent
  ],
  imports: [
    CommonModule,
    RanksRoutingModule,
    SharedModule
  ]
})
export class RanksModule { }
