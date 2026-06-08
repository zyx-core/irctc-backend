import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../service/api.service';
import { LoginComponent } from '../../auth/login/login';

@Component({
  selector: 'app-cancel-ticket',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule
  ],
  templateUrl: './cancel-ticket.html'
})
export class CancelTicketComponent {
  pnr: string = '';

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<CancelTicketComponent>
  ) {}

  cancelPnr() {
    if (!this.apiService.getUserId()) {
      alert("You must be logged in to cancel a ticket.");
      this.dialog.open(LoginComponent, { width: '400px' });
      return;
    }

    if (confirm('Are you sure you want to cancel PNR ' + this.pnr + '?')) {
      this.apiService.cancelTicket(this.pnr).subscribe({
        next: (res) => {
          alert(res.message);
          this.dialogRef.close();
        },
        error: (err) => {
          alert('Cancellation failed: ' + (err.error?.message || 'Unknown error'));
        }
      });
    }
  }
}
