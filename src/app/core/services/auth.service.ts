import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiResponse, LoginResponse, Role, UserResponse } from '../models/user.model';

const TOKEN_STORAGE_KEY = 'authToken';
const USER_STORAGE_KEY = 'currentUser';
const MEDECIN_ID_STORAGE_KEY = 'medecinId';
const DELEGUE_ID_STORAGE_KEY = 'delegueId';
const LABORATOIRE_ID_STORAGE_KEY = 'laboratoireId';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string | null = localStorage.getItem(TOKEN_STORAGE_KEY);
  private currentUser: UserResponse | null = this.readStoredUser();
  private medecinId: string | null = localStorage.getItem(MEDECIN_ID_STORAGE_KEY);
  private delegueId: string | null = localStorage.getItem(DELEGUE_ID_STORAGE_KEY);
  private laboratoireId: string | null = localStorage.getItem(LABORATOIRE_ID_STORAGE_KEY);

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

  verifierEmail(token: string): Observable<ApiResponse<null>> {
    return this.http.get<ApiResponse<null>>(`${API_BASE_URL}/auth/verifier-email`, { params: { token } });
  }

  renvoyerVerification(email: string): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${API_BASE_URL}/auth/renvoyer-verification`, { email });
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

  setDelegueId(delegueId: string): void {
    localStorage.setItem(DELEGUE_ID_STORAGE_KEY, delegueId);
    this.delegueId = delegueId;
  }

  getDelegueId(): string | null {
    return this.delegueId;
  }

  setLaboratoireId(laboratoireId: string): void {
    localStorage.setItem(LABORATOIRE_ID_STORAGE_KEY, laboratoireId);
    this.laboratoireId = laboratoireId;
  }

  getLaboratoireId(): string | null {
    return this.laboratoireId;
  }

  logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(MEDECIN_ID_STORAGE_KEY);
    localStorage.removeItem(DELEGUE_ID_STORAGE_KEY);
    localStorage.removeItem(LABORATOIRE_ID_STORAGE_KEY);
    this.token = null;
    this.currentUser = null;
    this.medecinId = null;
    this.delegueId = null;
    this.laboratoireId = null;
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
