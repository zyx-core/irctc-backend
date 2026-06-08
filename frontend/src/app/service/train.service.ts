import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Station {
  id: number;
  code: string;
  name: string;
}

export interface Train {
  id: number;
  number: string;
  name: string;
  sourceStationId: number;
  destinationStationId: number;
  departureTime: string;
  arrivalTime: string;
  sourceStation: Station;
  destinationStation: Station;
}

@Injectable({
  providedIn: 'root'
})
export class TrainService {
  private apiUrl = 'http://localhost:5220/api';

  constructor(private http: HttpClient) { }

  getStations(query: string = ''): Observable<Station[]> {
    return this.http.get<Station[]>(`${this.apiUrl}/station?query=${query}`);
  }

  searchTrains(sourceId: number, destId: number, date: string): Observable<Train[]> {
    let params = new HttpParams()
      .set('sourceStationId', sourceId.toString())
      .set('destinationStationId', destId.toString())
      .set('date', date);

    return this.http.get<Train[]>(`${this.apiUrl}/train/search`, { params });
  }
}
