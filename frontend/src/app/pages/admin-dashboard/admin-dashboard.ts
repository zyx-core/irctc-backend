import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../service/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {
  activeTab: string = 'dashboard';
  stats: any = null;
  trains: any[] = [];
  tickets: any[] = [];
  users: any[] = [];
  pantryOrders: any[] = [];
  loading = true;

  constructor(private apiService: ApiService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (!this.apiService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
    this.loadData();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.cdr.detectChanges();
    if (this.activeTab === 'dashboard') {
      this.apiService.getAdminStats().subscribe({
        next: (res) => { this.stats = res; this.loading = false; this.cdr.detectChanges(); },
        error: (err) => { alert('Failed to load stats'); this.loading = false; this.cdr.detectChanges(); }
      });
    } else if (this.activeTab === 'trains') {
      this.apiService.getAllTrains().subscribe({
        next: (res) => { this.trains = res; this.loading = false; this.cdr.detectChanges(); },
        error: (err) => { alert('Failed to load trains'); this.loading = false; this.cdr.detectChanges(); }
      });
    } else if (this.activeTab === 'tickets') {
      this.apiService.getAllTickets().subscribe({
        next: (res) => { this.tickets = res; this.loading = false; this.cdr.detectChanges(); },
        error: (err) => { alert('Failed to load tickets'); this.loading = false; this.cdr.detectChanges(); }
      });
    } else if (this.activeTab === 'users') {
      this.apiService.getAllUsers().subscribe({
        next: (res) => { this.users = res; this.loading = false; this.cdr.detectChanges(); },
        error: (err) => { alert('Failed to load users'); this.loading = false; this.cdr.detectChanges(); }
      });
    } else if (this.activeTab === 'pantry') {
      this.apiService.getAdminPantryOrders().subscribe({
        next: (res) => { this.pantryOrders = res; this.loading = false; this.cdr.detectChanges(); },
        error: (err) => { alert('Failed to load pantry orders'); this.loading = false; this.cdr.detectChanges(); }
      });
    }
  }

  deleteTrain(id: number) {
    if (confirm('Are you sure you want to delete this train?')) {
      this.apiService.deleteTrain(id).subscribe({
        next: () => {
          this.loadData();
          this.cdr.detectChanges();
        },
        error: (err) => alert('Failed to delete train: ' + (err.error?.message || err.message))
      });
    }
  }

  showAlert(msg: string) {
    alert(msg);
  }
}
