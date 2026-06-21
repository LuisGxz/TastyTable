import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';
import { MyReservations, ReservationView } from '../models';

export interface CreateReservationRequest {
  restaurantId: string;
  date: string;
  time: string;
  partySize: number;
  seatingArea?: string;
}

@Injectable({ providedIn: 'root' })
export class ReservationsApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE}/reservations`;

  create(req: CreateReservationRequest): Observable<ReservationView> {
    return this.http.post<ReservationView>(this.base, req);
  }
  mine(): Observable<MyReservations> {
    return this.http.get<MyReservations>(`${this.base}/me`);
  }
  cancel(id: string): Observable<ReservationView> {
    return this.http.patch<ReservationView>(`${this.base}/${id}/cancel`, {});
  }
}
