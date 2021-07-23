import {Component, OnInit} from '@angular/core';
import {ShareGridService} from "../share-grid.service";
import {AnalyzerService} from "../analyzer.service";
import {Grid} from "../../shared/grid.class";

@Component({
  selector: 'app-share-grid',
  templateUrl: './share-grid.component.html',
  styleUrls: ['./share-grid.component.sass']
})
export class ShareGridComponent implements OnInit {
  id = ""
  alias: string = ""
  hasAlias = false
  loadingLink = false;
  user =""

  constructor(private service: ShareGridService, private analyzer: AnalyzerService) {
  }

  ngOnInit(): void {


  }

  get grids(): Grid[] {
    return this.analyzer.grids
  }

  get shareID(): string | undefined {
    return ""
  }

  async getShareGrids() {

    return ""

  }

  shareGrids() {



  }

  importGrids(){

  }

}
