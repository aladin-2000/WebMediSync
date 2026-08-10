import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../core/models/user.model';
import { CreerMedecinRequest, MedecinResponse, ModifierMedecinRequest, SpecialiteOption } from '../models/medecin.model';

@Injectable({
  providedIn: 'root',
})
export class MedecinService {
  private readonly baseUrl = `${API_BASE_URL}/medecins`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<MedecinResponse[]>> {
    return this.http.get<ApiResponse<MedecinResponse[]>>(this.baseUrl);
  }

  getByUserId(userId: string): Observable<ApiResponse<MedecinResponse>> {
    return this.http.get<ApiResponse<MedecinResponse>>(`${this.baseUrl}/by-user/${userId}`);
  }

  rechercher(params: {
    date: string;
    nom?: string;
    specialites?: string[];
    heureDebut?: string;
    heureFin?: string;
  }): Observable<ApiResponse<MedecinResponse[]>> {
    let query = `date=${encodeURIComponent(params.date)}`;
    if (params.nom) {
      query += `&nom=${encodeURIComponent(params.nom)}`;
    }
    if (params.specialites && params.specialites.length > 0) {
      query += `&specialites=${encodeURIComponent(params.specialites.join(','))}`;
    }
    if (params.heureDebut) {
      query += `&heureDebut=${encodeURIComponent(params.heureDebut)}`;
    }
    if (params.heureFin) {
      query += `&heureFin=${encodeURIComponent(params.heureFin)}`;
    }
    return this.http.get<ApiResponse<MedecinResponse[]>>(`${this.baseUrl}/recherche?${query}`);
  }

  getSpecialites(): Observable<ApiResponse<SpecialiteOption[]>> {
    return this.http.get<ApiResponse<SpecialiteOption[]>>(`${this.baseUrl}/specialites`);
  }

  create(body: CreerMedecinRequest): Observable<ApiResponse<MedecinResponse>> {
    return this.http.post<ApiResponse<MedecinResponse>>(`${this.baseUrl}/creer-medecin-complet`, body);
  }

  update(id: string, body: ModifierMedecinRequest): Observable<ApiResponse<MedecinResponse>> {
    return this.http.put<ApiResponse<MedecinResponse>>(`${this.baseUrl}/${id}`, body);
  }

  updateMonProfil(body: ModifierMedecinRequest): Observable<ApiResponse<MedecinResponse>> {
    return this.http.put<ApiResponse<MedecinResponse>>(`${this.baseUrl}/mon-profil`, body);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
