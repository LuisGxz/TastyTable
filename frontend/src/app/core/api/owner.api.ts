import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';
import { OwnerRestaurant, ReservationView, TableSpec } from '../models';

@Injectable({ providedIn: 'root' })
export class OwnerApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE}/owner`;

  restaurant(): Observable<OwnerRestaurant> {
    return this.http.get<OwnerRestaurant>(`${this.base}/restaurant`);
  }
  reservations(): Observable<ReservationView[]> {
    return this.http.get<ReservationView[]>(`${this.base}/reservations`);
  }
  addTable(table: TableSpec): Observable<OwnerRestaurant> {
    return this.http.post<OwnerRestaurant>(`${this.base}/tables`, table);
  }
  updateTable(label: string, table: TableSpec): Observable<OwnerRestaurant> {
    return this.http.patch<OwnerRestaurant>(`${this.base}/tables/${label}`, table);
  }
  removeTable(label: string): Observable<OwnerRestaurant> {
    return this.http.delete<OwnerRestaurant>(`${this.base}/tables/${label}`);
  }
}
