import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://localhost:7243/api/Auth';
  
  // Angular signal for reactive current user state
  currentUser = signal<User | null>(this.getUserFromStorage());
 private platformId = inject(PLATFORM_ID);
  constructor(private http: HttpClient, private router: Router) {}

  register(data: { username: string; email: string; password: string }) {
    return this.http.post<User>(`${this.apiUrl}/register`, data).pipe(
      tap(user => this.setUser(user))
    );
  }

  login(data: { email: string; password: string }) {
    return this.http.post<User>(`${this.apiUrl}/login`, data).pipe(
      tap(user => this.setUser(user))
    );
  }

  logout() {
    localStorage.removeItem('chatUser');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.currentUser()?.token ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  private setUser(user: User) {
    localStorage.setItem('chatUser', JSON.stringify(user));
    this.currentUser.set(user);
  }

  private getUserFromStorage(): User | null {
  if (isPlatformBrowser(inject(PLATFORM_ID))) {
      const stored = localStorage.getItem('chatUser');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  }
}