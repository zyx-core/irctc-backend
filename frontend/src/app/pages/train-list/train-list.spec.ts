import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainListComponent } from './train-list';

describe('TrainList', () => {
  let component: TrainListComponent;
  let fixture: ComponentFixture<TrainListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrainListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
