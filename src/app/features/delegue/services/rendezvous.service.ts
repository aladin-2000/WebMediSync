import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../core/models/user.model';
import { RendezVousResponse, ReserverRendezVousRequest } from '../models/rendezvous.model';

@Injectable({
  providedIn: 'root',
})
export class RendezVousService {
  private readonly baseUrl = `${API_BASE_URL}/api/rendezvous`;

  constructor(private http: HttpClient) {}

  reserver(body: ReserverRendezVousRequest): Observable<ApiResponse<RendezVousResponse>> {
    return this.http.post<ApiResponse<RendezVousResponse>>(this.baseUrl, body);
  }

  annulerDelegue(id: string): Observable<ApiResponse<RendezVousResponse>> {
    return this.http.patch<ApiResponse<RendezVousResponse>>(`${this.baseUrl}/${id}/annuler-delegue`, {});
  }

  marquerRealise(id: string): Observable<ApiResponse<RendezVousResponse>> {
    return this.http.patch<ApiResponse<RendezVousResponse>>(`${this.baseUrl}/${id}/realise`, {});
  }

  marquerAbsent(id: string): Observable<ApiResponse<RendezVousResponse>> {
    return this.http.patch<ApiResponse<RendezVousResponse>>(`${this.baseUrl}/${id}/absent`, {});
  }

  listeJour(delegueId: string, date: string): Observable<ApiResponse<RendezVousResponse[]>> {
    return this.http.get<ApiResponse<RendezVousResponse[]>>(
      `${this.baseUrl}/delegue/${delegueId}/jour?date=${date}`
    );
  }

  listeSemaine(delegueId: string, semaine?: string): Observable<ApiResponse<RendezVousResponse[]>> {
    const query = semaine ? `?semaine=${semaine}` : '';
    return this.http.get<ApiResponse<RendezVousResponse[]>>(
      `${this.baseUrl}/delegue/${delegueId}/semaine${query}`
    );
  }
}
