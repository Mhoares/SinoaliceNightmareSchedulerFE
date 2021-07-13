import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', loadChildren: () => import('./nightmares/nightmares.module').then(m => m.NightmaresModule) }, { path: 'ranks', loadChildren: () => import('./ranks/ranks.module').then(m => m.RanksModule) }, { path: 'analyzer', loadChildren: () => import('./analyzer/analyzer.module').then(m => m.AnalyzerModule) }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
