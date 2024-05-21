import { Injectable } from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CookiesService {

  private cookieName = environment.cookieName

  constructor(private cookieService: CookieService) { }

  userInfos(){
    let token = this.cookieService.get('tb_auth');

    return this.decodeToken(token);
  }

  decodeToken(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token');
    }

    const payload = parts[1];
    const decodedPayload = this.urlSafeBase64Decode(payload);
    return JSON.parse(decodedPayload);
  }

  private urlSafeBase64Decode(input: string): string {
    let str = input.replace(/-/g, '+').replace(/_/g, '/');
    switch (str.length % 4) {
      case 0: { break; }
      case 2: { str += '=='; break; }
      case 3: { str += '='; break; }
      default: {
        throw new Error('Invalid base64 string');
      }
    }
    return atob(str);
  }
}

