import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {RanksService} from "./ranks.service";
import {Rank} from "../shared/ranks.model";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {Subject} from "rxjs";
import {MatPaginator} from "@angular/material/paginator";
import {FormBuilder, FormGroup} from "@angular/forms";
import {variable} from "@angular/compiler/src/output/output_ast";

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
  filters = new Map<string, string>()
  timeslots=['All','1','2','3','4','5','6','7','8','9','10','11','12','13']
  displayedColumns =['trueRank','name','timeslot','wins','losses', 'lifeforce','updated']
  constructor(private service:RanksService, private fb:FormBuilder) {
    this.searchForm =  this.fb.group(
      { name:[''],
      timeslot:['All']},)

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
        const matchFilter:Boolean[] = [true];
        const filters = new Map<string, string> (JSON.parse(filter))
        filters.forEach((value:string, key:string) =>{
          if (key === 'name')
            matchFilter.push( data.name.toLowerCase().includes(value))
          if(value!='all' && key === 'timeslot')
            matchFilter.push(data.timeslot === Number(value))
        })
        return matchFilter.every(Boolean);
      };
      this.loaded.next(true)
    })
    this.searchForm.get('name')?.valueChanges
      .subscribe(v => this.filter('name',this.searchForm.get('name')?.value || ''))
    this.searchForm.get('timeslot')?.valueChanges
      .subscribe(v => this.filter('timeslot',this.searchForm.get('timeslot')?.value || ''))
  }
  filter( id:string ,value :string){
    value = value.trim().toLowerCase()
    this.filters.set(id,value)
    this.dataSource.filter = JSON.stringify(Array.from(this.filters.entries()))
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }



}
