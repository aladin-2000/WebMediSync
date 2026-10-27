import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../core/models/user.model';
import {
  AdminCreerDelegueRequest,
  AdminUpdateDelegueRequest,
  CreerDelegueLaboRequest,
  DelegueResponse,
  InscriptionDelegueRequest,
  ModifierDelegueRequest,
} from '../models/delegue.model';

@Injectable({
  providedIn: 'root',
})
export class DelegueService {
  private readonly baseUrl = `${API_BASE_URL}/api/delegues`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<DelegueResponse[]>> {
    return this.http.get<ApiResponse<DelegueResponse[]>>(this.baseUrl);
  }

  inscrire(body: InscriptionDelegueRequest): Observable<ApiResponse<DelegueResponse>> {
    return this.http.post<ApiResponse<DelegueResponse>>(`${this.baseUrl}/inscription`, body);
  }

  getByUserId(userId: string): Observable<ApiResponse<DelegueResponse>> {
    return this.http.get<ApiResponse<DelegueResponse>>(`${this.baseUrl}/by-user/${userId}`);
  }

  updateMonProfil(body: ModifierDelegueRequest): Observable<ApiResponse<DelegueResponse>> {
    return this.http.put<ApiResponse<DelegueResponse>>(`${this.baseUrl}/mon-profil`, body);
  }

  getByLaboratoire(laboratoireId: string): Observable<ApiResponse<DelegueResponse[]>> {
    return this.http.get<ApiResponse<DelegueResponse[]>>(`${this.baseUrl}/laboratoire/${laboratoireId}`);
  }

  creerDelegueComplet(body: CreerDelegueLaboRequest): Observable<ApiResponse<DelegueResponse>> {
    return this.http.post<ApiResponse<DelegueResponse>>(`${this.baseUrl}/creer-delegue-complet`, body);
  }

  desactiver(id: string): Observable<ApiResponse<DelegueResponse>> {
    return this.http.patch<ApiResponse<DelegueResponse>>(`${this.baseUrl}/${id}/desactiver`, {});
  }

  activer(id: string): Observable<ApiResponse<DelegueResponse>> {
    return this.http.patch<ApiResponse<DelegueResponse>>(`${this.baseUrl}/${id}/activer`, {});
  }

  adminUpdate(id: string, body: AdminUpdateDelegueRequest): Observable<ApiResponse<DelegueResponse>> {
    return this.http.put<ApiResponse<DelegueResponse>>(`${this.baseUrl}/${id}`, body);
  }

  adminCreer(body: AdminCreerDelegueRequest): Observable<ApiResponse<DelegueResponse>> {
    return this.http.post<ApiResponse<DelegueResponse>>(`${this.baseUrl}/admin-creer`, body);
  }

  adminActiver(id: string, laboratoireId: string): Observable<ApiResponse<DelegueResponse>> {
    return this.http.patch<ApiResponse<DelegueResponse>>(
      `${this.baseUrl}/${id}/admin-activer`, { laboratoireId }
    );
  }
}
