import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../service/api.service';
import { LoginComponent } from '../login/login';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  captchaValue: string = 'Y 7 r N';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      userName: ['', Validators.required],
      fullName: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobileCode: ['+91 - India'],
      mobile: ['', Validators.required],
      captcha: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const val = this.registerForm.value;
      if (val.password !== val.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      this.apiService.register({ username: val.userName, fullName: val.fullName, password: val.password, email: val.email }).subscribe({
        next: () => {
          alert('Registration successful! You can now login.');
          this.router.navigate(['/']);
        },
        error: (err) => alert('Registration failed: ' + (err.error || 'Unknown error'))
      });
    }
  }

  openSignIn(event: Event) {
    event.preventDefault();
    this.dialog.open(LoginComponent, {
      width: '400px',
      autoFocus: true
    });
  }
}
