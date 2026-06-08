import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../service/api.service';

@Component({
  selector: 'app-refund-status',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule
  ],
  templateUrl: './refund-status.html'
})
export class RefundStatusComponent implements OnInit {
  cancelledTickets: any[] = [];
  loading = true;

  constructor(
    private apiService: ApiService,
    public dialogRef: MatDialogRef<RefundStatusComponent>
  ) {}

  ngOnInit() {
    this.apiService.getUserTickets().subscribe({
      next: (tickets) => {
        this.cancelledTickets = tickets.filter((t: any) => t.status === 'CANCELLED');
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        alert('Failed to load tickets');
      }
    });
  }
}
