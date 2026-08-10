import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiResponse } from '../models/user.model';
import { LaboratoireResponse } from '../models/laboratoire.model';

@Injectable({
  providedIn: 'root',
})
export class LaboratoireService {
  private readonly baseUrl = `${API_BASE_URL}/api/laboratoires`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<LaboratoireResponse[]>> {
    return this.http.get<ApiResponse<LaboratoireResponse[]>>(this.baseUrl);
  }
}
