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

  annulerMedecin(id: string, motifAnnulation: string): Observable<ApiResponse<RendezVousResponse>> {
    return this.http.patch<ApiResponse<RendezVousResponse>>(`${this.baseUrl}/${id}/annuler-medecin`, {
      motifAnnulation,
    });
  }

  marquerRealiseDelegue(id: string): Observable<ApiResponse<RendezVousResponse>> {
    return this.http.patch<ApiResponse<RendezVousResponse>>(`${this.baseUrl}/${id}/realise-delegue`, {});
  }

  marquerRealiseMedecin(id: string): Observable<ApiResponse<RendezVousResponse>> {
    return this.http.patch<ApiResponse<RendezVousResponse>>(`${this.baseUrl}/${id}/realise-medecin`, {});
  }

  /** Appelé par le DELEGUE : constate que le médecin ne s'est pas présenté. */
  marquerAbsentMedecin(id: string): Observable<ApiResponse<RendezVousResponse>> {
    return this.http.patch<ApiResponse<RendezVousResponse>>(`${this.baseUrl}/${id}/absent-medecin`, {});
  }

  /** Appelé par le MEDECIN : constate que le délégué ne s'est pas présenté. */
  marquerAbsentDelegue(id: string): Observable<ApiResponse<RendezVousResponse>> {
    return this.http.patch<ApiResponse<RendezVousResponse>>(`${this.baseUrl}/${id}/absent-delegue`, {});
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

  listeMedecin(medecinId: string): Observable<ApiResponse<RendezVousResponse[]>> {
    return this.http.get<ApiResponse<RendezVousResponse[]>>(`${this.baseUrl}/medecin/${medecinId}`);
  }

  listeMedecinJour(medecinId: string, date: string): Observable<ApiResponse<RendezVousResponse[]>> {
    return this.http.get<ApiResponse<RendezVousResponse[]>>(
      `${this.baseUrl}/medecin/${medecinId}/jour?date=${date}`
    );
  }

  listeMedecinSemaine(medecinId: string, semaine?: string): Observable<ApiResponse<RendezVousResponse[]>> {
    const query = semaine ? `?semaine=${semaine}` : '';
    return this.http.get<ApiResponse<RendezVousResponse[]>>(
      `${this.baseUrl}/medecin/${medecinId}/semaine${query}`
    );
  }
}
