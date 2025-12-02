import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private baseUrlSite = environment.baseUrlSite;
  private celUrlImages = environment.celUrlImages;
  private delUrlObs = environment.delUrlObs;
  private celExportUrl = environment.celExportUrl;

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

  getObservations(limite: string, params: any[] = []){
    let queryString = '';
    if (params.length > 0) {
      params = this.transformParamsForExportTotalRequest(params);
      queryString = params.map(param => `${encodeURIComponent(param.name)}=${encodeURIComponent(param.value)}`).join('&');
    }

    // Ajouter le paramètre 'limit' à la chaîne de requête
    queryString += (queryString ? '&' : '') + `navigation.limite=${limite}`;
      return this.http.get<any[]>(this.celExportUrl + '?' + queryString);
  }

  transformParamsForExportTotalRequest(params: any[]){
    params.map(param => {
      switch (param.name) {
        case 'referentiel':
          param.name = "masque.referentiel";
          break;
        case 'taxon':
          param.name = 'masque.nom_ret';
          break;
        case 'num_nom_ret':
          param.name = 'masque.nom_ret_nn';
          break;
        case 'projet':
          param.name = 'masque.projet';
          break;
        case 'auteur':
          param.name = 'masque.auteur';
          break;
        case 'standard':
          param.name = 'masque.standard';
          break;
        case 'famille':
          param.name = 'masque.famille';
          break;
        case 'annee':
          const year = parseInt(param.value, 10);
          if (!isNaN(year)) {
            param.name = 'date.debut';
            param.value = new Date(year, 0, 1).getTime() / 1000
            params.push({name:"date.fin", value: new Date(year, 11, 31, 23, 59, 59).getTime() / 1000})
          }
          break;
      }
    });
    return params;
  }
}
