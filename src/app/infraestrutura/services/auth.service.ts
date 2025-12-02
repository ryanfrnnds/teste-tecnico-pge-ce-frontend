import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface AuthUser {
  id: number;
  username: string;
  name: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'teste-pge-token';
  private readonly userKey = 'teste-pge-user';
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  login(credentials: AuthCredentials): Observable<AuthUser> {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap((response) => {
        this.saveSession(response);
      }),
      map((response) => response.user)
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  get usuario(): AuthUser | null {
    return this.userSubject.value;
  }

  private restoreSession(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userJson = localStorage.getItem(this.userKey);
    if (token && userJson) {
      try {
        const parsed = JSON.parse(userJson) as AuthUser;
        this.userSubject.next(parsed);
      } catch {
        localStorage.removeItem(this.userKey);
        this.userSubject.next(null);
      }
    }
  }

  private saveSession(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.userSubject.next(response.user);
  }
}

