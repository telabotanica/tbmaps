import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

  /***** globals ****/
  sources = {};
  sourceClasses = {};
  imagesPath = 'assets/images/';
  urlParams = {};
  regexpLat = /^-?(?:[1-8]?\d(?:\.\d+)?|90(?:\.0+)?)$/;
  regexpLng = /^-?(?:(?:1[0-7]|[1-9])?\d(?:\.\d+)?|180(?:\.0+)?)$/;
  regexpDate = /(^(((0[1-9]|1[0-9]|2[0-8])[\/](0[1-9]|1[012]))|((29|30|31)[\/](0[13578]|1[02]))|((29|30)[\/](0[4,6,9]|11)))[\/](19|20)\d\d$)|(^29[\/]02[\/](19|20)(00|04|08|12|16|20|24|28|32|36|40|44|48|52|56|60|64|68|72|76|80|84|88|92|96)$)/;
  count = 0;
  countB = 0;
  /***** utils *****/

  isString(string: any, checkEmpty = false){
    let isString = 'string' === typeof string || string instanceof String;

    if(checkEmpty) {
      isString = isString && string !== '';
    }
    return isString;
  }

  tryParseJson(str: any){
    if (!this.isString(str)) {
      return false;
    }
    try{
      const json = JSON.parse(str);

      if (!!json && 'object' === typeof json) {
        return json;
      } else {
        return false;
      }
    }
    catch (e){
      return false;
    }
  };

  formatDates(shortFrDate: any){
    // const options = {day: 'numeric', month: 'short', year: 'numeric'};
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    let formatedDateData = null;

    if (this.isString(shortFrDate, true)) {
      const dateParts = shortFrDate.split('/'),
        dateString = dateParts.reverse().join('-'),
        date = new Date(dateString),
        dateToLocaleDateString = date.toLocaleDateString('fr-FR', options).split(' ');

      formatedDateData = {
        dateString: dateString,
        localDateString : dateToLocaleDateString
      };
    }
    return formatedDateData;
  };

  capitalizeFirstLetter = (string: any) => (this.isString(string, true)) ? string[0].toUpperCase()+string.slice(1) : string;

  parsePlace(placeData: any){
    return( !!placeData && 'object' === typeof placeData ) ? placeData : this.tryParseJson(placeData);
  };

  parseHtmlStringContent(content: any){
    if(!this.isString(content)) {
      return null;
    }
    return new DOMParser().parseFromString(content,"text/html").documentElement.textContent;
  };

  generateExcerpt(string: any, length: any = 500, isLengthIncludingEllipsis: boolean = false){
    if (!this.isString(string)) {
      return null;
    }
    if (!parseInt(length) || 1 > length) {
      return '';
    }
    if (isLengthIncludingEllipsis && 0 < length - 3) {
      length -= 3;
    }
    return string.length > length ? string.substring(0, length) + '...' : string;
  };

  public validatePostsEventsDates(acf: any ) {
    if(!acf.date || !this.regexpDate.test(acf.date)) {

      return false;
    }

    const hasEndDateValue = this.isString(acf['date_end'], true);

    if(hasEndDateValue  && !this.regexpDate.test(acf['date_end'])) {
      return false
    }
    // this.count++
    const postEventDate = hasEndDateValue && this.regexpDate.test(acf['date_end']) ? acf['date_end'] : acf.date,
      postEventDateArray = postEventDate.split('/').reverse(),
      postEventFormatedDate = postEventDateArray.join('-'),
      postEventDateDateTime = new Date(postEventFormatedDate),
      date = new Date();

    return postEventDateDateTime >= date;
  };

  filterData(eventPostData: any) {
    if(
      !eventPostData.acf?.place ||
      1 > eventPostData.acf.place.length ||
      !this.validatePostsEventsDates(eventPostData.acf)
    ) {
      return false;
    }

    const place = this.parsePlace(eventPostData.acf.place);

    if(!place?.latlng?.lat || !place.latlng?.lng) {
      return false;
    }
    return (this.regexpLng.test(place.latlng.lng) && this.regexpLat.test(place.latlng.lat))
  };

  readUrlParameters(): { name: string, value: string }[] {
    const expectedParams = [
      'title',
      'logo',
      'sources',
      'zoom',
      'url_site',
      'referentiel',
      'annee',
      'projet',
      'taxon',
      'num_nom_ret',
      'auteur',
      'standard'
    ];
    const urlParams: { name: string, value: string }[] = [];

    const queryString = decodeURIComponent(window.location.search.substring(1));
    const parts = queryString.split('&');

    for (const part of parts) {
      const [paramName, paramValue] = part.split('=');

      if (expectedParams.includes(paramName)) {
        urlParams.push({ name: paramName, value: paramValue });
      }
    }

    return urlParams;
  }

  tronquerEmail(email: string){
    const atIndex = email.indexOf('@');
    if (atIndex !== -1) {
      const truncated = email.substring(0, atIndex + 1) + '...';
      return truncated;
    }
    return email; // Si aucun '@' n'est trouvé, retourne l'email inchangé
  }

  // Formatage du nom utilisateur pour l'affichage du profil sur le site tela
  formatUsername(username: string) {
    // Supprimer les accents
    const normalizedUsername = username.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    // Mettre en minuscules et remplacer les espaces par des tirets
    const formattedUsername = normalizedUsername.toLowerCase().replace(/\s+/g, "-");
    return formattedUsername;
  }

}
