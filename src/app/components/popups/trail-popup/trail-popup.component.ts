import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-trail-popup',
  standalone: true,
  imports: [],
  templateUrl: './trail-popup.component.html',
  styleUrl: './trail-popup.component.css'
})
export class TrailPopupComponent {
  @Input() occurrences!: any[]
  @Input() data!: any
  @Output() closePopupEmitter = new EventEmitter<void>()

  constructor() {
  }

  public ngOnInit() {
    this.occurrences = this.filterDuplicates(this.occurrences, 'name_id');
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
    this.closePopupEmitter.emit();
  }
}
