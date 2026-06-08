import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../service/api.service';
import { LoginComponent } from '../../auth/login/login';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule
  ],
  templateUrl: './wallet.html'
})
export class WalletComponent implements OnInit {
  balance: number = 0;
  amount: number | null = null;

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<WalletComponent>
  ) {}

  ngOnInit() {
    if (!this.apiService.getUserId()) {
      alert("You must be logged in to view your E-Wallet.");
      this.dialogRef.close();
      this.dialog.open(LoginComponent, { width: '400px' });
      return;
    }
    this.fetchBalance();
  }

  fetchBalance() {
    this.apiService.getWalletBalance().subscribe({
      next: (res) => this.balance = res.balance,
      error: (err) => console.error(err)
    });
  }

  addFunds() {
    if (this.amount && this.amount > 0) {
      this.apiService.addWalletFunds(this.amount).subscribe({
        next: (res) => {
          this.balance = res.balance;
          this.amount = null;
          alert(res.message);
        },
        error: (err) => alert('Failed to add funds')
      });
    }
  }
}
