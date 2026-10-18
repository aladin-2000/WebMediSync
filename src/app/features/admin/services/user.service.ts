import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../core/models/user.model';
import { PageResponse, UserDetailResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserAdminService {
  private readonly baseUrl = `${API_BASE_URL}/users`;

  constructor(private http: HttpClient) {}

  getListe(page: number, size: number, role?: string, search?: string): Observable<ApiResponse<PageResponse<UserDetailResponse>>> {
    let query = `page=${page}&size=${size}`;
    if (role) {
      query += `&role=${encodeURIComponent(role)}`;
    }
    if (search) {
      query += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get<ApiResponse<PageResponse<UserDetailResponse>>>(`${this.baseUrl}/liste?${query}`);
  }

  activer(id: string): Observable<ApiResponse<UserDetailResponse>> {
    return this.http.patch<ApiResponse<UserDetailResponse>>(`${this.baseUrl}/${id}/activer`, {});
  }

  desactiver(id: string): Observable<ApiResponse<UserDetailResponse>> {
    return this.http.patch<ApiResponse<UserDetailResponse>>(`${this.baseUrl}/${id}/desactiver`, {});
  }
}
