import {Component, inject, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CommonService} from "../../../services/common.service";
import {CommonModule} from "@angular/common";
import {environment} from "../../../../environments/environment";
import {Util} from "leaflet";
import trim = Util.trim;

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
  displayedName: string;
  profilLink: string = '';

  memberLink = environment.membersProfil;

  private commonService = inject(CommonService)

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<ObsPopupComponent>) {
    this.data = data.data

    // Formatage de la date
    let formatDates = this.data.dateObs ? this.commonService.formatDates(this.data.dateObs) : null
    let localDate = formatDates ? formatDates.localDateString : null
    this.formattedDate = localDate ? localDate : null;

    // Formatage du nom de l'auteur
    if (this.data.author) {
      this.displayedName = this.data.author
    } else if (trim(this.data.utilisateur.nom_utilisateur)){
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

  close() {
    this.dialogRef.close();
  }
}
