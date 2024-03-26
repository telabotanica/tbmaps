import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrailPopupComponent } from './trail-popup.component';

describe('TrailPopupComponent', () => {
  let component: TrailPopupComponent;
  let fixture: ComponentFixture<TrailPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrailPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrailPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
