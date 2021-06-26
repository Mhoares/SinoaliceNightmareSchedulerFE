import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Ranks} from "../shared/ranks.model";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RanksService {

  constructor(private http:HttpClient) { }
  getRanks(day:number, gc:number):Observable<Ranks>{
    let params = new HttpParams().set("day",day).set('gc', gc)

    return  this.http.get<Ranks>(`${environment.apiUrl}/rank`,{params})
  }
}
