import {
  Component,
  ComponentRef,
  effect,
  Inject,
  inject,
  Input,
  OnInit,
  signal,
  ViewContainerRef
} from '@angular/core';
import {Event} from "../../../models/Event";
import {CommonService} from "../../../services/common.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

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

  private commonService = inject(CommonService)

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EventPopupComponent>
  ) {
    this.data = data.data

    this.eventDates = this.data.endDate ? "Du " + this.data.date + " au " + this.data.endDate : "Le " + this.data.date;
    this.formatedEventDates = this.data.formatedEndDate ? '<time class="events-dates-item is-end" datetime="' + this.data.formatedEndDate.dateString +'">' +
      '<div class="events-dates-day">' + this.data.formatedEndDate.localDateString[0] + '</div>' +
      '<div class="events-dates-month">' + this.data.formatedEndDate.localDateString[1] + '</div>' +
      '</time>' : "";
    this.prix = !!this.data.price ? this.commonService.parseHtmlStringContent(this.data.price) : 'Gratuit';
  }

  public ngOnInit() {
  }

  close(){
    this.dialogRef.close();
  }
}
