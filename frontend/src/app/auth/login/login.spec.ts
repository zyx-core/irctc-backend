import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from '../../service/api.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

describe('Login Component', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let apiSpy: any;
  let dialogRefSpy: any;

  beforeEach(async () => {
    apiSpy = { login: vi.fn(), register: vi.fn(), setUserId: vi.fn() };
    dialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent, 
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} }
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

  it('should toggle to register mode and add email validation', () => {
    expect(component.isLogin).toBe(true);
    
    component.toggleMode();
    
    expect(component.isLogin).toBe(false);
    // In register mode, email is required
    component.authForm.patchValue({ username: 'test', password: 'password', email: '' });
    expect(component.authForm.valid).toBe(false); // fails email required

    component.authForm.patchValue({ email: 'test@example.com' });
    expect(component.authForm.valid).toBe(true);
  });

  it('should call apiService.login and close dialog on successful login', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.authForm.patchValue({ username: 'testuser', password: 'password' });
    
    const mockResponse = { username: 'testuser', userId: 10 };
    apiSpy.login.mockReturnValue(of(mockResponse));

    component.onSubmit();

    expect(apiSpy.login).toHaveBeenCalledWith({ username: 'testuser', password: 'password' });
    expect(apiSpy.setUserId).toHaveBeenCalledWith(10);
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Login successful!'));
    expect(dialogRefSpy.close).toHaveBeenCalledWith(mockResponse);
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

  it('should call apiService.register and toggle mode on successful registration', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.toggleMode(); // switch to register
    component.authForm.patchValue({ username: 'testuser', password: 'password', email: 'test@mail.com' });
    
    apiSpy.register.mockReturnValue(of({ success: true }));

    component.onSubmit();

    expect(apiSpy.register).toHaveBeenCalledWith({ username: 'testuser', password: 'password', email: 'test@mail.com' });
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Registration successful!'));
    expect(component.isLogin).toBe(true); // toggles back to login
  });
});
