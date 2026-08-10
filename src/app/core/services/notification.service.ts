import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiResponse } from '../models/user.model';
import { NotificationResponse } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly baseUrl = `${API_BASE_URL}/api/notifications`;

  constructor(private http: HttpClient) {}

  getMesNotifications(): Observable<ApiResponse<NotificationResponse[]>> {
    return this.http.get<ApiResponse<NotificationResponse[]>>(this.baseUrl);
  }

  getNombreNonLues(): Observable<ApiResponse<{ nombre: number }>> {
    return this.http.get<ApiResponse<{ nombre: number }>>(`${this.baseUrl}/non-lues/nombre`);
  }

  marquerLue(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${id}/lue`, {});
  }

  marquerToutesLues(): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/lues`, {});
  }
}
