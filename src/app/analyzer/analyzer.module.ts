import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnalyzerRoutingModule } from './analyzer-routing.module';
import { AnalyzerComponent } from './analyzer.component';
import { PanelComponent } from './panel/panel.component';
import {SharedModule} from "../shared/shared.module";
import { WeaponDetailsComponent } from './weapon-details/weapon-details.component';
import { InventoryComponent } from './inventory/inventory.component';
import { GridAnalyzerComponent } from './grid-analyzer/grid-analyzer.component';
import { GridDetailsComponent } from './grid-details/grid-details.component';
import { WeaponComponent } from './weapon/weapon.component';
import {ChartsModule} from "ng2-charts";
import { ShareGridComponent } from './share-grid/share-grid.component';


@NgModule({
  declarations: [
    AnalyzerComponent,
    PanelComponent,
    WeaponDetailsComponent,
    InventoryComponent,
    GridAnalyzerComponent,
    GridDetailsComponent,
    WeaponComponent,
    ShareGridComponent
  ],
  imports: [
    CommonModule,
    AnalyzerRoutingModule,
    SharedModule,
    ChartsModule
  ]
})
export class AnalyzerModule { }
