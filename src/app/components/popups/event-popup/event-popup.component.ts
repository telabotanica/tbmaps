import {
  Component, EventEmitter,
  inject,
  Input, Output
} from '@angular/core';
import {CommonService} from "../../../services/common.service";

@Component({
  selector: 'app-event-popup',
  standalone: true,
  imports: [],
  templateUrl: './event-popup.component.html',
  styleUrl: './event-popup.component.css'
})
export class EventPopupComponent{
  eventDates = '';
  formatedEventDates = '';
  prix: null | string = '';
  @Input() data!: any
  @Output() closePopupEmitter = new EventEmitter<void>()

  private commonService = inject(CommonService)

  constructor() {}

  public ngOnInit() {
    this.transformData()
  }

  close(){
    this.closePopupEmitter.emit();
  }

  private transformData(){
    this.eventDates = this.data.endDate ? "Du " + this.data.date + " au " + this.data.endDate : "Le " + this.data.date;
    this.formatedEventDates = this.data.formatedEndDate ? '<time class="events-dates-item is-end" datetime="' + this.data.formatedEndDate.dateString +'">' +
      '<div class="events-dates-day">' + this.data.formatedEndDate.localDateString[0] + '</div>' +
      '<div class="events-dates-month">' + this.data.formatedEndDate.localDateString[1] + '</div>' +
      '</time>' : "";
    this.prix = !!this.data.price ? this.commonService.parseHtmlStringContent(this.data.price) : 'Gratuit';
  }
}
