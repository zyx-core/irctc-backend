import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:5220/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get and set user id correctly using localStorage', () => {
    service.setUserId(123);
    expect(service.getUserId()).toBe(123);
    expect(localStorage.getItem('userId')).toBe('123');
    
    // Test logging out
    service.logout();
    expect(service.getUserId()).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
  });

  it('should fetch stations', () => {
    const dummyStations = [{ id: 1, name: 'Delhi', code: 'DEL' }, { id: 2, name: 'Mumbai', code: 'BOM' }];

    service.getStations('Del').subscribe(stations => {
      expect(stations.length).toBe(2);
      expect(stations).toEqual(dummyStations);
    });

    const req = httpMock.expectOne(`${baseUrl}/Station?query=Del`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyStations);
  });

  it('should search trains', () => {
    const dummyTrains = [{ id: 101, name: 'Rajdhani', number: '12345' }];
    const dateStr = '2026-06-06T12:00:00.000Z';

    service.searchTrains(1, 2, dateStr).subscribe(trains => {
      expect(trains.length).toBe(1);
      expect(trains).toEqual(dummyTrains);
    });

    const req = httpMock.expectOne(`${baseUrl}/Train/search?sourceStationId=1&destinationStationId=2&date=${dateStr}`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyTrains);
  });

  it('should login and return user details', () => {
    const credentials = { username: 'testuser', password: 'password123' };
    const dummyResponse = { id: 1, username: 'testuser', token: 'fake-jwt' };

    service.login(credentials).subscribe(res => {
      expect(res).toEqual(dummyResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/Auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush(dummyResponse);
  });

  it('should throw error when booking without login', () => {
    expect(() => service.bookTicket(1, 'John Doe', 30)).toThrowError('User not logged in');
  });

  it('should allow booking when logged in', () => {
    service.setUserId(99);
    const dummyRes = { success: true, pnr: '1234567890' };

    service.bookTicket(101, 'John Doe', 30).subscribe(res => {
      expect(res).toEqual(dummyRes);
    });

    const req = httpMock.expectOne(`${baseUrl}/Ticket/book`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ userId: 99, trainId: 101, passengerName: 'John Doe', passengerAge: 30 });
    req.flush(dummyRes);
  });
});
