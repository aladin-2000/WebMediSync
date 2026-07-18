import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiResponse, Role, UserResponse } from '../models/user.model';

const STORAGE_KEY = 'currentUser';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly currentUser = signal<UserResponse | null>(this.readStoredUser());

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<ApiResponse<UserResponse>> {
    return this.http.post<ApiResponse<UserResponse>>(`${API_BASE_URL}/auth/login`, { email, password });
  }

  setCurrentUser(user: UserResponse): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  getCurrentUser(): UserResponse | null {
    return this.currentUser();
  }

  get currentUserRole(): Role | null {
    return this.currentUser()?.role ?? null;
  }

  private readStoredUser(): UserResponse | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as UserResponse;
    } catch {
      return null;
    }
  }
}
