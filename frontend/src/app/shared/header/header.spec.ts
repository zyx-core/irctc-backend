import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';

describe('Header Component', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let dialogSpy: any;

  beforeEach(async () => {
    dialogSpy = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    // Clean up inline styles so it doesn't affect other tests
    document.documentElement.style.fontSize = '';
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
    component.openLogin();
    expect(dialogSpy.open).toHaveBeenCalled();
    const args = dialogSpy.open.mock.calls[0];
    expect(args[1]?.width).toBe('400px');
  });

  it('should change root html font size when calling changeFontSize', () => {
    // Initial size is typically 16px if not set, let's explicitly set it for testing
    document.documentElement.style.fontSize = '14px';
    
    component.changeFontSize('increase');
    expect(document.documentElement.style.fontSize).toBe('16px');

    component.changeFontSize('decrease');
    expect(document.documentElement.style.fontSize).toBe('14px');

    component.changeFontSize('reset');
    expect(document.documentElement.style.fontSize).toBe('');
  });

  it('should show coming soon dialog with correct feature data', () => {
    const dummyEvent = new Event('click');
    component.showComingSoon('TestFeature', dummyEvent);
    
    expect(dialogSpy.open).toHaveBeenCalled();
    const args = dialogSpy.open.mock.calls[0];
    expect(args[1]?.data).toEqual({ feature: 'TestFeature' });
  });
});
