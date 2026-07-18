import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../core/models/user.model';
import { CreerMedecinRequest, MedecinResponse, ModifierMedecinRequest } from '../models/medecin.model';

@Injectable({
  providedIn: 'root',
})
export class MedecinService {
  private readonly baseUrl = `${API_BASE_URL}/medecins`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<MedecinResponse[]>> {
    return this.http.get<ApiResponse<MedecinResponse[]>>(this.baseUrl);
  }

  create(body: CreerMedecinRequest): Observable<ApiResponse<MedecinResponse>> {
    return this.http.post<ApiResponse<MedecinResponse>>(`${this.baseUrl}/creer-medecin-complet`, body);
  }

  update(id: string, body: ModifierMedecinRequest): Observable<ApiResponse<MedecinResponse>> {
    return this.http.put<ApiResponse<MedecinResponse>>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
