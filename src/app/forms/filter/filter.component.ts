import {Component, EventEmitter, Input, input, Output} from '@angular/core';
import {Source} from "../../models/Source";
import {CommonModule} from "@angular/common";

@Component({
    selector: 'app-filter',
    imports: [
        CommonModule
    ],
    templateUrl: './filter.component.html',
    styleUrl: './filter.component.css',
    standalone: true
})
export class FilterComponent {
  @Input() sources: Source[] = [];
  @Input() categories: any;
  @Input() sourceName!: string;
  @Input() dataToDisplay: any;
  @Output() dataToDisplayChange = new EventEmitter<any>();
  @Output() sourceNameChange = new EventEmitter<any>();

  handleChange(e: any){
    const selectedData = e.target.value

    if (selectedData === '26' || selectedData === '27' || selectedData === '28' || selectedData === '29') {
      let categoryIndex = this.categories.findIndex((c: any) => c.id === parseInt(selectedData));

      if (categoryIndex !== -1){
        this.dataToDisplay = this.categories[categoryIndex].data;
        this.sourceName = 'evenements'
      }
    } else {
      let eventIndex = this.sources.findIndex((s: any) => s.name === selectedData);

      if (eventIndex !== -1) {
        this.dataToDisplay = this.sources[eventIndex].data;
        this.sourceName = selectedData
      }
    }

    this.dataToDisplayChange.emit(this.dataToDisplay)
    this.sourceNameChange.emit(selectedData)
  }


}
