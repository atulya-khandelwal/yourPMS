import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableUnitsComponent } from './available-units.component';

describe('AvailableUnitsComponent', () => {
  let component: AvailableUnitsComponent;
  let fixture: ComponentFixture<AvailableUnitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailableUnitsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailableUnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
