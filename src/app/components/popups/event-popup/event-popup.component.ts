import {
  Component,
  ComponentRef,
  effect,
  Inject,
  inject,
  Input,
  input,
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
export class EventPopupComponent implements OnInit{
  // @Input() event = new(Event);
  // event = input<Event>();
  // data= input<Event>();
  // isloaded = signal(false)
  // @Input() evenement!: any;
  // @Input() data!: Event;
  // @Input() message!: string;
  // @Input() target!: ViewContainerRef;
  // @Input() componentRef!: ComponentRef<any>;

  eventDates = '';
  formatedEventDates = '';
  prix: null | string = '';

  private commonService = inject(CommonService)

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<EventPopupComponent>) {
    this.data = data.data

    this.eventDates = this.data.endDate ? "Du " + this.data.date + " au " + this.data.endDate : "Le " + this.data.date;
    this.formatedEventDates = this.data.formatedEndDate ? '<time class="events-dates-item is-end" datetime="' + this.data.formatedEndDate.dateString +'">' +
      '<div class="events-dates-day">' + this.data.formatedEndDate.localDateString[0] + '</div>' +
      '<div class="events-dates-month">' + this.data.formatedEndDate.localDateString[1] + '</div>' +
      '</time>' : "";
    this.prix = !!this.data.price ? this.commonService.parseHtmlStringContent(this.data.price) : 'Gratuit';

    this.ngOnInit()
    console.log(this.data.title)
  }

  public ngOnInit() {
    console.log('ici')
    console.log(this.data)
    // this.eventDates = this.data.endDate ? "Du " + this.data.date + " au " + this.data.endDate : "Le " + this.data.date;
    // this.formatedEventDates = this.data.formatedEndDate ? '<time class="events-dates-item is-end" datetime="' + this.data.formatedEndDate.dateString +'">' +
    //   '<div class="events-dates-day">' + this.data.formatedEndDate.localDateString[0] + '</div>' +
    //   '<div class="events-dates-month">' + this.data.formatedEndDate.localDateString[1] + '</div>' +
    //   '</time>' : "";
    // this.prix = !!this.data.price ? this.commonService.parseHtmlStringContent(this.data.price) : 'Gratuit';

    // console.log(this.data)
    // console.log(this.data.formatedStartDate)
    // console.log(this.message)
    // console.log('ici');
  }

  close(){
    // this.target.remove(0)
    this.dialogRef.close();
  }
}
