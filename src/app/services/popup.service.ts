import { Injectable } from '@angular/core';
import {CommonService} from "./common.service";

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  constructor(private commonService: CommonService) { }

  eventPopup(data: any): string {
    let eventDates = data.endDate ? "Du " + data.date + " au " + data.endDate : "Le " + data.date;
    let formatedEventDates = data.formatedEndDate ? '<time class="events-dates-item is-end" datetime="' + data.formatedEndDate.dateString +'">' +
      '<div class="events-dates-day">' + data.formatedEndDate.localDateString[0] + '</div>' +
      '<div class="events-dates-month">' + data.formatedEndDate.localDateString[1] + '</div>' +
      '</time>' : "";
    let excerpt = data.excerpt ?  '<p id="events-excerpt">'+ data.excerpt +'</p>' : "";
    let prix = !!data.price ? this.commonService.parseHtmlStringContent(data.price) : 'Gratuit';
    let image = data.contactImage ? '<div class="events-contact-image" style="background-image: url('+ data.contactImage +');background-size:cover"></div>' : "";

    return (
      '<div id="popup-zone" class="visible" >' +
        '<div id="popup">' +
          '<div id="events" style="overflow:auto;">' +
            '<button id="close-popup">x</button>' +
            '<a class="events-category-label" href="' + data.categoryURL + '/" rel="category" title="'+ data.category +'" target="_parent">' + data.category + '</a>' +
            '<h2 id="events-title"><a href="'+ data.link + '" target="_parent">' + data.title + '</a></h2>' +
            '<div class="events-dates float-left" title="' + eventDates + '">' +
              '<time class="events-dates-item" datetime="' + data.formatedStartDate.dateString + '">' +
                '<div class="events-dates-day">' + data.formatedStartDate.localDateString[0] + '</div>' +
                '<div class="events-dates-month">' + data.formatedStartDate.localDateString[1] + '</div>' +
              '</time>' + formatedEventDates +
            '</div>' +
            excerpt +
            '<div class="events-info">' +
              '<h2 class="events-info-title"><span>Infos pratiques</span></h2>' +
              '<dl class="events-info-items">' +
                '<dt class="events-info-item-title">Adresse</dt>' +
                '<dd class="events-info-item-text">'+ data.place.value +'</dd>' +
                '<dt class="events-info-item-title">Tarif</dt>' +
                '<dd class="events-info-item-text">'+ prix +'</dd>' +
              '</dl>' +
            '</div>' +
            '<div class="events-contact">' +
              image +
              '<div class="events-contact-text">' +
                '<div class="events-contact-name">'+ data.contact.name +'</div>' +
                '<div class="events-contact-description">'+ data.contact.description +'</div>' +
                '<ul class="events-contact-details">' +
                  '<li><a href="tel:'+ data.contact.phone +'" class="events-contact-phone" target="_parent">'+ data.contact.phone +'</a></li>' +
                  '<li><a href="mailto:'+ data.contact.email +'" class="events-contact-email" target="_parent">'+ data.contact.email +'</a></li>' +
                  '<li><a href="'+ data.contact.website +'" rel="noopener noreferrer" class="events-contact-website" target="_parent">'+ data.contact.website +'</a></li>' +
                '</ul>' +
              '</div>' +
            '</div>' +
        '</div>' +
      '<a class="website-button" href="'+ data.link +'" target="_parent">Consulter l\'évènement</a>' +
      '</div></div>')
  }
}
