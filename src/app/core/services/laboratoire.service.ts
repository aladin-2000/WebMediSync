import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiResponse } from '../models/user.model';
import {
  CreateLaboratoireCompletRequest,
  InscriptionLaboratoireRequest,
  LaboratoireResponse,
} from '../models/laboratoire.model';

@Injectable({
  providedIn: 'root',
})
export class LaboratoireService {
  private readonly baseUrl = `${API_BASE_URL}/api/laboratoires`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<LaboratoireResponse[]>> {
    return this.http.get<ApiResponse<LaboratoireResponse[]>>(this.baseUrl);
  }

  getByUserId(userId: string): Observable<ApiResponse<LaboratoireResponse>> {
    return this.http.get<ApiResponse<LaboratoireResponse>>(`${this.baseUrl}/by-user/${userId}`);
  }

  inscrire(body: InscriptionLaboratoireRequest): Observable<ApiResponse<LaboratoireResponse>> {
    return this.http.post<ApiResponse<LaboratoireResponse>>(`${this.baseUrl}/inscription`, body);
  }

  creerLaboratoireComplet(body: CreateLaboratoireCompletRequest): Observable<ApiResponse<LaboratoireResponse>> {
    return this.http.post<ApiResponse<LaboratoireResponse>>(`${this.baseUrl}/creer-labo-complet`, body);
  }

  activer(id: string): Observable<ApiResponse<LaboratoireResponse>> {
    return this.http.patch<ApiResponse<LaboratoireResponse>>(`${this.baseUrl}/${id}/activer`, {});
  }

  desactiver(id: string): Observable<ApiResponse<LaboratoireResponse>> {
    return this.http.patch<ApiResponse<LaboratoireResponse>>(`${this.baseUrl}/${id}/desactiver`, {});
  }
}
