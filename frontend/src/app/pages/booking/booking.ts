import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../service/api.service';
import { LoginComponent } from '../../auth/login/login';

declare var Razorpay: any;

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule
  ],
  templateUrl: './booking.html'
})
export class BookingComponent {
  bookingForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public dialogRef: MatDialogRef<BookingComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.bookingForm = this.fb.group({
      passengerName: ['', Validators.required],
      passengerAge: ['', [Validators.required, Validators.min(1), Validators.max(120)]]
    });
  }

  loadRazorpay(): Promise<boolean> {
    return new Promise(resolve => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async onSubmit() {
    if (!this.apiService.getUserId()) {
      alert("You must be logged in to book a ticket.");
      this.dialog.open(LoginComponent, { width: '400px' });
      return;
    }

    if (this.bookingForm.valid) {
      const val = this.bookingForm.value;
      
      const isLoaded = await this.loadRazorpay();
      if (!isLoaded) {
        alert('Failed to load Razorpay SDK. Please check your internet connection or ad-blocker.');
        return;
      }

      const options = {
        key: 'rzp_test_Sw22Sv5F9OiBxO',
        amount: 50000, // 500 INR in paise
        currency: 'INR',
        name: 'IRCTC',
        description: 'Train Ticket Booking',
        handler: (response: any) => {
          this.apiService.bookTicket(this.data.train.id, val.passengerName, val.passengerAge, response.razorpay_payment_id).subscribe({
            next: (res) => {
              alert('Ticket Booked successfully!\nPNR: ' + res.pnr + '\nWallet Balance: ₹' + res.newBalance);
              this.dialogRef.close(res);
            },
            error: (err) => alert('Booking failed: ' + (err.error?.message || 'Unknown error'))
          });
        },
        prefill: {
          name: this.apiService.getFullName() || val.passengerName,
          email: 'test@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#f57f17'
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    }
  }
}
