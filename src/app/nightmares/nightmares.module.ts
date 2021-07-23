import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NightmaresRoutingModule } from './nightmares-routing.module';
import { NightmaresComponent } from './nightmares.component';
import {SharedModule} from "../shared/shared.module";
import { NightmareComponent } from './nightmare/nightmare.component';
import { PanelComponent } from './panel/panel.component';
import { TimeLineComponent } from './time-line/time-line.component';
import { FragmentComponent } from './fragment/fragment.component';






@NgModule({
  declarations: [
    NightmaresComponent,
    NightmareComponent,
    PanelComponent,
    TimeLineComponent,
    FragmentComponent
  ],
  imports: [
    CommonModule,
    NightmaresRoutingModule,
    SharedModule

  ]
})

export class NightmaresModule { }
