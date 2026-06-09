import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';

import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('Header Component', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let dialogService: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header, NoopAnimationsModule],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    dialogService = TestBed.inject(MatDialog);
  });

  afterEach(() => {
    // Clean up inline styles so it doesn't affect other tests
    document.documentElement.style.fontSize = '';
    document.body.style.zoom = '';
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should update currentDateTime every second', () => {
    vi.useFakeTimers();
    fixture.detectChanges(); // calls ngOnInit and starts timer
    
    const initialTime = component.currentDateTime.getTime();
    
    vi.advanceTimersByTime(1100);
    const newTime = component.currentDateTime.getTime();
    
    expect(newTime).toBeGreaterThan(initialTime);
    
    // Clear the timer
    component.ngOnDestroy();
    vi.useRealTimers();
  });

  it('should toggle mobile menu open state', () => {
    expect(component.isMobileMenuOpen).toBe(false);
    component.toggleMobileMenu();
    expect(component.isMobileMenuOpen).toBe(true);
  });

  it('should open login dialog', () => {
    vi.spyOn(component.dialog, 'open');
    component.openLogin();
    expect(component.dialog.open).toHaveBeenCalled();
  });

  it('should change zoom level when calling changeFontSize', () => {
    document.body.style.zoom = '1';
    
    component.changeFontSize('increase');
    expect(document.body.style.zoom).toBe('1.1');

    component.changeFontSize('decrease');
    expect(document.body.style.zoom).toBe('1');

    component.changeFontSize('reset');
    expect(document.body.style.zoom).toBe('1');
  });

  it('should show coming soon dialog with correct feature data', () => {
    vi.spyOn(component.dialog, 'open');
    const dummyEvent = new Event('click');
    component.showComingSoon('TestFeature', dummyEvent);
    
    expect(component.dialog.open).toHaveBeenCalled();
  });
});
