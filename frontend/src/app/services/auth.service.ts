import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  roleSelected?: boolean;
  kycStatus?: string;
}

interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Restore user from saved data on page load
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => {
          this.saveToken(response.token);
          this.saveUser(response.user);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          this.saveToken(response.token);
          this.saveUser(response.user);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  private saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  private saveUser(user: User) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  loginWithToken(token: string): Observable<void> {
    this.saveToken(token);
    return this.http.get<any>(`${this.apiUrl}/profile`).pipe(
      tap((user) => {
        this.saveUser(user);
        this.currentUserSubject.next(user);
      }),
    ) as any;
  }

  loginWithGoogle(): void {
    window.location.href = `${this.apiUrl}/google`;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
