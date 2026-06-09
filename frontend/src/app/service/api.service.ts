import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5220/api'; // .NET backend default URL

  constructor(private http: HttpClient) { }

  private _userId: number | null = null;
  public authState = new BehaviorSubject<boolean>(this.getUserId() !== null);

  setUserId(id: number, username: string, fullName: string, isAdmin: boolean = false) {
    this._userId = id;
    localStorage.setItem('userId', id.toString());
    localStorage.setItem('username', username);
    localStorage.setItem('fullName', fullName);
    if (isAdmin) localStorage.setItem('isAdmin', 'true');
    this.authState.next(true);
  }

  getUserId(): number | null {
    if (this._userId) return this._userId;
    const stored = localStorage.getItem('userId');
    if (stored) {
      this._userId = parseInt(stored, 10);
      return this._userId;
    }
    return null;
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getFullName(): string | null {
    return localStorage.getItem('fullName');
  }

  logout() {
    this._userId = null;
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('fullName');
    localStorage.removeItem('isAdmin');
    this.authState.next(false);
  }

  isAdmin(): boolean {
    return localStorage.getItem('isAdmin') === 'true';
  }

  // Auth Endpoints
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Auth/login`, credentials);
  }

  register(details: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Auth/register`, details);
  }

  // Station Endpoints
  getStations(query: string = ''): Observable<any[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<any[]>(`${this.baseUrl}/Station`, { params });
  }

  // Train Endpoints
  searchTrains(sourceId: number, destId: number, date: string): Observable<any[]> {
    const params = new HttpParams()
      .set('sourceStationId', sourceId.toString())
      .set('destinationStationId', destId.toString())
      .set('date', date);
      
    return this.http.get<any[]>(`${this.baseUrl}/Train/search`, { params });
  }

  lookupTrains(query: string): Observable<any[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<any[]>(`${this.baseUrl}/Train/lookup`, { params });
  }

  getTrainSchedule(trainNumber: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Train/schedule/${trainNumber}`);
  }

  // Ticket Endpoints
  bookTicket(trainId: number, passengerName: string, passengerAge: number, paymentId?: string): Observable<any> {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not logged in');
    return this.http.post(`${this.baseUrl}/Ticket/book`, { userId, trainId, passengerName, passengerAge, paymentId });
  }

  getPnrStatus(pnr: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/Ticket/pnr/${pnr}`);
  }

  cancelTicket(pnr: string): Observable<any> {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not logged in');
    return this.http.post(`${this.baseUrl}/Ticket/cancel/${pnr}`, userId);
  }

  getUserTickets(): Observable<any[]> {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not logged in');
    return this.http.get<any[]>(`${this.baseUrl}/Ticket/user/${userId}`);
  }

  // Wallet Endpoints
  getWalletBalance(): Observable<any> {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not logged in');
    return this.http.get(`${this.baseUrl}/Wallet/${userId}`);
  }

  addWalletFunds(amount: number): Observable<any> {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not logged in');
    return this.http.post(`${this.baseUrl}/Wallet/add`, { userId, amount });
  }

  // Meal Endpoints
  getMealMenu(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Meal/menu`);
  }

  orderMeal(pnr: string, mealId: number, quantity: number, paymentId?: string): Observable<any> {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not logged in');
    return this.http.post(`${this.baseUrl}/Meal/order`, { pnr, mealId, quantity, userId, paymentId });
  }

  getMealOrders(pnr: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Meal/orders/${pnr}`);
  }

  // Admin Endpoints
  getAdminStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/Admin/dashboard?adminUserId=${this.getUserId()}`);
  }

  getAdminPantryOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Admin/pantry?adminUserId=${this.getUserId()}`);
  }

  getAllTrains(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Admin/trains?adminUserId=${this.getUserId()}`);
  }

  addTrain(train: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Admin/trains?adminUserId=${this.getUserId()}`, train);
  }

  deleteTrain(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Admin/trains/${id}?adminUserId=${this.getUserId()}`);
  }

  getAllTickets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Admin/tickets?adminUserId=${this.getUserId()}`);
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Admin/users?adminUserId=${this.getUserId()}`);
  }
}
