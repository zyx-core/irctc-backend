import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ApiService } from '../../service/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  authForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<LoginComponent>,
    private apiService: ApiService,
    private router: Router
  ) {
    this.authForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.authForm.valid) {
      const val = this.authForm.value;
      this.apiService.login({ username: val.username, password: val.password }).subscribe({
        next: (res) => {
          this.apiService.setUserId(res.userId, res.username, res.fullName, res.isAdmin);
          this.dialogRef.close(res);
          this.router.navigate(['/']);
        },
        error: (err) => {
          const errMsg = typeof err.error === 'string' ? err.error : (err.error?.message || err.statusText);
          alert('Login failed: ' + errMsg);
        }
      });
    }
  }

  goToRegister() {
    this.dialogRef.close();
    this.router.navigate(['/register']);
  }
}
