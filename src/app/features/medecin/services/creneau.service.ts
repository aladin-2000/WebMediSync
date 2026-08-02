import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../core/models/user.model';
import { CreneauResponse, PlageCreneauxRequest } from '../models/disponibilite.models';

@Injectable({
  providedIn: 'root',
})
export class CreneauService {
  private readonly baseUrl = `${API_BASE_URL}/medecins/creneaux`;

  constructor(private http: HttpClient) {}

  ajouterPlage(medecinId: string, body: PlageCreneauxRequest): Observable<ApiResponse<CreneauResponse[]>> {
    return this.http.post<ApiResponse<CreneauResponse[]>>(
      `${this.baseUrl}/ajouter-une-plage-de-creneaux?medecinId=${medecinId}`,
      body
    );
  }

  supprimerPlage(medecinId: string, body: PlageCreneauxRequest): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.baseUrl}/supprimer-une-plage-de-creneaux?medecinId=${medecinId}`,
      { body }
    );
  }

  getPeriode(medecinId: string, dateDebut: string, dateFin: string): Observable<ApiResponse<CreneauResponse[]>> {
    return this.http.get<ApiResponse<CreneauResponse[]>>(
      `${this.baseUrl}/periode?medecinId=${medecinId}&dateDebut=${dateDebut}&dateFin=${dateFin}`
    );
  }
}