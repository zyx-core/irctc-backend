import { vi, expect, describe, it, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from '../../service/api.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('Login Component', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let apiSpy: any;
  let dialogRefSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    apiSpy = { login: vi.fn(), setUserId: vi.fn() };
    dialogRefSpy = { close: vi.fn() };
    routerSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent, 
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should invalidate form if empty', () => {
    component.authForm.patchValue({ username: '', password: '' });
    expect(component.authForm.valid).toBe(false);
  });

  it('should validate form if filled', () => {
    component.authForm.patchValue({ username: 'user', password: 'pwd' });
    expect(component.authForm.valid).toBe(true);
  });

  it('should go to register', () => {
    component.goToRegister();
    expect(dialogRefSpy.close).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/register']);
  });

  it('should call apiService.login and close dialog on successful login', () => {
    component.authForm.patchValue({ username: 'testuser', password: 'password' });
    
    const mockResponse = { username: 'testuser', userId: 10, fullName: 'Test', isAdmin: false };
    apiSpy.login.mockReturnValue(of(mockResponse));

    component.onSubmit();

    expect(apiSpy.login).toHaveBeenCalledWith({ username: 'testuser', password: 'password' });
    expect(apiSpy.setUserId).toHaveBeenCalledWith(10, 'testuser', 'Test', false);
    expect(dialogRefSpy.close).toHaveBeenCalledWith(mockResponse);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should alert on login failure', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.authForm.patchValue({ username: 'testuser', password: 'password' });
    
    apiSpy.login.mockReturnValue(throwError(() => ({ error: 'Invalid credentials' })));

    component.onSubmit();

    expect(apiSpy.login).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Login failed: Invalid credentials');
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });
});
