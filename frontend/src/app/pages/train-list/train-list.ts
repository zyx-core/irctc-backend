import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BookingComponent } from '../booking/booking';

@Component({
  selector: 'app-train-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCheckboxModule, FormsModule],
  templateUrl: './train-list.html',
  styleUrl: './train-list.scss'
})
export class TrainListComponent implements OnInit {
  trains: any[] = [];
  filteredTrains: any[] = [];
  searchParams: any = {};
  
  // Filter state
  classFilters: { [key: string]: boolean } = {
    '1A': true, '2A': true, '3A': true, 'SL': true, 'CC': true, '2S': true
  };
  typeFilters: { [key: string]: boolean } = {
    'GARIB RATH': true, 'JANSHATABDI': true, 'SHATABDI': true, 'OTHER': true
  };
  
  // Classes to display on train cards
  displayClasses = ['SL', '3A', '2A', '1A', 'CC', '2S'];

  // Track availability state per train-class combination
  // Key format: `${trainId}-${classCode}`
  availabilityState: { [key: string]: { status: 'loading' | 'available' | 'waitlist' | 'initial', text: string, color: string } } = {};

  constructor(private router: Router, private dialog: MatDialog) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.trains = navigation.extras.state['trains'] || [];
      this.searchParams = navigation.extras.state['searchParams'] || {};
    } else {
      // Fallback if accessed directly
      const historyState = window.history.state;
      if (historyState && historyState.trains) {
        this.trains = historyState.trains;
        this.searchParams = historyState.searchParams;
      }
    }
  }

  ngOnInit() {
    if (!this.trains || this.trains.length === 0) {
      // Redirect to home if no trains (e.g. user refreshed the page directly)
      this.router.navigate(['/']);
      return;
    }
    
    // Initialize availability state to 'initial'
    this.trains.forEach(t => {
      this.displayClasses.forEach(c => {
        this.availabilityState[`${t.id}-${c}`] = { status: 'initial', text: 'Refresh ↻', color: '#0f2963' };
      });
    });

    this.applyFilters();
  }

  getJourneyDate(): string {
    if (this.searchParams.date) {
      const d = new Date(this.searchParams.date);
      return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    }
    return '';
  }

  applyFilters() {
    // For now, dummy logic for Train Type filtering
    // since backend doesn't return Garib Rath etc., we just assume everything is 'OTHER' except if name contains it
    this.filteredTrains = this.trains.filter(t => {
      let isGaribRath = t.name.toLowerCase().includes('garib');
      let isShatabdi = t.name.toLowerCase().includes('shatabdi');
      let isJanShatabdi = t.name.toLowerCase().includes('janshatabdi');
      let isOther = !isGaribRath && !isShatabdi && !isJanShatabdi;

      let typeMatches = 
        (isGaribRath && this.typeFilters['GARIB RATH']) ||
        (isShatabdi && this.typeFilters['SHATABDI']) ||
        (isJanShatabdi && this.typeFilters['JANSHATABDI']) ||
        (isOther && this.typeFilters['OTHER']);
        
      return typeMatches;
    });
  }

  onFilterChange() {
    this.applyFilters();
  }

  fetchAvailability(trainId: number, classCode: string) {
    const key = `${trainId}-${classCode}`;
    
    // Set to loading
    this.availabilityState[key] = { status: 'loading', text: 'Checking...', color: '#666' };
    
    // Simulate network delay
    setTimeout(() => {
      const rand = Math.random();
      if (rand > 0.4) {
        const seats = Math.floor(Math.random() * 200) + 1;
        this.availabilityState[key] = { status: 'available', text: `AVAILABLE ${seats}`, color: '#2e7d32' }; // Green
      } else if (rand > 0.1) {
        const wl = Math.floor(Math.random() * 100) + 1;
        this.availabilityState[key] = { status: 'waitlist', text: `WL ${wl}`, color: '#d84315' }; // Orange/Red
      } else {
        this.availabilityState[key] = { status: 'waitlist', text: `REGRET/WL`, color: '#c62828' }; // Dark Red
      }
    }, 1500);
  }

  openBooking(train: any) {
    this.dialog.open(BookingComponent, {
      width: '450px',
      data: { train: train }
    });
  }
  
  modifySearch() {
    this.router.navigate(['/']);
  }
}
