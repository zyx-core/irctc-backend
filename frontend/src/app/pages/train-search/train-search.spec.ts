import { vi, expect, describe, it, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrainSearch } from './train-search';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../service/api.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';

describe('TrainSearch Component', () => {
  let component: TrainSearch;
  let fixture: ComponentFixture<TrainSearch>;
  let apiServiceSpy: any;
  let dialogSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    const apiSpy = { 
      getStations: vi.fn(), 
      searchTrains: vi.fn(),
      authState: new BehaviorSubject(false),
      getUserTickets: vi.fn().mockReturnValue(of([]))
    };
    const dlgSpy = { open: vi.fn().mockReturnValue({ afterClosed: () => of(null) }) };
    const rtrSpy = { navigate: vi.fn() };

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
        { provide: MatDialog, useValue: dlgSpy },
        { provide: Router, useValue: rtrSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TrainSearch);
    component = fixture.componentInstance;
    apiServiceSpy = TestBed.inject(ApiService) as any;
    dialogSpy = TestBed.inject(MatDialog) as any;
    routerSpy = TestBed.inject(Router) as any;
    
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

  it('should call apiService.searchTrains when form is valid onSearch and navigate', () => {
    const testDate = new Date();
    component.searchForm.patchValue({ 
      origin: 'DEL', 
      destination: 'BOM',
      journeyDate: testDate
    });

    const mockTrains = [{ id: 101, name: 'Rajdhani', number: '12345' }];
    apiServiceSpy.searchTrains.mockReturnValue(of(mockTrains));
    
    component.onSearch();

    expect(apiServiceSpy.searchTrains).toHaveBeenCalledWith(1, 2, testDate.toISOString());
    expect(routerSpy.navigate).toHaveBeenCalled();
    expect(routerSpy.navigate.mock.calls[0][0]).toEqual(['/train-list']);
  });

  it('should open booking dialog when openBooking is called', () => {
    const train = { id: 101, name: 'Test Train' };
    component.openBooking(train);
    
    expect(dialogSpy.open).toHaveBeenCalled();
    const callArgs = dialogSpy.open.mock.calls[0];
    expect(callArgs[1]?.data).toEqual({ train: train });
  });
});
