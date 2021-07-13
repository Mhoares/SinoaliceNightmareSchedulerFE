import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnalyzerRoutingModule } from './analyzer-routing.module';
import { AnalyzerComponent } from './analyzer.component';
import { PanelComponent } from './panel/panel.component';
import {SharedModule} from "../shared/shared.module";
import { WeaponDetailsComponent } from './weapon-details/weapon-details.component';
import { InventoryComponent } from './inventory/inventory.component';


@NgModule({
  declarations: [
    AnalyzerComponent,
    PanelComponent,
    WeaponDetailsComponent,
    InventoryComponent
  ],
  imports: [
    CommonModule,
    AnalyzerRoutingModule,
    SharedModule
  ]
})
export class AnalyzerModule { }
