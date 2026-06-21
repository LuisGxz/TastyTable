import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE } from '../config';
import { AuthResult, AuthUser, UserRole } from '../models';

const ACCESS_KEY = 'tt-access';
const REFRESH_KEY = 'tt-refresh';
const USER_KEY = 'tt-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE}/auth`;

  private accessToken: string | null = this.read(ACCESS_KEY);
  private refreshToken: string | null = this.read(REFRESH_KEY);
  private readonly _user = signal<AuthUser | null>(this.readUser());

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly role = computed<UserRole | null>(() => this._user()?.role ?? null);

  hasTokens(): boolean { return !!this.accessToken; }
  getAccessToken(): string | null { return this.accessToken; }
  getRefreshToken(): string | null { return this.refreshToken; }

  login(email: string, password: string): Observable<AuthResult> {
    return this.http.post<AuthResult>(`${this.base}/login`, { email, password }).pipe(tap((r) => this.apply(r)));
  }
  register(email: string, password: string, name: string, role?: UserRole): Observable<AuthResult> {
    return this.http.post<AuthResult>(`${this.base}/register`, { email, password, name, role }).pipe(tap((r) => this.apply(r)));
  }
  refresh(): Observable<AuthResult> {
    return this.http.post<AuthResult>(`${this.base}/refresh`, { refreshToken: this.refreshToken }).pipe(tap((r) => this.apply(r)));
  }
  logout(): void {
    if (this.refreshToken) {
      this.http.post(`${this.base}/logout`, { refreshToken: this.refreshToken }).subscribe({ error: () => {} });
    }
    this.clear();
  }

  private apply(r: AuthResult): void {
    this.accessToken = r.accessToken;
    this.refreshToken = r.refreshToken;
    this.write(ACCESS_KEY, r.accessToken);
    this.write(REFRESH_KEY, r.refreshToken);
    this.write(USER_KEY, JSON.stringify(r.user));
    this._user.set(r.user);
  }
  clear(): void {
    this.accessToken = null; this.refreshToken = null; this._user.set(null);
    this.remove(ACCESS_KEY); this.remove(REFRESH_KEY); this.remove(USER_KEY);
  }

  private read(k: string): string | null { try { return localStorage.getItem(k); } catch { return null; } }
  private readUser(): AuthUser | null {
    try { const raw = localStorage.getItem(USER_KEY); return raw ? (JSON.parse(raw) as AuthUser) : null; } catch { return null; }
  }
  private write(k: string, v: string): void { try { localStorage.setItem(k, v); } catch { /* ignore */ } }
  private remove(k: string): void { try { localStorage.removeItem(k); } catch { /* ignore */ } }
}
