import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../core/models/user.model';
import { DelegueResponse, ModifierDelegueRequest } from '../models/delegue.model';

@Injectable({
  providedIn: 'root',
})
export class DelegueService {
  private readonly baseUrl = `${API_BASE_URL}/api/delegues`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<DelegueResponse[]>> {
    return this.http.get<ApiResponse<DelegueResponse[]>>(this.baseUrl);
  }

  getByUserId(userId: string): Observable<ApiResponse<DelegueResponse>> {
    return this.http.get<ApiResponse<DelegueResponse>>(`${this.baseUrl}/by-user/${userId}`);
  }

  updateMonProfil(body: ModifierDelegueRequest): Observable<ApiResponse<DelegueResponse>> {
    return this.http.put<ApiResponse<DelegueResponse>>(`${this.baseUrl}/mon-profil`, body);
  }
}
