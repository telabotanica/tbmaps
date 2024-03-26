import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-trail-popup',
  standalone: true,
  imports: [],
  templateUrl: './trail-popup.component.html',
  styleUrl: './trail-popup.component.css'
})
export class TrailPopupComponent {
  occurrences: any[]

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<TrailPopupComponent>) {
    this.data = data.data
    this.occurrences = this.filterDuplicates(data.occurrences, 'name_id');
  }

  filterDuplicates(array: any[], key: string): any[] {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  close() {
    this.dialogRef.close();
  }
}
