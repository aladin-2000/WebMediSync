import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentRole: 'medecin' | 'delegue' | null = null;

  constructor() {}

  login(username: string, pass: string): boolean {
    if (username === 'medecin' && pass === 'medecin') {
      this.currentRole = 'medecin';
      return true;
    }
    if (username === 'delegue' && pass === 'delegue') {
      this.currentRole = 'delegue';
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentRole = null;
  }

  isAuthenticated(): boolean {
    return this.currentRole !== null;
  }

  get currentUserRole(): 'medecin' | 'delegue' | null {
    return this.currentRole;
  }
}
