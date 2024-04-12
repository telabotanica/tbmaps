import {Component, EventEmitter, inject, Inject, Input, Output} from '@angular/core';
import {CommonService} from "../../../services/common.service";
import {CommonModule} from "@angular/common";
import {environment} from "../../../../environments/environment";
// import {Util} from "leaflet";
// import trim = Util.trim;

@Component({
  selector: 'app-obs-popup',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './obs-popup.component.html',
  styleUrl: './obs-popup.component.css'
})
export class ObsPopupComponent {

  formattedDate: any;
  displayedName!: string;
  profilLink: string = '';
  @Input() data!: any
  @Output() closePopupEmitter = new EventEmitter<void>()

  memberLink = environment.membersProfil;

  private commonService = inject(CommonService)

  constructor() {}

  public ngOnInit() {
    this.transformData()
  }

  close() {
    this.closePopupEmitter.emit();
  }

  private transformData(){
    let formatDates = this.data.dateObs ? this.commonService.formatDates(this.data.dateObs) : null
    let localDate = formatDates ? formatDates.localDateString : null
    this.formattedDate = localDate ? localDate : null;

    // Formatage du nom de l'auteur
    if (this.data.author) {
      this.displayedName = this.data.author
    } else if ((this.data.utilisateur.nom_utilisateur).trim()){
      this.displayedName = this.data.utilisateur.nom_utilisateur
    } else if(this.data.utilisateur.email){
      this.displayedName = this.commonService.tronquerEmail(this.data.utilisateur.email)
    } else {
      this.displayedName = 'Auteur anonyme'
    }

    if (this.data.utilisateur.nom_utilisateur) {
      this.profilLink = this.memberLink + this.commonService.formatUsername(this.data.utilisateur.nom_utilisateur);
    }
  }
}
