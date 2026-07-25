import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiResponse, LoginResponse, Role, UserResponse } from '../models/user.model';

const TOKEN_STORAGE_KEY = 'authToken';
const USER_STORAGE_KEY = 'currentUser';
const MEDECIN_ID_STORAGE_KEY = 'medecinId';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string | null = localStorage.getItem(TOKEN_STORAGE_KEY);
  private currentUser: UserResponse | null = this.readStoredUser();
  private medecinId: string | null = localStorage.getItem(MEDECIN_ID_STORAGE_KEY);

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${API_BASE_URL}/auth/login`, { email, password });
  }

  me(): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(`${API_BASE_URL}/auth/me`).pipe(
      tap((response) => {
        if (response.success) {
          this.setCurrentUser(response.data);
        }
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${API_BASE_URL}/auth/changer-mot-de-passe`, {
      currentPassword,
      newPassword,
    }).pipe(
      tap((response) => {
        if (response.success && this.currentUser) {
          this.setCurrentUser({ ...this.currentUser, mustChangePassword: false });
        }
      })
    );
  }

  setSession(token: string, user: UserResponse): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    this.token = token;
    this.setCurrentUser(user);
  }

  setCurrentUser(user: UserResponse): void {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    this.currentUser = user;
  }

  setMedecinId(medecinId: string): void {
    localStorage.setItem(MEDECIN_ID_STORAGE_KEY, medecinId);
    this.medecinId = medecinId;
  }

  getMedecinId(): string | null {
    return this.medecinId;
  }

  logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(MEDECIN_ID_STORAGE_KEY);
    this.token = null;
    this.currentUser = null;
    this.medecinId = null;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  getCurrentUser(): UserResponse | null {
    return this.currentUser;
  }

  get currentUserRole(): Role | null {
    return this.currentUser?.role ?? null;
  }

  get mustChangePassword(): boolean {
    return this.currentUser?.mustChangePassword ?? false;
  }

  private readStoredUser(): UserResponse | null {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
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
