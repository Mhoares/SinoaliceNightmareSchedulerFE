import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {RanksService} from "./ranks.service";
import {Rank} from "../shared/ranks.model";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {Subject} from "rxjs";
import {MatPaginator} from "@angular/material/paginator";
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-ranks',
  templateUrl: './ranks.component.html',
  styleUrls: ['./ranks.component.sass']
})
export class RanksComponent implements OnInit,AfterViewInit {
  @ViewChild(MatSort) sort?: MatSort
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  dataSource?: any
  loaded : Subject<boolean> = new Subject()
  searchForm :FormGroup
  displayedColumns =['trueRank','name','timeslot','wins','losses', 'lifeforce','updated']
  constructor(private service:RanksService, private fb:FormBuilder) {
    this.searchForm =  this.fb.group(
      { name:['']})

  }


  ngAfterViewInit() {
    this.loaded.subscribe(n => {
      this.dataSource.sort = this.sort
      this.dataSource.paginator = this.paginator;
    })
  }

  ngOnInit(): void {
    this.service.getRanks(6,10).subscribe( n =>  {
      this.dataSource =new MatTableDataSource(n.rank)
      this.dataSource.filterPredicate = (data:Rank, filter: string) => {
        return data.name.toLowerCase().includes(filter);
      };
      this.loaded.next(true)

    })
    this.searchForm.get('name')?.valueChanges.subscribe(v => this.filter(this.searchForm.get('name')?.value || ''))
  }
  filter( name :string){
    name = name.trim()
    this.dataSource.filter = name.toLowerCase()
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
