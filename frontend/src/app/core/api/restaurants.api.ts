import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';
import { AvailabilityResponse, RestaurantCard, RestaurantDetail } from '../models';

@Injectable({ providedIn: 'root' })
export class RestaurantsApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE}/restaurants`;

  search(opts: { q?: string; cuisine?: string; sort?: 'rating' | 'name' } = {}): Observable<RestaurantCard[]> {
    let params = new HttpParams();
    if (opts.q) params = params.set('q', opts.q);
    if (opts.cuisine) params = params.set('cuisine', opts.cuisine);
    if (opts.sort) params = params.set('sort', opts.sort);
    return this.http.get<RestaurantCard[]>(this.base, { params });
  }

  detail(slug: string): Observable<RestaurantDetail> {
    return this.http.get<RestaurantDetail>(`${this.base}/${slug}`);
  }

  availability(slug: string, opts: { date?: string; party: number; area?: string }): Observable<AvailabilityResponse> {
    let params = new HttpParams().set('party', String(opts.party));
    if (opts.date) params = params.set('date', opts.date);
    if (opts.area) params = params.set('area', opts.area);
    return this.http.get<AvailabilityResponse>(`${this.base}/${slug}/availability`, { params });
  }
}
