import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrainSearch } from './train-search';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../service/api.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('TrainSearch Component', () => {
  let component: TrainSearch;
  let fixture: ComponentFixture<TrainSearch>;
  let apiServiceSpy: any;
  let dialogSpy: any;

  beforeEach(async () => {
    const apiSpy = { getStations: vi.fn(), searchTrains: vi.fn() };
    const dlgSpy = { open: vi.fn() };

    // Mock initial station fetch
    apiSpy.getStations.mockReturnValue(of([
      { id: 1, name: 'Delhi', code: 'DEL' },
      { id: 2, name: 'Mumbai', code: 'BOM' }
    ]));

    await TestBed.configureTestingModule({
      imports: [
        TrainSearch,
        ReactiveFormsModule,
        MatDialogModule,
        BrowserAnimationsModule // Required for material inputs
      ],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: MatDialog, useValue: dlgSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TrainSearch);
    component = fixture.componentInstance;
    apiServiceSpy = TestBed.inject(ApiService) as any;
    dialogSpy = TestBed.inject(MatDialog) as any;
    
    // Trigger ngOnInit / constructor logic
    fixture.detectChanges();
  });

  it('should create and load stations on init', () => {
    expect(component).toBeTruthy();
    expect(apiServiceSpy.getStations).toHaveBeenCalled();
    expect(component.stations.length).toBe(2);
  });

  it('should invalidate form if required fields are empty', () => {
    const form = component.searchForm;
    form.patchValue({ origin: '', destination: '' });
    expect(form.valid).toBe(false);
  });

  it('should validate form when required fields are populated', () => {
    const form = component.searchForm;
    form.patchValue({ 
      origin: 'DEL', 
      destination: 'BOM',
      journeyDate: new Date()
    });
    expect(form.valid).toBe(true);
  });

  it('should swap origin and destination correctly', () => {
    component.searchForm.patchValue({ origin: 'DEL', destination: 'BOM' });
    component.swapStations();
    
    expect(component.searchForm.get('origin')?.value).toBe('BOM');
    expect(component.searchForm.get('destination')?.value).toBe('DEL');
  });

  it('should call apiService.searchTrains when form is valid onSearch', () => {
    const testDate = new Date();
    component.searchForm.patchValue({ 
      origin: 'DEL', 
      destination: 'BOM',
      journeyDate: testDate
    });

    apiServiceSpy.searchTrains.mockReturnValue(of([{ id: 101, name: 'Rajdhani', number: '12345' }]));
    
    // Using window.alert spy so it doesn't interrupt test
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    component.onSearch();

    expect(apiServiceSpy.searchTrains).toHaveBeenCalledWith(1, 2, testDate.toISOString());
    expect(component.searchResults.length).toBe(1);
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Found 1 train(s)!'));
  });

  it('should open booking dialog when openBooking is called', () => {
    const train = { id: 101, name: 'Test Train' };
    component.openBooking(train);
    
    expect(dialogSpy.open).toHaveBeenCalled();
    const callArgs = dialogSpy.open.mock.calls[0];
    expect(callArgs[1]?.data).toEqual({ train: train });
  });
});
