import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NightmaresComponent } from './nightmares.component';

const routes: Routes = [{ path: '', component: NightmaresComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NightmaresRoutingModule { }
