import { MatRippleModule } from '@angular/material/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LoginComponent } from '../../auth/login/login';
import { PnrEnquiryComponent } from '../../pages/pnr-enquiry/pnr-enquiry';
import { CancelTicketComponent } from '../../pages/cancel-ticket/cancel-ticket';
import { WalletComponent } from '../../pages/wallet/wallet';
import { MealsComponent } from '../../pages/meals/meals';
import { ComingSoonComponent } from '../coming-soon/coming-soon';
import { ContactUsComponent } from '../contact-us/contact-us';
import { TrainScheduleComponent } from '../../pages/train-schedule/train-schedule';
import { ApiService } from '../../service/api.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatRippleModule, MatIconModule, MatDialogModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Header implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  currentDateTime = new Date();
  isLoggedIn = false;
  username: string | null = null;
  fullName: string | null = null;
  isAdmin = false;
  private authSub: any;
  private timer: any;

  constructor(public dialog: MatDialog, private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.timer = setInterval(() => {
      this.currentDateTime = new Date();
    }, 1000);

    this.authSub = this.apiService.authState.subscribe(status => {
      this.isLoggedIn = status;
      if (status) {
        this.username = this.apiService.getUsername();
        this.fullName = this.apiService.getFullName();
        this.isAdmin = this.apiService.isAdmin();
      } else {
        this.username = null;
        this.fullName = null;
        this.isAdmin = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  changeFontSize(action: string) {
    let currentZoom = parseFloat(document.body.style.zoom || '1');
    if (action === 'increase' && currentZoom < 1.3) {
      document.body.style.zoom = (currentZoom + 0.1).toString();
    } else if (action === 'decrease' && currentZoom > 0.8) {
      document.body.style.zoom = (currentZoom - 0.1).toString();
    } else if (action === 'reset') {
      document.body.style.zoom = '1';
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  openLogin() {
    this.dialog.open(LoginComponent, {
      width: '400px',
      autoFocus: true
    });
  }

  logout() {
    this.apiService.logout();
    alert('Logged out successfully.');
    this.router.navigate(['/']);
  }

  
  openPnrEnquiry(event: Event) {
    event.preventDefault();
    this.dialog.open(PnrEnquiryComponent, { width: '450px' });
  }

  openCancelTicket(event: Event) {
    event.preventDefault();
    this.dialog.open(CancelTicketComponent, { width: '450px' });
  }

  openWallet(event: Event) {
    event.preventDefault();
    this.dialog.open(WalletComponent, { width: '400px' });
  }

  openMeals(event: Event) {
    event.preventDefault();
    this.dialog.open(MealsComponent, { width: '600px' });
  }

  openTrainSchedule(event: Event) {
    event.preventDefault();
    this.dialog.open(TrainScheduleComponent, { width: '650px' });
  }

  openContactUs(event: Event) {
    event.preventDefault();
    this.dialog.open(ContactUsComponent, { width: '450px' });
  }

  showComingSoon(feature: string, event: Event) {
    event.preventDefault();
    this.dialog.open(ComingSoonComponent, {
      width: '350px',
      data: { feature: feature }
    });
  }
}
