import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { RegisterComponent } from './auth/register/register';

import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';
import { TrainListComponent } from './pages/train-list/train-list';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'train-list', component: TrainListComponent }
];
