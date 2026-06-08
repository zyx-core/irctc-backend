import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ApiService } from '../../service/api.service';
import { LoginComponent } from '../../auth/login/login';

declare var Razorpay: any;

@Component({
  selector: 'app-meals',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './meals.html'
})
export class MealsComponent implements OnInit {
  pnr: string = '';
  menu: any[] = [];
  mealOrders: any[] = [];
  trackingError: string = '';

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<MealsComponent>
  ) {}

  ngOnInit() {
    this.apiService.getMealMenu().subscribe({
      next: (res) => this.menu = res,
      error: (err) => console.error(err)
    });
  }

  trackMeals() {
    this.trackingError = '';
    if (!this.pnr) {
      this.trackingError = 'Please enter a PNR to track.';
      return;
    }
    this.apiService.getMealOrders(this.pnr).subscribe({
      next: (res) => {
        this.mealOrders = res;
        if (this.mealOrders.length === 0) {
          this.trackingError = 'No meal orders found for this PNR.';
        }
      },
      error: (err) => {
        this.trackingError = 'Failed to fetch orders: ' + (err.error?.message || 'Unknown error');
      }
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

  async orderMeal(meal: any) {
    if (!this.apiService.getUserId()) {
      alert("You must be logged in to order a meal.");
      this.dialog.open(LoginComponent, { width: '400px' });
      return;
    }

    if (!this.pnr) {
      alert("Please enter your PNR first.");
      return;
    }

    const isLoaded = await this.loadRazorpay();
    if (!isLoaded) {
      alert('Failed to load Razorpay SDK. Please check your internet connection or ad-blocker.');
      return;
    }

    const options = {
      key: 'rzp_test_Sw22Sv5F9OiBxO',
      amount: meal.price * 100, // amount in paise
      currency: 'INR',
      name: 'IRCTC E-Catering',
      description: `Order ${meal.name}`,
      handler: (response: any) => {
        this.apiService.orderMeal(this.pnr, meal.id, 1, response.razorpay_payment_id).subscribe({
          next: (res) => {
            alert('Meal Ordered successfully!\n' + res.message);
          },
          error: (err) => alert('Order failed: ' + (err.error?.message || 'Unknown error'))
        });
      },
      prefill: {
        name: this.apiService.getFullName() || 'Passenger',
        email: 'passenger@example.com',
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
