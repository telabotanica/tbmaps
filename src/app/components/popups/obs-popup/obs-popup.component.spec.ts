import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObsPopupComponent } from './obs-popup.component';

describe('ObsPopupComponent', () => {
  let component: ObsPopupComponent;
  let fixture: ComponentFixture<ObsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObsPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ObsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
