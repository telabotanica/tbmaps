import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private baseUrlSite = environment.baseUrlSite;

  constructor(private http: HttpClient) { }

  getEvents(){
    return this.http.get<any[]>( 'https://www.tela-botanica.org/wp-json/wp/v2/posts?status=publish&categories=26,27,28,29&per_page=800&order_by=modified&order=desc');
  }

  getTrails(){
    return this.http.get<any[]>(this.baseUrlSite + 'smartflore-services/trails/');
  }

  getTrailDetails(url: any){
    return this.http.get<any[]>(url);
  }
}
