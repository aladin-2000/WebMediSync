import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../core/models/user.model';
import { EtablissementRequest, EtablissementResponse } from '../models/etablissement.model';

@Injectable({
  providedIn: 'root',
})
export class EtablissementService {
  private readonly baseUrl = `${API_BASE_URL}/etablissements`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<EtablissementResponse[]>> {
    return this.http.get<ApiResponse<EtablissementResponse[]>>(this.baseUrl);
  }

  create(body: EtablissementRequest): Observable<ApiResponse<EtablissementResponse>> {
    return this.http.post<ApiResponse<EtablissementResponse>>(this.baseUrl, body);
  }

  update(id: string, body: EtablissementRequest): Observable<ApiResponse<EtablissementResponse>> {
    return this.http.put<ApiResponse<EtablissementResponse>>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
