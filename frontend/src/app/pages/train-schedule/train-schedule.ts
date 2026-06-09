import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../service/api.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-train-schedule',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatAutocompleteModule,
    MatIconModule
  ],
  templateUrl: './train-schedule.html',
  styles: [`
    .schedule-table { width: 100%; margin-top: 20px; }
    th.mat-header-cell { font-weight: bold; color: #333; }
  `]
})
export class TrainScheduleComponent {
  trainQuery: string = '';
  selectedTrainNumber: string = '';
  trainName: string = '';
  schedule: any[] = [];
  errorMessage: string | null = null;
  isLoading = false;
  suggestions: any[] = [];
  displayedColumns: string[] = ['stationName', 'arrivalTime', 'departureTime', 'haltTime'];

  private searchSubject = new Subject<string>();

  constructor(
    private apiService: ApiService,
    private ngZone: NgZone,
    public dialogRef: MatDialogRef<TrainScheduleComponent>
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => this.apiService.lookupTrains(q))
    ).subscribe(results => {
      this.ngZone.run(() => {
        this.suggestions = results;
      });
    });
  }

  onQueryChange(value: string) {
    this.selectedTrainNumber = '';
    this.schedule = [];
    this.trainName = '';
    this.errorMessage = null;
    if (value && value.length >= 2) {
      this.searchSubject.next(value);
    } else {
      this.suggestions = [];
    }
  }

  selectTrain(train: any) {
    this.trainQuery = `${train.number} - ${train.name}`;
    this.selectedTrainNumber = train.number;
    this.suggestions = [];
  }

  displayFn(train: any): string {
    return train ? `${train.number} - ${train.name}` : '';
  }

  searchSchedule() {
    this.errorMessage = null;
    this.schedule = [];
    this.trainName = '';

    const numberToSearch = this.selectedTrainNumber || this.trainQuery.trim().split(' ')[0];

    if (!numberToSearch) {
      alert('Please select a train from the suggestions or enter a valid train number.');
      return;
    }

    this.isLoading = true;
    this.apiService.getTrainSchedule(numberToSearch).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          if (!res) {
            this.errorMessage = 'Schedule not found for this train.';
            return;
          }
          this.trainName = res.trainName;
          this.schedule = res.stops;
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || err.message || 'Could not fetch train schedule.';
        });
      }
    });
  }
}
