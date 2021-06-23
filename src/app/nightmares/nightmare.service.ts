import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Nightmare} from "../shared/nightmare.model";
import {map} from "rxjs/operators";
import {environment} from "../../environments/environment";


@Injectable({
  providedIn: 'root'
})
export class NightmareService {

  constructor(private http:HttpClient) { }
  getNightmares():Observable<Nightmare[]>{
    let headers = new HttpHeaders()
    const url = `${environment.apiUrl}/nightmares`
    return this.http.get<Nightmare[]>(url).pipe(
      map(res =>{
        let nms : Nightmare[] =[]
        res.forEach(nm =>{
          nms.push(new Nightmare(
            nm.ID,
            nm.Icon,
            nm.Attribute,
            nm.Rarity,
            nm.NameEN,
            nm.GvgSkillEN,
            nm.GvgSkillDur,
            nm.GvgSkillLead,
            nm.GvgSkillSP,
            nm.Global))
        })
        return nms
      })
    )
  }
}
