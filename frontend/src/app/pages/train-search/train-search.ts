import { MatRippleModule } from '@angular/material/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

import { TrainService, Station, Train } from '../../service/train.service';
import { ApiService } from '../../service/api.service';
import { BookingComponent } from '../booking/booking';
import { PnrEnquiryComponent } from '../pnr-enquiry/pnr-enquiry';
import { RefundStatusComponent } from '../refund-status/refund-status';
import { ChartsVacancyComponent } from '../charts-vacancy/charts-vacancy';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-train-search',
  standalone: true,
  imports: [MatRippleModule, 
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule
  ],
  templateUrl: './train-search.html',
  styleUrl: './train-search.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TrainSearch implements OnInit, OnDestroy {
  isLoggedIn = false;
  private authSub: any;
  openBooking(train: any) {
    const dialogRef = this.dialog.open(BookingComponent, {
      width: '450px',
      data: { train: train }
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res && this.isLoggedIn) {
        this.fetchUserTickets(); // Refresh dashboard after booking
      }
    });
  }

  viewJourneyDetails(pnr: string) {
    this.dialog.open(PnrEnquiryComponent, {
      width: '500px',
      data: { pnr: pnr }
    });
  }

  openPnrStatus() {
    this.dialog.open(PnrEnquiryComponent, { width: '500px' });
  }

  openCharts() {
    this.dialog.open(ChartsVacancyComponent, { width: '500px' });
  }

  openRefundStatus() {
    if (!this.isLoggedIn) {
      alert("Please login first.");
      return;
    }
    this.dialog.open(RefundStatusComponent, { width: '600px' });
  }

  rebookJourney() {
    if (this.lastTransaction) {
      const srcCode = this.lastTransaction.train.sourceStation.code;
      const destCode = this.lastTransaction.train.destinationStation.code;
      
      this.searchForm.patchValue({
        origin: srcCode,
        destination: destCode,
        journeyDate: new Date()
      });
      
      alert(`Search pre-filled with your last journey: ${srcCode} to ${destCode}.`);
      this.onSearch();
    } else {
      alert('No previous journey found to re-book.');
    }
  }

  searchForm: FormGroup;

  classes = ['All Classes', 'Anubhuti Class (EA)', 'AC First Class (1A)', 'Vistadome AC (EV)', 'Exec. Chair Car (EC)', 'AC 2 Tier (2A)', 'First Class (FC)', 'AC 3 Tier (3A)', 'AC 3 Economy (3E)', 'Vistadome Chair Car (VC)', 'AC Chair car (CC)', 'Sleeper (SL)', 'Vistadome Non AC (VS)', 'Second Sitting (2S)'];
  quotas = ['GENERAL', 'LADIES', 'LOWER BERTH/SR.CITIZEN', 'PERSON WITH DISABILITY', 'TATKAL', 'PREMIUM TATKAL'];

  stations: Station[] = [];
  filteredStations: any[] = [];
  searchResults: Train[] = [];

  constructor(private fb: FormBuilder, private apiService: ApiService, private dialog: MatDialog) {
    this.searchForm = this.fb.group({
      origin: ['', Validators.required],
      destination: ['', Validators.required],
      journeyDate: [new Date(), Validators.required],
      journeyClass: ['All Classes'],
      journeyQuota: ['GENERAL'],
      concessionBooking: [false],
      dateSpecific: [false],
      passBooking: [false]
    });

    this.apiService.getStations().subscribe(res => {
      this.stations = res;
      this.searchForm.get('origin')?.updateValueAndValidity();
      this.searchForm.get('destination')?.updateValueAndValidity();
    });
  }

  userTickets: any[] = [];
  lastTransaction: any = null;
  upcomingJourney: any = null;

  filteredOriginStations!: Observable<Station[]>;
  filteredDestStations!: Observable<Station[]>;

  ngOnInit() {
    this.filteredOriginStations = this.searchForm.get('origin')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterStations(value || ''))
    );
    this.filteredDestStations = this.searchForm.get('destination')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterStations(value || ''))
    );
    this.authSub = this.apiService.authState.subscribe(status => {
      this.isLoggedIn = status;
      if (this.isLoggedIn) {
        this.fetchUserTickets();
      } else {
        this.userTickets = [];
        this.lastTransaction = null;
        this.upcomingJourney = null;
      }
    });
  }

  fetchUserTickets() {
    this.apiService.getUserTickets().subscribe(tickets => {
      this.userTickets = tickets;
      if (tickets && tickets.length > 0) {
        this.lastTransaction = tickets[0];
        this.upcomingJourney = tickets.find((t: any) => t.status === 'CONFIRMED') || null;
      }
    });
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  private _filterStations(value: string): Station[] {
    const filterValue = value.toLowerCase();
    return this.stations.filter(station => 
      station.name.toLowerCase().includes(filterValue) || 
      station.code.toLowerCase().includes(filterValue)
    );
  }

  swapStations() {
    const from = this.searchForm.get('origin')?.value;
    const to = this.searchForm.get('destination')?.value;
    this.searchForm.patchValue({ origin: to, destination: from });
  }

  onSearch() {
    if (this.searchForm.valid) {
      const fromCode = this.searchForm.get('origin')?.value;
      const toCode = this.searchForm.get('destination')?.value;
      const date = this.searchForm.get('journeyDate')?.value;
      
      const fromStation = this.stations.find(s => s.code === fromCode || s.name === fromCode);
      const toStation = this.stations.find(s => s.code === toCode || s.name === toCode);

      if (fromStation && toStation) {
        this.apiService.searchTrains(fromStation.id, toStation.id, date.toISOString())
          .subscribe(trains => {
            console.log('Found trains:', trains);
            this.searchResults = trains;
            if(trains.length === 0) alert('No trains found between selected stations.');
            else {
               setTimeout(() => {
                 document.getElementById('train-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
               }, 100);
            }
          });
      } else {
        alert('Invalid Source or Destination Station');
      }
    }
  }
}
