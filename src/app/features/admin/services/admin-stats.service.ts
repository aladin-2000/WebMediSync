import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../core/models/user.model';
import { DashboardCounts, StatsVisitesDelegue, StatsVisitesLabo } from '../models/stats.model';

@Injectable({ providedIn: 'root' })
export class AdminStatsService {
  private readonly baseUrl = `${API_BASE_URL}/api/admin/stats`;

  constructor(private http: HttpClient) {}

  getDashboardCounts(): Observable<ApiResponse<DashboardCounts>> {
    return this.http.get<ApiResponse<DashboardCounts>>(`${this.baseUrl}/dashboard`);
  }

  getVisitesParLaboratoire(mois?: number, annee?: number): Observable<ApiResponse<StatsVisitesLabo[]>> {
    return this.http.get<ApiResponse<StatsVisitesLabo[]>>(
      `${this.baseUrl}/visites/par-laboratoire`, { params: this.buildPeriodParams(mois, annee) }
    );
  }

  getVisitesParDelegue(mois?: number, annee?: number): Observable<ApiResponse<StatsVisitesDelegue[]>> {
    return this.http.get<ApiResponse<StatsVisitesDelegue[]>>(
      `${this.baseUrl}/visites/par-delegue`, { params: this.buildPeriodParams(mois, annee) }
    );
  }

  getVisitesParDelegueForLabo(laboId: string, mois?: number, annee?: number): Observable<ApiResponse<StatsVisitesDelegue[]>> {
    return this.http.get<ApiResponse<StatsVisitesDelegue[]>>(
      `${this.baseUrl}/visites/par-delegue/laboratoire/${laboId}`, { params: this.buildPeriodParams(mois, annee) }
    );
  }

  private buildPeriodParams(mois?: number, annee?: number): HttpParams {
    let params = new HttpParams();
    if (mois != null) params = params.set('mois', mois);
    if (annee != null) params = params.set('annee', annee);
    return params;
  }
}
