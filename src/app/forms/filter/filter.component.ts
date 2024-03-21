import {Component, EventEmitter, Input, input, Output} from '@angular/core';
import {Source} from "../../models/Source";

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css'
})
export class FilterComponent {
  @Input() sources: Source[] = [];
  @Input() categories: any;
  @Input() dataToDisplay: any;
  @Output() dataToDisplayChange = new EventEmitter<any>();
  // displayedSource!: Source

  ngOnInit(){
    // console.log(this.categories)
    // console.log(this.sources)
    // console.log(this.dataToDisplay)
  }

  handleChange(e: any){
    const selectedData = e.target.value

    if (selectedData === 'evenements'){
      let eventIndex = this.sources.findIndex((s: any) => s.name === selectedData);

      if (eventIndex !== -1) {
        this.dataToDisplay = this.sources[eventIndex].data;
      }

    } else if (selectedData === '26' || selectedData === '27' || selectedData === '28' || selectedData === '29') {
      let categoryIndex = this.categories.findIndex((c: any) => c.id === parseInt(selectedData));

      if (categoryIndex !== -1){
        this.dataToDisplay = this.categories[categoryIndex].data
      }
    }

    this.dataToDisplayChange.emit(this.dataToDisplay)
  }


}
