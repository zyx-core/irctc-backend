import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-charts-vacancy',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './charts-vacancy.html'
})
export class ChartsVacancyComponent {
  trainNo: string = '';
  journeyDate: Date | null = null;
  boardingStation: string = '';
  result: string | null = null;

  constructor(public dialogRef: MatDialogRef<ChartsVacancyComponent>) {}

  getCharts() {
    // Simulate API call for chart data
    setTimeout(() => {
      this.result = 'Chart Not Prepared';
    }, 500);
  }
}
