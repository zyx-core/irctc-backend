import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../service/api.service';

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
    MatTableModule
  ],
  templateUrl: './train-schedule.html',
  styles: [`
    .schedule-table { width: 100%; margin-top: 20px; }
    th.mat-header-cell { font-weight: bold; color: #333; }
  `]
})
export class TrainScheduleComponent {
  trainNumber: string = '';
  trainName: string = '';
  schedule: any[] = [];
  errorMessage: string | null = null;
  displayedColumns: string[] = ['stationName', 'arrivalTime', 'departureTime', 'haltTime'];

  constructor(
    private apiService: ApiService,
    public dialogRef: MatDialogRef<TrainScheduleComponent>
  ) {}

  searchSchedule() {
    console.log("Search clicked! Train number:", this.trainNumber);
    this.errorMessage = null;
    this.schedule = [];
    this.trainName = '';
    
    if (!this.trainNumber) {
      alert("Please enter a train number.");
      return;
    }

    console.log("Calling API...");
    this.apiService.getTrainSchedule(this.trainNumber).subscribe({
      next: (res) => {
        console.log("API Response received:", res);
        if (!res) {
          this.errorMessage = "Schedule not found for this train.";
          alert(this.errorMessage);
          return;
        }
        this.trainName = res.trainName;
        this.schedule = res.stops;
        console.log("Schedule assigned. Length:", this.schedule.length);
      },
      error: (err) => {
        console.error("API Error:", err);
        this.errorMessage = err.error?.message || err.message || "Could not fetch train schedule.";
        alert("Error: " + this.errorMessage);
      }
    });
  }
}
